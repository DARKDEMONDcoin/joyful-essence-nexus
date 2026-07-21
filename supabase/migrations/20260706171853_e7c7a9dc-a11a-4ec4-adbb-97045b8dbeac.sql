-- ========== parallel_tasks ==========
CREATE TABLE public.parallel_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('search','extract','deep_research','findall','chat','monitor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','cancelled')),
  parallel_task_id TEXT,
  parallel_processor TEXT,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  citations JSONB,
  error TEXT,
  webhook_received_at TIMESTAMPTZ,
  conversation_id UUID,
  message_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_parallel_tasks_user ON public.parallel_tasks(user_id, created_at DESC);
CREATE INDEX idx_parallel_tasks_status ON public.parallel_tasks(status) WHERE status IN ('pending','running');
CREATE UNIQUE INDEX idx_parallel_tasks_parallel_id ON public.parallel_tasks(parallel_task_id) WHERE parallel_task_id IS NOT NULL;
CREATE INDEX idx_parallel_tasks_conversation ON public.parallel_tasks(conversation_id) WHERE conversation_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parallel_tasks TO authenticated;
GRANT ALL ON public.parallel_tasks TO service_role;

ALTER TABLE public.parallel_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own parallel tasks"
  ON public.parallel_tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own parallel tasks"
  ON public.parallel_tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own parallel tasks"
  ON public.parallel_tasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own parallel tasks"
  ON public.parallel_tasks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ========== parallel_monitors ==========
CREATE TABLE public.parallel_monitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  parallel_monitor_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended','failed')),
  frequency TEXT DEFAULT 'daily',
  conversation_id UUID,
  config JSONB DEFAULT '{}'::jsonb,
  last_event_at TIMESTAMPTZ,
  event_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parallel_monitors_user ON public.parallel_monitors(user_id, created_at DESC);
CREATE UNIQUE INDEX idx_parallel_monitors_parallel_id ON public.parallel_monitors(parallel_monitor_id) WHERE parallel_monitor_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parallel_monitors TO authenticated;
GRANT ALL ON public.parallel_monitors TO service_role;

ALTER TABLE public.parallel_monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own monitors"
  ON public.parallel_monitors FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own monitors"
  ON public.parallel_monitors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own monitors"
  ON public.parallel_monitors FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own monitors"
  ON public.parallel_monitors FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ========== parallel_monitor_events ==========
CREATE TABLE public.parallel_monitor_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitor_id UUID NOT NULL REFERENCES public.parallel_monitors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'update',
  summary TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  citations JSONB,
  seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parallel_monitor_events_user ON public.parallel_monitor_events(user_id, created_at DESC);
CREATE INDEX idx_parallel_monitor_events_monitor ON public.parallel_monitor_events(monitor_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parallel_monitor_events TO authenticated;
GRANT ALL ON public.parallel_monitor_events TO service_role;

ALTER TABLE public.parallel_monitor_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own monitor events"
  ON public.parallel_monitor_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own monitor events"
  ON public.parallel_monitor_events FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own monitor events"
  ON public.parallel_monitor_events FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ========== updated_at trigger ==========
CREATE OR REPLACE FUNCTION public.parallel_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_parallel_tasks_updated_at
  BEFORE UPDATE ON public.parallel_tasks
  FOR EACH ROW EXECUTE FUNCTION public.parallel_set_updated_at();

CREATE TRIGGER trg_parallel_monitors_updated_at
  BEFORE UPDATE ON public.parallel_monitors
  FOR EACH ROW EXECUTE FUNCTION public.parallel_set_updated_at();

-- ========== realtime ==========
ALTER PUBLICATION supabase_realtime ADD TABLE public.parallel_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parallel_monitor_events;