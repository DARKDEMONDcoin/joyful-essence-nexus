
-- Auto-record referral commission on Dodo (processed_orders) inserts.
-- Kashier path already calls record_referral_commission directly from its
-- webhook with the actual paid amount. Dodo's webhook lives in a separate
-- edge function and only writes credits+plan (no amount), so we resolve the
-- price from billing_skus and record the commission via a trigger. The RPC
-- is idempotent via (referrer_id, subscription_id, source_action, period_start).

CREATE OR REPLACE FUNCTION public.tg_processed_orders_record_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _amount_usd numeric;
  _net_cents  integer;
  _sub        uuid;
BEGIN
  -- Resolve price:
  --  1) exact plan_key + monthly interval (subscription)
  --  2) any active row for that plan_key
  --  3) topup row with matching credits
  IF NEW.plan IS NOT NULL THEN
    SELECT amount_usd INTO _amount_usd
      FROM public.billing_skus
     WHERE plan_key = NEW.plan
       AND kind = 'subscription'
       AND interval = 'monthly'
       AND active = true
       AND amount_usd IS NOT NULL
     ORDER BY sort_order
     LIMIT 1;

    IF _amount_usd IS NULL THEN
      SELECT amount_usd INTO _amount_usd
        FROM public.billing_skus
       WHERE plan_key = NEW.plan
         AND amount_usd IS NOT NULL
       ORDER BY sort_order
       LIMIT 1;
    END IF;
  END IF;

  IF _amount_usd IS NULL AND NEW.credits IS NOT NULL AND NEW.credits > 0 THEN
    SELECT amount_usd INTO _amount_usd
      FROM public.billing_skus
     WHERE kind = 'topup'
       AND credits = NEW.credits
       AND amount_usd IS NOT NULL
     ORDER BY sort_order
     LIMIT 1;
  END IF;

  IF _amount_usd IS NULL OR _amount_usd <= 0 THEN
    RETURN NEW; -- nothing to record; do not block the order write
  END IF;

  _net_cents := (_amount_usd * 100)::integer;

  -- Deterministic subscription uuid from the Dodo order id so retries stay
  -- idempotent even if the same order fires the trigger twice.
  _sub := md5('dodo:' || COALESCE(NEW.polar_order_id, NEW.id::text))::uuid;

  BEGIN
    PERFORM public.record_referral_commission(
      NEW.user_id,
      _net_cents,
      _sub,
      'dodo_purchase'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Never break the order insert because of referral bookkeeping.
    RAISE WARNING 'record_referral_commission (dodo) failed for order %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.tg_processed_orders_record_referral() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_processed_orders_record_referral ON public.processed_orders;
CREATE TRIGGER trg_processed_orders_record_referral
AFTER INSERT ON public.processed_orders
FOR EACH ROW
EXECUTE FUNCTION public.tg_processed_orders_record_referral();
