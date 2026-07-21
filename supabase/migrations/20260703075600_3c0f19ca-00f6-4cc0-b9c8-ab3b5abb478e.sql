
DROP POLICY IF EXISTS "admins manage keys" ON public.media_provider_keys;
CREATE POLICY "Admins manage media_provider_keys"
  ON public.media_provider_keys
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "bot admins self" ON public.bot_admins;
DROP POLICY IF EXISTS "bot admins manage" ON public.bot_admins;
CREATE POLICY "Admins manage bot_admins"
  ON public.bot_admins
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
