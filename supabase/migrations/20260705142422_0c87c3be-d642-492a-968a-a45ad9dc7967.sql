
-- ============================================================
-- 1. Helper: detect service_role JWT
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role',
    false
  );
$$;

-- ============================================================
-- 2. Lock profiles: block client-side updates to money columns
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF NEW.credits IS DISTINCT FROM OLD.credits THEN
    RAISE EXCEPTION 'permission denied: profiles.credits is server-managed'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'permission denied: profiles.plan is server-managed'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.image_free_uses IS DISTINCT FROM OLD.image_free_uses THEN
    RAISE EXCEPTION 'permission denied: profiles.image_free_uses is server-managed'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_billing ON public.profiles;
CREATE TRIGGER trg_protect_profile_billing
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_billing_columns();

-- ============================================================
-- 3. Lock workspaces: block client-side updates to money columns
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_workspace_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF NEW.credits IS DISTINCT FROM OLD.credits THEN
    RAISE EXCEPTION 'permission denied: workspaces.credits is server-managed'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'permission denied: workspaces.plan is server-managed'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.default_member_monthly_limit IS DISTINCT FROM OLD.default_member_monthly_limit THEN
    -- Allow admins to change this via a dedicated RPC in the future; block direct writes
    IF NOT public.is_workspace_admin(OLD.id, auth.uid()) THEN
      RAISE EXCEPTION 'permission denied: only workspace admin can change member limit'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_workspace_billing ON public.workspaces;
CREATE TRIGGER trg_protect_workspace_billing
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.protect_workspace_billing_columns();

-- ============================================================
-- 4. Lock kashier_orders: user creates order but cannot pick amount/credits/plan freely;
--    force status='pending' + block client mutations post-insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_kashier_order_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;
  -- Force safe defaults regardless of what the client sent
  NEW.status := 'pending';
  NEW.kashier_ref := NULL;
  NEW.raw := NULL;
  -- Force user_id = auth.uid()
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_kashier_insert ON public.kashier_orders;
CREATE TRIGGER trg_protect_kashier_insert
  BEFORE INSERT ON public.kashier_orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_kashier_order_insert();

CREATE OR REPLACE FUNCTION public.protect_kashier_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'permission denied: kashier_orders can only be modified by the payment webhook'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_kashier_update ON public.kashier_orders;
CREATE TRIGGER trg_protect_kashier_update
  BEFORE UPDATE OR DELETE ON public.kashier_orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_kashier_order_update();

-- ============================================================
-- 5. credit_transactions → make append-only (no update, no delete)
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_credit_transactions_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'credit_transactions is append-only'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_credit_tx_no_update ON public.credit_transactions;
CREATE TRIGGER trg_credit_tx_no_update
  BEFORE UPDATE OR DELETE ON public.credit_transactions
  FOR EACH ROW EXECUTE FUNCTION public.protect_credit_transactions_immutable();

-- Drop any policy that lets clients write; only service_role writes
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='credit_transactions'
      AND cmd IN ('INSERT','UPDATE','DELETE','ALL')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.credit_transactions', p.policyname);
  END LOOP;
END $$;

-- Recreate: users can only read their own rows; only service_role writes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='credit_transactions'
      AND policyname='Users read own credit transactions'
  ) THEN
    CREATE POLICY "Users read own credit transactions"
      ON public.credit_transactions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE POLICY "Service role writes credit transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- ============================================================
-- 6. Billing audit log — captures every credit/plan change
-- ============================================================
CREATE TABLE IF NOT EXISTS public.billing_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_role text NOT NULL,
  actor_user_id uuid,
  table_name text NOT NULL,
  entity_id uuid NOT NULL,
  column_name text NOT NULL,
  old_value text,
  new_value text,
  reason text
);

GRANT SELECT ON public.billing_audit_log TO authenticated;
GRANT ALL ON public.billing_audit_log TO service_role;

ALTER TABLE public.billing_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read audit log" ON public.billing_audit_log;
CREATE POLICY "admins read audit log"
  ON public.billing_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Block any non-service_role writes (no INSERT/UPDATE/DELETE policies = denied)

CREATE OR REPLACE FUNCTION public.log_billing_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_txt text := COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', 'unknown');
  uid uuid := auth.uid();
BEGIN
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.credits IS DISTINCT FROM OLD.credits THEN
      INSERT INTO public.billing_audit_log(actor_role, actor_user_id, table_name, entity_id, column_name, old_value, new_value)
      VALUES (role_txt, uid, 'profiles', NEW.id, 'credits', OLD.credits::text, NEW.credits::text);
    END IF;
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      INSERT INTO public.billing_audit_log(actor_role, actor_user_id, table_name, entity_id, column_name, old_value, new_value)
      VALUES (role_txt, uid, 'profiles', NEW.id, 'plan', OLD.plan, NEW.plan);
    END IF;
  ELSIF TG_TABLE_NAME = 'workspaces' THEN
    IF NEW.credits IS DISTINCT FROM OLD.credits THEN
      INSERT INTO public.billing_audit_log(actor_role, actor_user_id, table_name, entity_id, column_name, old_value, new_value)
      VALUES (role_txt, uid, 'workspaces', NEW.id, 'credits', OLD.credits::text, NEW.credits::text);
    END IF;
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      INSERT INTO public.billing_audit_log(actor_role, actor_user_id, table_name, entity_id, column_name, old_value, new_value)
      VALUES (role_txt, uid, 'workspaces', NEW.id, 'plan', OLD.plan, NEW.plan);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_profiles_billing ON public.profiles;
CREATE TRIGGER trg_audit_profiles_billing
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_billing_change();

DROP TRIGGER IF EXISTS trg_audit_workspaces_billing ON public.workspaces;
CREATE TRIGGER trg_audit_workspaces_billing
  AFTER UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.log_billing_change();

-- ============================================================
-- 7. Atomic server-side spend/grant helpers (SECURITY DEFINER)
--    Only callable by service_role (edge functions).
-- ============================================================
CREATE OR REPLACE FUNCTION public.spend_user_credits(
  p_user_id uuid,
  p_amount numeric,
  p_action_type text,
  p_description text DEFAULT NULL
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
  new_balance numeric;
BEGIN
  IF NOT public.is_service_role() THEN
    RAISE EXCEPTION 'permission denied' USING ERRCODE = '42501';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  SELECT credits INTO current_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'profile not found';
  END IF;
  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient credits' USING ERRCODE = 'P0001';
  END IF;

  new_balance := current_balance - p_amount;
  UPDATE public.profiles SET credits = new_balance WHERE id = p_user_id;

  INSERT INTO public.credit_transactions(user_id, amount, action_type, description)
  VALUES (p_user_id, -p_amount, p_action_type, p_description);

  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_user_credits(
  p_user_id uuid,
  p_amount numeric,
  p_action_type text,
  p_description text DEFAULT NULL
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_balance numeric;
BEGIN
  IF NOT public.is_service_role() THEN
    RAISE EXCEPTION 'permission denied' USING ERRCODE = '42501';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  UPDATE public.profiles
    SET credits = COALESCE(credits, 0) + p_amount
    WHERE id = p_user_id
    RETURNING credits INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  INSERT INTO public.credit_transactions(user_id, amount, action_type, description)
  VALUES (p_user_id, p_amount, p_action_type, p_description);

  RETURN new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_user_credits(uuid, numeric, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_user_credits(uuid, numeric, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_user_credits(uuid, numeric, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_user_credits(uuid, numeric, text, text) TO service_role;

-- ============================================================
-- 8. Idempotency on kashier_orders (prevent double-processing)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS ux_kashier_orders_order_id
  ON public.kashier_orders(order_id);
