
CREATE TABLE IF NOT EXISTS public.billing_skus (
  sku text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('topup','subscription')),
  display_name text NOT NULL,
  amount_egp numeric(10,2) NOT NULL CHECK (amount_egp > 0),
  amount_usd numeric(10,2),
  credits integer NOT NULL DEFAULT 0 CHECK (credits >= 0),
  plan_key text,
  interval text CHECK (interval IN ('monthly','yearly') OR interval IS NULL),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.billing_skus TO anon, authenticated;
GRANT ALL ON public.billing_skus TO service_role;

ALTER TABLE public.billing_skus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active skus"
  ON public.billing_skus FOR SELECT
  USING (active = true);

-- No INSERT/UPDATE/DELETE policies => only service_role can mutate.

INSERT INTO public.billing_skus (sku, kind, display_name, amount_egp, amount_usd, credits, plan_key, interval, sort_order) VALUES
  ('topup_starter', 'topup',       'Starter Pack',   149,   3,   250,  NULL,       NULL,     10),
  ('topup_pro',     'topup',       'Pro Pack',       299,   6,   500,  NULL,       NULL,     20),
  ('topup_elite',   'topup',       'Elite Pack',     799,   16,  1500, NULL,       NULL,     30),
  ('plan_pro_m',    'subscription','Pro (Monthly)',  499,   10,  1000, 'pro',      'monthly',40),
  ('plan_pro_y',    'subscription','Pro (Yearly)',   4990,  100, 12000,'pro',      'yearly', 50),
  ('plan_ultimate_m','subscription','Ultimate (Monthly)', 1499, 30, 4000, 'ultimate','monthly',60),
  ('plan_ultimate_y','subscription','Ultimate (Yearly)',  14990,300,50000,'ultimate','yearly', 70)
ON CONFLICT (sku) DO NOTHING;
