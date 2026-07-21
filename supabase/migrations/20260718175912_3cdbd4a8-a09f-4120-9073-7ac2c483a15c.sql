
-- AppSumo license redemption tables
CREATE TABLE public.appsumo_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text NOT NULL UNIQUE,
  license_id text,
  activation_email text,
  product_id text,
  plan_id text,
  tier integer,
  status text NOT NULL DEFAULT 'active',
  event text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  raw jsonb,
  activated_at timestamptz,
  invoiced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_appsumo_licenses_user ON public.appsumo_licenses(user_id);
CREATE INDEX idx_appsumo_licenses_status ON public.appsumo_licenses(status);

GRANT SELECT ON public.appsumo_licenses TO authenticated;
GRANT ALL ON public.appsumo_licenses TO service_role;

ALTER TABLE public.appsumo_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own licenses"
  ON public.appsumo_licenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- OAuth state (short-lived) for AppSumo Connect
CREATE TABLE public.appsumo_oauth_states (
  state text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_to text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.appsumo_oauth_states TO service_role;
ALTER TABLE public.appsumo_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_appsumo_licenses_updated_at
  BEFORE UPDATE ON public.appsumo_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
