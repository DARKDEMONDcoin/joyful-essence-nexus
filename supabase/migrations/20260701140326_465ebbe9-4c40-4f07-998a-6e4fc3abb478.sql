
CREATE TABLE public.landing_page_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'landing-page',
  media_type text NOT NULL DEFAULT 'image',
  media_url text NOT NULL,
  thumbnail_url text,
  prompt text NOT NULL,
  is_pro boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Base grants: only service_role can read raw table (prompt column stays hidden from anon/authenticated)
GRANT ALL ON public.landing_page_prompts TO service_role;

ALTER TABLE public.landing_page_prompts ENABLE ROW LEVEL SECURITY;

-- Admin manage policy (uses existing has_role function)
CREATE POLICY "Admins manage landing prompts"
  ON public.landing_page_prompts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public-safe view exposes everything EXCEPT the prompt text
CREATE OR REPLACE VIEW public.landing_page_prompts_public
WITH (security_invoker = true) AS
SELECT
  id, name, slug, description, category, media_type,
  media_url, thumbnail_url, is_pro, display_order,
  is_published, created_at, updated_at
FROM public.landing_page_prompts
WHERE is_published = true;

GRANT SELECT ON public.landing_page_prompts_public TO anon, authenticated;

-- Because the view uses security_invoker=true, we need a policy to allow SELECT
-- on the underlying table for anon/authenticated but ONLY for the columns exposed
-- via the view. We enforce that by granting column-level SELECT (excluding prompt).
GRANT SELECT (id, name, slug, description, category, media_type, media_url,
              thumbnail_url, is_pro, display_order, is_published, created_at, updated_at)
  ON public.landing_page_prompts TO anon, authenticated;

CREATE POLICY "Anyone can read published rows (non-prompt cols)"
  ON public.landing_page_prompts
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Secure RPC: returns prompt only if item is free OR caller has active subscription
CREATE OR REPLACE FUNCTION public.get_landing_page_prompt(item_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prompt text;
  v_is_pro boolean;
  v_has_sub boolean := false;
BEGIN
  SELECT prompt, is_pro INTO v_prompt, v_is_pro
  FROM public.landing_page_prompts
  WHERE id = item_id AND is_published = true;

  IF v_prompt IS NULL THEN
    RETURN NULL;
  END IF;

  IF v_is_pro = false THEN
    RETURN v_prompt;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Admins always get access
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN v_prompt;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  ) INTO v_has_sub;

  IF v_has_sub THEN
    RETURN v_prompt;
  END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_landing_page_prompt(uuid) TO anon, authenticated;

CREATE TRIGGER trg_landing_page_prompts_updated_at
  BEFORE UPDATE ON public.landing_page_prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_landing_prompts_order ON public.landing_page_prompts(display_order DESC, created_at DESC);
