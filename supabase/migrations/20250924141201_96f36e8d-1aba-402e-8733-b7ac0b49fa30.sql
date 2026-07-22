-- Fix RLS policies for lessons_content to allow students to view lessons
-- This will enable students to see the Family & Phonics lessons

-- Update the SELECT policy to allow students to view lessons too
DROP POLICY IF EXISTS "Teachers and admins can view lesson content" ON lessons_content;

CREATE POLICY "Everyone can view lesson content" 
ON lessons_content 
FOR SELECT 
USING (true);

-- Update INSERT policy to allow system/edge functions to create lessons
DROP POLICY IF EXISTS "Teachers can create lesson content" ON lessons_content;

CREATE POLICY "Teachers and system can create lesson content" 
ON lessons_content 
FOR INSERT 
WITH CHECK (
  -- Allow if user is teacher/admin OR if created_by is null (system-generated)
  (auth.uid() = created_by AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = ANY (ARRAY['teacher', 'admin'])
  )) 
  OR created_by IS NULL
);