
-- Allow authenticated users to subscribe to status alerts, and prevent duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS status_subscribers_channel_contact_key
  ON public.status_subscribers (channel, contact);

DROP POLICY IF EXISTS "status_subscribers_insert_authenticated" ON public.status_subscribers;
CREATE POLICY "status_subscribers_insert_authenticated"
  ON public.status_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "status_subscribers_select_own" ON public.status_subscribers;
CREATE POLICY "status_subscribers_select_own"
  ON public.status_subscribers
  FOR SELECT
  TO authenticated
  USING (true);
