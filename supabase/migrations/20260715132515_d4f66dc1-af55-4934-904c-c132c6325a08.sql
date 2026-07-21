
CREATE TABLE public.user_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_emoji TEXT DEFAULT '✨',
  system_prompt TEXT NOT NULL,
  temperature NUMERIC(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_personas_user ON public.user_personas(user_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_personas TO authenticated;
GRANT ALL ON public.user_personas TO service_role;

ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own personas"
  ON public.user_personas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_personas_updated_at
  BEFORE UPDATE ON public.user_personas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.ai_personalization
  ADD COLUMN IF NOT EXISTS active_persona_id UUID REFERENCES public.user_personas(id) ON DELETE SET NULL;
