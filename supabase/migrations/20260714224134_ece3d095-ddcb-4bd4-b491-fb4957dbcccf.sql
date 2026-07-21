
ALTER TABLE public.referral_earnings
  ADD COLUMN IF NOT EXISTS commission_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS net_revenue_cents integer,
  ADD COLUMN IF NOT EXISTS subscription_id uuid,
  ADD COLUMN IF NOT EXISTS period_start date;

CREATE UNIQUE INDEX IF NOT EXISTS referral_earnings_idem_idx
  ON public.referral_earnings (referrer_id, subscription_id, source_action, period_start)
  WHERE subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.referral_tiers (
  id text PRIMARY KEY,
  name text NOT NULL,
  rate_pct numeric(5,2) NOT NULL,
  min_active_refs integer NOT NULL DEFAULT 0,
  min_net_mrr_cents integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.referral_tiers TO anon, authenticated;
GRANT ALL ON public.referral_tiers TO service_role;

ALTER TABLE public.referral_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referral tiers are public" ON public.referral_tiers;
CREATE POLICY "Referral tiers are public"
  ON public.referral_tiers FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.referral_tiers (id, name, rate_pct, min_active_refs, min_net_mrr_cents, sort_order) VALUES
  ('bronze',   'Bronze',   20, 0,   0,       1),
  ('silver',   'Silver',   25, 3,   20000,   2),
  ('gold',     'Gold',     30, 10,  75000,   3),
  ('platinum', 'Platinum', 40, 25,  200000,  4),
  ('diamond',  'Diamond',  50, 60,  500000,  5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  rate_pct = EXCLUDED.rate_pct,
  min_active_refs = EXCLUDED.min_active_refs,
  min_net_mrr_cents = EXCLUDED.min_net_mrr_cents,
  sort_order = EXCLUDED.sort_order;

CREATE OR REPLACE FUNCTION public.calc_referral_stats(_referrer uuid)
RETURNS TABLE (
  active_refs integer,
  net_mrr_cents integer,
  tier_id text,
  tier_name text,
  rate_pct numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _active integer := 0;
  _mrr    integer := 0;
BEGIN
  SELECT COUNT(DISTINCT r.referred_id)::int,
         COALESCE(SUM(s.amount_cents), 0)::int
    INTO _active, _mrr
  FROM public.referrals r
  JOIN public.subscriptions s ON s.user_id = r.referred_id
  WHERE r.referrer_id = _referrer
    AND s.status IN ('active', 'trialing', 'past_due')
    AND s.updated_at >= now() - interval '90 days';

  RETURN QUERY
  SELECT _active, _mrr, t.id, t.name, t.rate_pct
    FROM public.referral_tiers t
   WHERE _active >= t.min_active_refs
      OR _mrr    >= t.min_net_mrr_cents
   ORDER BY t.sort_order DESC
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT _active, _mrr, t.id, t.name, t.rate_pct
      FROM public.referral_tiers t
     ORDER BY t.sort_order ASC
     LIMIT 1;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.calc_referral_stats(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.record_referral_commission(
  _referred uuid,
  _net_cents integer,
  _subscription uuid,
  _source text DEFAULT 'subscription'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _referrer uuid;
  _pct numeric;
  _amount numeric;
  _earning_id uuid;
BEGIN
  IF _net_cents IS NULL OR _net_cents <= 0 THEN
    RETURN NULL;
  END IF;

  SELECT referrer_id INTO _referrer
    FROM public.referrals
   WHERE referred_id = _referred
   ORDER BY created_at ASC
   LIMIT 1;

  IF _referrer IS NULL OR _referrer = _referred THEN
    RETURN NULL;
  END IF;

  SELECT rate_pct INTO _pct FROM public.calc_referral_stats(_referrer);
  IF _pct IS NULL THEN _pct := 20; END IF;

  _amount := ROUND((_net_cents::numeric * _pct / 100.0) / 100.0, 2);

  INSERT INTO public.referral_earnings
    (referrer_id, referred_id, amount, source_action, available_at, commission_pct, net_revenue_cents, subscription_id, period_start)
  VALUES
    (_referrer, _referred, _amount, _source, now() + interval '14 days', _pct, _net_cents, _subscription, (now() at time zone 'utc')::date)
  ON CONFLICT (referrer_id, subscription_id, source_action, period_start) DO NOTHING
  RETURNING id INTO _earning_id;

  RETURN _earning_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_referral_commission(uuid, integer, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_referral_commission(uuid, integer, uuid, text) TO service_role;

CREATE OR REPLACE VIEW public.v_referral_tier_progress
WITH (security_invoker = true)
AS
WITH me AS (SELECT auth.uid() AS user_id),
stats AS (SELECT s.* FROM me, LATERAL public.calc_referral_stats(me.user_id) s),
next_tier AS (
  SELECT t.*
    FROM public.referral_tiers t, stats
   WHERE t.sort_order > (SELECT sort_order FROM public.referral_tiers WHERE id = stats.tier_id)
   ORDER BY t.sort_order ASC
   LIMIT 1
)
SELECT
  (SELECT user_id FROM me)                  AS user_id,
  stats.tier_id                             AS current_tier_id,
  stats.tier_name                           AS current_tier_name,
  stats.rate_pct                            AS current_rate_pct,
  stats.active_refs                         AS active_refs,
  stats.net_mrr_cents                       AS net_mrr_cents,
  (SELECT id FROM next_tier)                AS next_tier_id,
  (SELECT name FROM next_tier)              AS next_tier_name,
  (SELECT rate_pct FROM next_tier)          AS next_rate_pct,
  (SELECT min_active_refs FROM next_tier)   AS next_min_active_refs,
  (SELECT min_net_mrr_cents FROM next_tier) AS next_min_net_mrr_cents
FROM stats;

GRANT SELECT ON public.v_referral_tier_progress TO authenticated;
