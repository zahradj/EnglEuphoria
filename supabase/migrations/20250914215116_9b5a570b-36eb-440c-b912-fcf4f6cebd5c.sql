-- Fix critical security vulnerability in systematic_lessons table
-- This table contains valuable curriculum IP and must be protected

-- Enable RLS if not already enabled
ALTER TABLE public.systematic_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies to protect curriculum intellectual property

-- 1. Allow authenticated users to view only active (non-archived) lessons
-- This protects IP while allowing legitimate users to access content
CREATE POLICY "Authenticated users can view active lessons" 
ON public.systematic_lessons 
FOR SELECT 
TO authenticated
USING (
  status = 'active' AND 
  archived_at IS NULL
);

-- 2. Only teachers and admins can view all lessons (including archived)
CREATE POLICY "Teachers and admins can view all lessons" 
ON public.systematic_lessons 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('teacher', 'admin')
  )
);

-- 3. Only admins can create new lessons
CREATE POLICY "Only admins can create lessons" 
ON public.systematic_lessons 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 4. Only admins can update lessons
CREATE POLICY "Only admins can update lessons" 
ON public.systematic_lessons 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 5. Only admins can delete lessons (soft delete by archiving is preferred)
CREATE POLICY "Only admins can delete lessons" 
ON public.systematic_lessons 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Add comment explaining the security model
COMMENT ON TABLE public.systematic_lessons IS 'Contains valuable curriculum IP. Access restricted to authenticated users with role-based permissions.';

-- No anonymous access allowed - all policies require authentication