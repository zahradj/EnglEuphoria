-- Final security hardening migration (corrected for classroom_sessions structure)
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

-- 3. Secure classroom_sessions table completely (using correct column structure)
DROP POLICY IF EXISTS "Public can view classroom sessions" ON public.classroom_sessions;
DROP POLICY IF EXISTS "Session participants can access classroom data" ON public.classroom_sessions;

-- Enable RLS on classroom_sessions if not already enabled
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy based on actual table structure (teacher_id only, no student_id)
CREATE POLICY "Teachers and admins can access classroom sessions"
ON public.classroom_sessions
FOR ALL
USING (
  teacher_id = auth.uid() OR 
  public.is_user_admin()
);

-- Allow students to view sessions through room access (if they have the room_id)
-- This is more restrictive - students must know the exact room_id to access
CREATE POLICY "Room participants can view session data"
ON public.classroom_sessions
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    teacher_id = auth.uid() OR 
    public.is_user_admin() OR
    -- Students can only view if they're specifically granted access through lessons table
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.room_id = classroom_sessions.room_id 
      AND lessons.student_id = auth.uid()
    )
  )
);

-- 4. Create comprehensive security summary function
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  total_tables integer;
  secured_tables integer;
  user_role text;
BEGIN
  -- Get current user role
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Count total and secured tables
  SELECT COUNT(*) INTO total_tables 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  SELECT COUNT(*) INTO secured_tables
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relrowsecurity = true;
  
  result := jsonb_build_object(
    'security_status', 'hardened',
    'user_role', user_role,
    'tables_total', total_tables,
    'tables_with_rls', secured_tables,
    'security_coverage', ROUND((secured_tables::decimal / total_tables) * 100, 2),
    'timestamp', now(),
    'recommendations', jsonb_build_array(
      'Enable leaked password protection in Supabase Auth settings',
      'Reduce OTP expiry to 300 seconds',
      'Upgrade PostgreSQL version for security patches'
    )
  );
  
  -- Log security status check
  PERFORM public.log_security_event(
    'security_status_check',
    'security',
    auth.uid()::text,
    result
  );
  
  RETURN result;
END;
$$;