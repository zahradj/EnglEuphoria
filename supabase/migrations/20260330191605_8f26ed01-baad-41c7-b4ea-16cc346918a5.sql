
-- Create lesson-slides storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-slides', 'lesson-slides', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload lesson slides"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-slides');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update lesson slides"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-slides');

-- Allow public read access
CREATE POLICY "Public read access for lesson slides"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-slides');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete lesson slides"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-slides');
