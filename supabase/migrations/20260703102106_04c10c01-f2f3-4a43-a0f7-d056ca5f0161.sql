
DROP POLICY IF EXISTS "cert_assets_read" ON storage.objects;
CREATE POLICY "cert_assets_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'certificate-assets');

DROP POLICY IF EXISTS "cert_assets_write" ON storage.objects;
CREATE POLICY "cert_assets_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificate-assets'
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_creator'))
  );

DROP POLICY IF EXISTS "cert_assets_update" ON storage.objects;
CREATE POLICY "cert_assets_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'certificate-assets'
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_creator'))
  );

DROP POLICY IF EXISTS "cert_assets_delete" ON storage.objects;
CREATE POLICY "cert_assets_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'certificate-assets'
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_creator'))
  );
