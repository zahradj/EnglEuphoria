DROP POLICY IF EXISTS "Authenticated users can upload email assets" ON storage.objects;

CREATE POLICY "Anyone can upload email assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'email-assets');