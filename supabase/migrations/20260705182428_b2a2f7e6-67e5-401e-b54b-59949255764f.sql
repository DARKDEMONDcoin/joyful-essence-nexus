-- Deactivate legacy ultimate skus (superseded by elite/business)
UPDATE public.billing_skus SET active = false WHERE sku IN ('plan_ultimate_m','plan_ultimate_y');

-- Upsert the current plan catalog. EGP amounts derived from the live
-- USD→EGP rate (~49.13 on 2026-07-05, source: open.er-api.com).
INSERT INTO public.billing_skus
  (sku, kind, display_name, amount_egp, amount_usd, credits, plan_key, interval, sort_order, active)
VALUES
  ('plan_pro_m_first', 'subscription', 'Pro — First Month Offer', 344,   7,   240,  'pro',      'monthly', 35, true),
  ('plan_pro_m',       'subscription', 'Pro (Monthly)',            1228,  25,  240,  'pro',      'monthly', 40, true),
  ('plan_pro_y',       'subscription', 'Pro (Yearly)',             12283, 250, 2880, 'pro',      'yearly',  50, true),
  ('plan_elite_m',     'subscription', 'Elite (Monthly)',          2899,  59,  500,  'elite',    'monthly', 60, true),
  ('plan_elite_y',     'subscription', 'Elite (Yearly)',           28987, 590, 6000, 'elite',    'yearly',  70, true),
  ('plan_business_m',  'subscription', 'Business (Monthly)',       7321,  149, 1200, 'business', 'monthly', 80, true),
  ('plan_business_y',  'subscription', 'Business (Yearly)',        73204, 1490,14400,'business', 'yearly',  90, true)
ON CONFLICT (sku) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  amount_egp   = EXCLUDED.amount_egp,
  amount_usd   = EXCLUDED.amount_usd,
  credits      = EXCLUDED.credits,
  plan_key     = EXCLUDED.plan_key,
  interval     = EXCLUDED.interval,
  sort_order   = EXCLUDED.sort_order,
  active       = EXCLUDED.active,
  updated_at   = now();