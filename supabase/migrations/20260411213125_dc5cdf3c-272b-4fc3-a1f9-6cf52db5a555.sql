
-- Create lesson-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-assets', 'lesson-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload lesson assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-assets');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update lesson assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-assets');

-- Allow public read access
CREATE POLICY "Public can read lesson assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-assets');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete lesson assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-assets');
