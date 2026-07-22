-- Fix critical security vulnerability in teacher_applications table
-- This table contains sensitive personal data and must be protected

-- Ensure RLS is enabled on teacher_applications table
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh with secure ones
DROP POLICY IF EXISTS "Authenticated users can submit applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Only verified admins can manage all applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can update their own pending applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.teacher_applications;

-- 1. Only admins can view all teacher applications
CREATE POLICY "Admins can view all applications" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 2. Users can only view their own applications
CREATE POLICY "Users can view own applications" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (
  auth.jwt() ->> 'email' = email
);

-- 3. Authenticated users can submit applications for themselves only
CREATE POLICY "Users can submit own applications" 
ON public.teacher_applications 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = email AND
  status = 'pending'
);

-- 4. Users can update only their own pending applications
CREATE POLICY "Users can update own pending applications" 
ON public.teacher_applications 
FOR UPDATE 
TO authenticated
USING (
  auth.jwt() ->> 'email' = email AND
  status = 'pending'
)
WITH CHECK (
  auth.jwt() ->> 'email' = email AND
  status = 'pending'
);

-- 5. Only admins can update any application (for status changes, etc.)
CREATE POLICY "Admins can update any application" 
ON public.teacher_applications 
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

-- 6. Only admins can delete applications
CREATE POLICY "Only admins can delete applications" 
ON public.teacher_applications 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Add security comment
COMMENT ON TABLE public.teacher_applications IS 'Contains sensitive personal data. Access restricted to admins and applicants themselves only.';