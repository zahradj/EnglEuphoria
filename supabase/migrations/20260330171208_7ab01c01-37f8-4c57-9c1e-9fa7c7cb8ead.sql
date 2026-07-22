DROP POLICY IF EXISTS "Anyone can upload email assets" ON storage.objects;

CREATE POLICY "Only authenticated users can upload email assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'email-assets' AND auth.role() = 'authenticated');