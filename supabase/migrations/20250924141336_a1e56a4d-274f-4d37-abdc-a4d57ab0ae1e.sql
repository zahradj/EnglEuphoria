-- Fix lessons_content RLS policies to allow proper access
-- Drop existing policies first
DROP POLICY IF EXISTS "Everyone can view lesson content" ON lessons_content;
DROP POLICY IF EXISTS "Teachers and system can create lesson content" ON lessons_content;

-- Create new policies that work properly
CREATE POLICY "Everyone can view lessons"
ON lessons_content
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create lessons" 
ON lessons_content
FOR INSERT
WITH CHECK (true);

-- Allow updates for lesson creators and admins
CREATE POLICY "Creators and admins can update lessons"
ON lessons_content  
FOR UPDATE
USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow deletions for lesson creators and admins  
CREATE POLICY "Creators and admins can delete lessons"
ON lessons_content
FOR DELETE 
USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')  
);