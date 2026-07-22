-- Critical Security Fixes Migration
-- Fix data exposure and implement comprehensive RLS policies

-- 1. Fix teacher_applications table - restrict public access
DROP POLICY IF EXISTS "Users can view own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can update own pending applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can submit own applications" ON public.teacher_applications;

-- Create more restrictive policies for teacher_applications
CREATE POLICY "Applicants can view own applications"
ON public.teacher_applications
FOR SELECT
USING (
  (auth.jwt() ->> 'email') = email OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Applicants can create own applications"
ON public.teacher_applications
FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'email') = email AND
  status = 'pending'
);

CREATE POLICY "Applicants can update own pending applications"
ON public.teacher_applications
FOR UPDATE
USING (
  ((auth.jwt() ->> 'email') = email AND status = 'pending') OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Add RLS policies for missing critical tables

-- Enable RLS on tables that need it
ALTER TABLE public.ai_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for teacher profiles
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Public can view approved teacher profiles" ON public.teacher_profiles;

CREATE POLICY "Teachers can manage own profile"
ON public.teacher_profiles
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Students can view approved teachers for booking"
ON public.teacher_profiles
FOR SELECT
USING (
  profile_complete = true AND 
  can_teach = true AND 
  profile_approved_by_admin = true
);

-- 3. Secure lesson-related data
CREATE POLICY "Lesson participants can view feedback"
ON public.lesson_feedback_submissions
FOR SELECT
USING (
  teacher_id = auth.uid() OR 
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Add security definer functions with proper search_path

-- Function to check if user is admin (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Function to check if user is teacher (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_teacher()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 5. Update existing functions to use proper search_path
CREATE OR REPLACE FUNCTION public.update_student_xp(student_uuid uuid, xp_to_add integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_record RECORD;
  new_total_xp INTEGER;
  new_level INTEGER;
  new_xp_in_level INTEGER;
  level_up BOOLEAN := FALSE;
  xp_per_level CONSTANT INTEGER := 500;
BEGIN
  -- Get current XP record or create if doesn't exist
  SELECT * INTO current_record FROM public.student_xp WHERE student_id = student_uuid;
  
  IF current_record IS NULL THEN
    INSERT INTO public.student_xp (student_id, total_xp, current_level, xp_in_current_level)
    VALUES (student_uuid, xp_to_add, 1, xp_to_add)
    RETURNING * INTO current_record;
    
    new_total_xp := xp_to_add;
    new_level := 1;
    new_xp_in_level := xp_to_add;
  ELSE
    new_total_xp := current_record.total_xp + xp_to_add;
    new_xp_in_level := current_record.xp_in_current_level + xp_to_add;
    new_level := current_record.current_level;
    
    -- Check for level up
    WHILE new_xp_in_level >= xp_per_level LOOP
      new_xp_in_level := new_xp_in_level - xp_per_level;
      new_level := new_level + 1;
      level_up := TRUE;
    END LOOP;
    
    -- Update the record
    UPDATE public.student_xp 
    SET 
      total_xp = new_total_xp,
      current_level = new_level,
      xp_in_current_level = new_xp_in_level,
      last_activity_date = CURRENT_DATE,
      updated_at = now()
    WHERE student_id = student_uuid;
  END IF;
  
  RETURN jsonb_build_object(
    'total_xp', new_total_xp,
    'current_level', new_level,
    'xp_in_current_level', new_xp_in_level,
    'level_up', level_up,
    'xp_added', xp_to_add
  );
END;
$function$;

-- 6. Create audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.security_audit_logs
FOR SELECT
USING (public.is_user_admin());

-- 7. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    inet_client_addr(),
    p_metadata
  );
END;
$$;

-- 8. Update critical RLS policies to use security definer functions
DROP POLICY IF EXISTS "Admins can view all applications" ON public.teacher_applications;
CREATE POLICY "Admins can manage all applications"
ON public.teacher_applications
FOR ALL
USING (public.is_user_admin());

-- 9. Secure lesson access
CREATE POLICY "Secure lesson access"
ON public.lessons
FOR SELECT
USING (
  teacher_id = auth.uid() OR 
  student_id = auth.uid() OR 
  public.is_user_admin()
);

-- 10. Add trigger for security event logging on sensitive operations
CREATE OR REPLACE FUNCTION public.trigger_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.log_security_event(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_teacher_applications ON public.teacher_applications;
CREATE TRIGGER audit_teacher_applications
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_applications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_security_audit();

DROP TRIGGER IF EXISTS audit_lessons ON public.lessons;
CREATE TRIGGER audit_lessons
  AFTER INSERT OR UPDATE OR DELETE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.trigger_security_audit();