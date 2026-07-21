DROP POLICY IF EXISTS "Authenticated upload to code-publishes" ON storage.objects;

CREATE POLICY "Authenticated upload own code-publishes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'code-publishes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated subscribe" ON public.status_subscribers;
