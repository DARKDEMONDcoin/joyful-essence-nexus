CREATE POLICY "Users can read own media studio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media-studio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);