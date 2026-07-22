-- Fix: Allow anyone to submit a teacher application (public form)
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.teacher_applications;

CREATE POLICY "Anyone can submit teacher applications"
ON public.teacher_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also ensure storage bucket allows public uploads for CVs
INSERT INTO storage.objects (bucket_id, name) SELECT 'teacher-applications', '.keep' WHERE NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'teacher-applications' AND name = '.keep');

-- Create storage policy for teacher-applications bucket uploads
DROP POLICY IF EXISTS "Anyone can upload teacher application files" ON storage.objects;
CREATE POLICY "Anyone can upload teacher application files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'teacher-applications');

DROP POLICY IF EXISTS "Anyone can read teacher application files" ON storage.objects;
CREATE POLICY "Anyone can read teacher application files"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'teacher-applications');