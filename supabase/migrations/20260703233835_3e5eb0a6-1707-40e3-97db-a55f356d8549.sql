
CREATE TABLE public.kashier_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  credits INTEGER NOT NULL DEFAULT 0,
  plan TEXT,
  kashier_ref TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX kashier_orders_user_idx ON public.kashier_orders(user_id, created_at DESC);
CREATE INDEX kashier_orders_status_idx ON public.kashier_orders(status);

GRANT SELECT, INSERT, UPDATE ON public.kashier_orders TO authenticated;
GRANT ALL ON public.kashier_orders TO service_role;

ALTER TABLE public.kashier_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own kashier orders"
  ON public.kashier_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own kashier orders"
  ON public.kashier_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_kashier_orders_updated_at
  BEFORE UPDATE ON public.kashier_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
