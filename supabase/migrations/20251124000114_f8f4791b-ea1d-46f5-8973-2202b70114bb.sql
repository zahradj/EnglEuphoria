-- Create storage bucket for lesson images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-images',
  'lesson-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for lesson-images bucket

-- Allow teachers to upload images
CREATE POLICY "Teachers can upload lesson images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-images' 
  AND ((storage.foldername(name))[1] = 'vocabulary' OR (storage.foldername(name))[1] = 'intro')
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'teacher'
  )
);

-- Allow everyone to view public lesson images
CREATE POLICY "Anyone can view lesson images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-images');

-- Allow teachers to delete their own uploaded images
CREATE POLICY "Teachers can delete their lesson images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-images'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'teacher'
  )
);

-- Allow teachers to update their lesson images
CREATE POLICY "Teachers can update lesson images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-images'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'teacher'
  )
);

-- Add intro_screen_data column to interactive_lessons table
ALTER TABLE interactive_lessons 
ADD COLUMN IF NOT EXISTS intro_screen_data JSONB DEFAULT NULL;

COMMENT ON COLUMN interactive_lessons.intro_screen_data IS 'Stores intro screen configuration: { source: "upload" | "ai-generated" | "default", url: string, prompt: string }';