
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-covers', 'lesson-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view lesson covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-covers');

CREATE POLICY "Authenticated users can upload lesson covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-covers');

CREATE POLICY "Users can update their own lesson covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own lesson covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
