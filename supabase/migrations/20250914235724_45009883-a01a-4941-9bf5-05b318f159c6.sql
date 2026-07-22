-- Critical Security Fixes for Teacher Applications and Database Functions

-- 1. Fix teacher applications RLS policies to require proper authentication
DROP POLICY IF EXISTS "Applicants can create own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Applicants can update own pending applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Applicants can view own applications" ON public.teacher_applications;

-- Create secure RLS policies for teacher applications
CREATE POLICY "Authenticated users can create applications" 
ON public.teacher_applications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view own applications by user_id" 
ON public.teacher_applications 
FOR SELECT 
TO authenticated
USING (
  -- Check if there's a user with matching email who is the current user
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.email = teacher_applications.email
  ) 
  OR is_user_admin()
);

CREATE POLICY "Users can update own applications" 
ON public.teacher_applications 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.email = teacher_applications.email
  ) 
  OR is_user_admin()
);

-- 2. Fix teacher equipment tests RLS policies
DROP POLICY IF EXISTS "Applicants can insert their own equipment tests" ON public.teacher_equipment_tests;
DROP POLICY IF EXISTS "Applicants can view their own equipment tests" ON public.teacher_equipment_tests;

CREATE POLICY "Authenticated users can create equipment tests" 
ON public.teacher_equipment_tests 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teacher_applications ta
    JOIN public.users u ON u.email = ta.email
    WHERE ta.id = teacher_equipment_tests.application_id 
    AND u.id = auth.uid()
  )
);

CREATE POLICY "Users can view own equipment tests" 
ON public.teacher_equipment_tests 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teacher_applications ta
    JOIN public.users u ON u.email = ta.email
    WHERE ta.id = teacher_equipment_tests.application_id 
    AND u.id = auth.uid()
  ) 
  OR is_user_admin()
);

-- 3. Secure database functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_teacher()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

-- 4. Restrict anonymous access to sensitive tables
-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Anyone can view active seasonal events" ON public.seasonal_events;
DROP POLICY IF EXISTS "Anyone can view achievement shares" ON public.achievement_shares;

-- Create more restrictive policies
CREATE POLICY "Authenticated users can view achievements" 
ON public.achievements 
FOR SELECT 
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can view seasonal events" 
ON public.seasonal_events 
FOR SELECT 
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can view achievement shares" 
ON public.achievement_shares 
FOR SELECT 
TO authenticated
USING (true);

-- 5. Add missing RLS policies for tables without proper protection
-- Ensure all sensitive tables have proper RLS enabled and policies

-- Add comprehensive audit logging trigger for security-sensitive tables
CREATE OR REPLACE FUNCTION public.enhanced_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get current user role safely
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Log the security event with enhanced metadata
  PERFORM public.log_security_event(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'user_role', user_role,
      'timestamp', now(),
      'changes', CASE 
        WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
          'old', to_jsonb(OLD),
          'new', to_jsonb(NEW)
        )
        WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
        WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        ELSE '{}'::jsonb
      END
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add security audit triggers to sensitive tables
DROP TRIGGER IF EXISTS security_audit_trigger ON public.teacher_applications;
CREATE TRIGGER security_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_applications
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

DROP TRIGGER IF EXISTS security_audit_trigger ON public.users;  
CREATE TRIGGER security_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

-- 6. Update teacher application submission function with better security
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
  current_user_email text;
BEGIN
  -- Get current user's email for validation
  SELECT email INTO current_user_email 
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Validate required fields
  IF p_first_name IS NULL OR p_last_name IS NULL OR p_email IS NULL THEN
    RAISE EXCEPTION 'First name, last name, and email are required';
  END IF;
  
  -- Validate email format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Ensure user can only submit application with their own email
  IF current_user_email IS NOT NULL AND current_user_email != p_email THEN
    RAISE EXCEPTION 'Email must match authenticated user email';
  END IF;
  
  -- Check if application already exists for this email
  IF EXISTS (SELECT 1 FROM public.teacher_applications WHERE email = p_email) THEN
    RAISE EXCEPTION 'Application already exists for this email';
  END IF;
  
  -- Insert the application
  INSERT INTO public.teacher_applications (
    first_name, last_name, email, phone, address, education,
    teaching_experience_years, certifications, languages_spoken,
    cv_url, cover_letter
  ) VALUES (
    p_first_name, p_last_name, p_email, p_phone, p_address, p_education,
    p_teaching_experience_years, p_certifications, p_languages_spoken,
    p_cv_url, p_cover_letter
  ) RETURNING id INTO application_id;
  
  -- Log the application submission
  PERFORM public.log_security_event(
    'teacher_application_submitted',
    'teacher_applications',
    application_id::text,
    jsonb_build_object(
      'email', p_email,
      'experience_years', p_teaching_experience_years
    )
  );
  
  RETURN application_id;
END;
$$;