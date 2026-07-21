ALTER TABLE public.status_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "status_subscribers_select_own" ON public.status_subscribers;
CREATE POLICY "status_subscribers_select_own"
  ON public.status_subscribers
  FOR SELECT
  TO authenticated
  USING (
    channel = 'email'
    AND lower(contact) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

DROP POLICY IF EXISTS "status_subscribers_insert_authenticated" ON public.status_subscribers;
DROP POLICY IF EXISTS "status_subscribers_insert_own_email" ON public.status_subscribers;
CREATE POLICY "status_subscribers_insert_own_email"
  ON public.status_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    channel = 'email'
    AND lower(contact) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

DROP POLICY IF EXISTS "status_subscribers_delete_own" ON public.status_subscribers;
CREATE POLICY "status_subscribers_delete_own"
  ON public.status_subscribers
  FOR DELETE
  TO authenticated
  USING (
    channel = 'email'
    AND lower(contact) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

GRANT SELECT, INSERT, DELETE ON public.status_subscribers TO authenticated;
GRANT ALL ON public.status_subscribers TO service_role;