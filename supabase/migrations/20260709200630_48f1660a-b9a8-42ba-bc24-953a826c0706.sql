
-- Rate limiting bucket table
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_lookup
  ON public.edge_rate_limits(identifier, endpoint, window_start DESC);

GRANT SELECT ON public.edge_rate_limits TO authenticated;
GRANT ALL ON public.edge_rate_limits TO service_role;

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edge_rate_limits_service_only_read"
  ON public.edge_rate_limits FOR SELECT
  TO authenticated
  USING (false);

-- Audit log for sensitive endpoint access
CREATE TABLE IF NOT EXISTS public.edge_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  endpoint TEXT NOT NULL,
  action TEXT NOT NULL,
  status INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edge_audit_log_user
  ON public.edge_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edge_audit_log_endpoint
  ON public.edge_audit_log(endpoint, created_at DESC);

GRANT SELECT ON public.edge_audit_log TO authenticated;
GRANT ALL ON public.edge_audit_log TO service_role;

ALTER TABLE public.edge_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read only their own audit rows; admins see all
CREATE POLICY "edge_audit_log_own"
  ON public.edge_audit_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Atomic rate-limit checker (fixed-window)
CREATE OR REPLACE FUNCTION public.check_edge_rate_limit(
  _identifier TEXT,
  _endpoint TEXT,
  _limit INTEGER,
  _window_seconds INTEGER
) RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _bucket TIMESTAMPTZ;
  _current INTEGER;
BEGIN
  _bucket := date_trunc('second', now())
    - make_interval(secs => (EXTRACT(EPOCH FROM now())::INTEGER % _window_seconds));

  INSERT INTO public.edge_rate_limits(identifier, endpoint, window_start, count)
    VALUES (_identifier, _endpoint, _bucket, 1)
  ON CONFLICT (identifier, endpoint, window_start)
    DO UPDATE SET count = public.edge_rate_limits.count + 1,
                  updated_at = now()
  RETURNING count INTO _current;

  RETURN QUERY SELECT
    _current <= _limit,
    GREATEST(0, _limit - _current),
    _bucket + make_interval(secs => _window_seconds);
END;
$$;

REVOKE ALL ON FUNCTION public.check_edge_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_edge_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
