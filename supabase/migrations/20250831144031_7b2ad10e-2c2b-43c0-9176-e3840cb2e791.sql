-- Fix security vulnerability in teacher_applications table
-- Remove overly permissive policies and ensure proper authentication

-- Drop existing potentially insecure policies
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.teacher_applications;

-- Create secure policy for inserting applications - require authentication
CREATE POLICY "Authenticated users can submit applications" 
ON public.teacher_applications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Ensure the existing select policy is properly restrictive (applicants can only see their own)
-- This policy already exists and is secure, but let's recreate it to be explicit
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.teacher_applications;

CREATE POLICY "Applicants can view their own applications" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (
  -- Applicants can see their own applications by matching email
  (auth.jwt() ->> 'email'::text) = email::text
);

-- Ensure admin policy is properly restrictive to authenticated admins only
DROP POLICY IF EXISTS "Admins can view all applications" ON public.teacher_applications;

CREATE POLICY "Admins can manage all applications" 
ON public.teacher_applications 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Ensure update policy is properly restrictive
DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON public.teacher_applications;

CREATE POLICY "Applicants can update their own pending applications" 
ON public.teacher_applications 
FOR UPDATE 
TO authenticated
USING (
  (auth.jwt() ->> 'email'::text) = email::text 
  AND status = 'pending'
);

-- Create a function to handle secure application submission
CREATE OR REPLACE FUNCTION public.submit_teacher_application(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_education text DEFAULT NULL,
  p_teaching_experience_years integer DEFAULT 0,
  p_certifications text[] DEFAULT NULL,
  p_languages_spoken text[] DEFAULT NULL,
  p_cv_url text DEFAULT NULL,
  p_cover_letter text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_id uuid;
BEGIN
  -- Validate required fields
  IF p_first_name IS NULL OR p_last_name IS NULL OR p_email IS NULL THEN
    RAISE EXCEPTION 'First name, last name, and email are required';
  END IF;
  
  -- Validate email format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Insert the application
  INSERT INTO public.teacher_applications (
    first_name,
    last_name,
    email,
    phone,
    address,
    education,
    teaching_experience_years,
    certifications,
    languages_spoken,
    cv_url,
    cover_letter
  ) VALUES (
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_address,
    p_education,
    p_teaching_experience_years,
    p_certifications,
    p_languages_spoken,
    p_cv_url,
    p_cover_letter
  ) RETURNING id INTO application_id;
  
  RETURN application_id;
END;
$$;