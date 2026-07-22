-- Allow anonymous and authenticated users to upload CVs to teacher-applications bucket
CREATE POLICY "Anyone can upload teacher application CVs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'teacher-applications');

-- Allow admins to read/download CVs
CREATE POLICY "Admins can read teacher application CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'teacher-applications' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete CVs (cleanup)
CREATE POLICY "Admins can delete teacher application CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'teacher-applications' AND has_role(auth.uid(), 'admin'::app_role));