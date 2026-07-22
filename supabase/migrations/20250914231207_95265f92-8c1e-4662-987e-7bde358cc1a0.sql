-- Final security hardening migration (corrected for existing policies)
-- Address remaining critical data exposure issues

-- 1. Secure teacher_profiles table - remove public access and recreate policies
DROP POLICY IF EXISTS "Students can view approved teachers for booking" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can manage own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Authenticated users can view approved teachers" ON public.teacher_profiles;

-- Create more restrictive teacher profile policies
CREATE POLICY "Teachers can manage own profile"
ON public.teacher_profiles
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view approved teachers"
ON public.teacher_profiles
FOR SELECT
USING (
  auth.role() = 'authenticated' AND 
  profile_complete = true AND 
  can_teach = true AND 
  profile_approved_by_admin = true
);

-- 2. Secure teacher_availability table
DROP POLICY IF EXISTS "Teachers can manage their availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Public can view teacher availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Teachers can manage own availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Authenticated users can view available slots" ON public.teacher_availability;
DROP POLICY IF EXISTS "Admins can view all availability" ON public.teacher_availability;

CREATE POLICY "Teachers can manage own availability"
ON public.teacher_availability
FOR ALL
USING (teacher_id = auth.uid());

CREATE POLICY "Authenticated users can view available slots"
ON public.teacher_availability
FOR SELECT
USING (
  auth.role() = 'authenticated' AND 
  is_available = true AND 
  is_booked = false
);

CREATE POLICY "Admins can view all availability"
ON public.teacher_availability
FOR SELECT
USING (public.is_user_admin());

-- 3. Secure classroom_sessions table completely
DROP POLICY IF EXISTS "Public can view classroom sessions" ON public.classroom_sessions;
DROP POLICY IF EXISTS "Session participants can access classroom data" ON public.classroom_sessions;

-- Enable RLS on classroom_sessions if not already enabled
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can access classroom data"
ON public.classroom_sessions
FOR ALL
USING (
  teacher_id = auth.uid() OR 
  student_id = auth.uid() OR 
  public.is_user_admin()
);

-- 4. Create final security monitoring and validation functions

CREATE OR REPLACE FUNCTION public.log_data_access(
  table_name text,
  operation text,
  record_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log access to sensitive data
  PERFORM public.log_security_event(
    operation,
    table_name,
    record_id,
    jsonb_build_object(
      'table', table_name,
      'operation', operation,
      'user_id', auth.uid(),
      'timestamp', now(),
      'ip_address', inet_client_addr()
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_secure_access(
  required_role text DEFAULT 'authenticated',
  resource_type text DEFAULT 'general'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text;
  is_authenticated boolean;
BEGIN
  -- Check if user is authenticated
  is_authenticated := (auth.role() = 'authenticated');
  
  IF NOT is_authenticated AND required_role != 'anonymous' THEN
    PERFORM public.log_security_event(
      'unauthorized_access_attempt',
      resource_type,
      auth.uid()::text,
      jsonb_build_object(
        'required_role', required_role,
        'user_authenticated', is_authenticated,
        'timestamp', now()
      )
    );
    RETURN false;
  END IF;
  
  -- Additional role checks
  IF required_role = 'admin' THEN
    RETURN public.is_user_admin();
  ELSIF required_role = 'teacher' THEN
    RETURN public.is_user_teacher();
  END IF;
  
  RETURN true;
END;
$$;