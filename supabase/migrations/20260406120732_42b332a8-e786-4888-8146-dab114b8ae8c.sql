CREATE POLICY "Anyone can upload application files"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'teacher-applications');