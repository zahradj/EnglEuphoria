-- Fix lessons_content table security vulnerability
-- The table is currently publicly readable, exposing proprietary educational content

-- Drop the overly permissive policy that allows anyone to view lessons
DROP POLICY IF EXISTS "Anyone can view active lessons" ON public.lessons_content;

-- Create a secure policy that only allows authenticated users to view lessons
CREATE POLICY "Authenticated users can view active lessons"
ON public.lessons_content
FOR SELECT
TO authenticated
USING (is_active = true);

-- Keep existing policies for teachers to manage their own content
-- (These are already properly secured)

-- Ensure RLS is enabled
ALTER TABLE public.lessons_content ENABLE ROW LEVEL SECURITY;