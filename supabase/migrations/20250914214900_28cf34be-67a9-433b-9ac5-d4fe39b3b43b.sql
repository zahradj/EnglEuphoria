-- Fix security vulnerability in teacher_applications table
-- Drop existing policies and recreate with proper restrictions

DROP POLICY IF EXISTS "Users can submit applications with their email" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can update their own pending applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Verified admins can manage all applications" ON public.teacher_applications;

-- Create secure policies that properly restrict access to sensitive data

-- 1. Allow authenticated users to submit applications (only for their own email)
CREATE POLICY "Authenticated users can submit applications" 
ON public.teacher_applications 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = email AND 
  status = 'pending'
);

-- 2. Allow users to view only their own applications (by email match)
CREATE POLICY "Users can view their own applications" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'email' = email);

-- 3. Allow users to update only their own pending applications
CREATE POLICY "Users can update their own pending applications" 
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

-- 4. Allow only verified admins to access all applications
CREATE POLICY "Only verified admins can manage all applications" 
ON public.teacher_applications 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ) OR 
  auth.jwt() ->> 'email' = 'f.zahra.djaanine@engleuphoria.com'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ) OR 
  auth.jwt() ->> 'email' = 'f.zahra.djaanine@engleuphoria.com'
);

-- 5. Ensure no anonymous access
-- Remove any potential anonymous access by ensuring all policies require authentication