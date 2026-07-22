-- FINAL COMPREHENSIVE SECURITY LOCKDOWN
-- Address remaining critical data exposure and function security issues

-- 1. CRITICAL: Secure teacher_profiles table (prevent competitive data theft)
DO $$
BEGIN
    -- Check if table exists and secure it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_profiles' AND table_schema = 'public') THEN
        -- Ensure RLS is enabled
        ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop any overly permissive policies
        DROP POLICY IF EXISTS "Public read access" ON public.teacher_profiles;
        DROP POLICY IF EXISTS "Anyone can view teacher profiles" ON public.teacher_profiles;
        DROP POLICY IF EXISTS "Teachers are publicly viewable" ON public.teacher_profiles;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.teacher_profiles;
        
        -- Create secure, restrictive policies
        CREATE POLICY IF NOT EXISTS "Authenticated students can view approved teachers" 
        ON public.teacher_profiles 
        FOR SELECT 
        USING (
            auth.role() = 'authenticated' AND 
            profile_complete = true AND 
            can_teach = true AND
            profile_approved_by_admin = true
        );

        CREATE POLICY IF NOT EXISTS "Teachers can manage own profile" 
        ON public.teacher_profiles 
        FOR ALL 
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

        CREATE POLICY IF NOT EXISTS "Admins can manage all teacher profiles" 
        ON public.teacher_profiles 
        FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE users.id = auth.uid() 
                AND users.role = 'admin'
            )
        );
    END IF;
END $$;

-- 2. CRITICAL: Secure teacher_availability table (prevent harassment/stalking)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_availability' AND table_schema = 'public') THEN
        ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
        
        -- Drop overly permissive policies
        DROP POLICY IF EXISTS "Public read access" ON public.teacher_availability;
        DROP POLICY IF EXISTS "Anyone can view availability" ON public.teacher_availability;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.teacher_availability;
        
        -- Secure policies - only authenticated users can see available future slots
        CREATE POLICY IF NOT EXISTS "Authenticated users see available future slots only" 
        ON public.teacher_availability 
        FOR SELECT 
        USING (
            auth.role() = 'authenticated' AND 
            is_available = true AND 
            is_booked = false AND
            start_time > NOW() - INTERVAL '1 hour' -- Allow small buffer for current sessions
        );

        CREATE POLICY IF NOT EXISTS "Teachers manage their availability" 
        ON public.teacher_availability 
        FOR ALL 
        USING (teacher_id = auth.uid())
        WITH CHECK (teacher_id = auth.uid());
    END IF;
END $$;

-- 3. CRITICAL: Secure systematic_lessons/curriculum content (prevent IP theft)
DO $$
BEGIN
    -- Secure systematic_lessons if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'systematic_lessons' AND table_schema = 'public') THEN
        ALTER TABLE public.systematic_lessons ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public read access" ON public.systematic_lessons;
        DROP POLICY IF EXISTS "Anyone can view lessons" ON public.systematic_lessons;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.systematic_lessons;
        
        CREATE POLICY IF NOT EXISTS "Only authenticated users can view lesson content" 
        ON public.systematic_lessons 
        FOR SELECT 
        USING (auth.role() = 'authenticated');

        CREATE POLICY IF NOT EXISTS "Teachers and admins can manage lessons" 
        ON public.systematic_lessons 
        FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('teacher', 'admin')
            )
        );
    END IF;
    
    -- Also secure lessons_content table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons_content' AND table_schema = 'public') THEN
        -- This table should already have proper policies, but let's ensure it
        ALTER TABLE public.lessons_content ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. Fix remaining function search path issues
-- These are the likely culprits for the remaining 3 function security warnings

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$function$;

-- Fix can_access_lesson function
CREATE OR REPLACE FUNCTION public.can_access_lesson(room_uuid text, user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lesson_record RECORD;
  current_time TIMESTAMPTZ := NOW();
BEGIN
  -- Find the lesson by room_id
  SELECT * INTO lesson_record
  FROM public.lessons
  WHERE room_id = room_uuid;
  
  -- Return false if lesson doesn't exist
  IF lesson_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is the teacher or student for this lesson
  IF lesson_record.teacher_id = user_uuid OR lesson_record.student_id = user_uuid THEN
    -- Allow access 10 minutes before scheduled time and up to 2 hours after
    IF current_time >= (lesson_record.scheduled_at - INTERVAL '10 minutes') 
       AND current_time <= (lesson_record.scheduled_at + INTERVAL '2 hours') THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- Fix save_placement_test_result function
CREATE OR REPLACE FUNCTION public.save_placement_test_result(p_user_id uuid, p_cefr_level text, p_score integer, p_total integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update student profile with test results
  UPDATE public.student_profiles 
  SET 
    cefr_level = p_cefr_level,
    placement_test_completed_at = now(),
    placement_test_score = p_score,
    placement_test_total = p_total,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- If no profile exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.student_profiles (
      user_id, 
      cefr_level, 
      placement_test_completed_at,
      placement_test_score,
      placement_test_total
    )
    VALUES (
      p_user_id, 
      p_cefr_level, 
      now(),
      p_score,
      p_total
    );
  END IF;
  
  RETURN true;
END;
$function$;

-- 5. Add RLS policies for any remaining tables without policies
DO $$
BEGIN
    -- Secure student_profiles if it needs policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_profiles' AND table_schema = 'public') THEN
        ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view and edit own profile" 
        ON public.student_profiles 
        FOR ALL 
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

        CREATE POLICY IF NOT EXISTS "Teachers can view student profiles for lessons" 
        ON public.student_profiles 
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.lessons 
                WHERE lessons.student_id = student_profiles.user_id 
                AND lessons.teacher_id = auth.uid()
            )
        );
    END IF;

    -- Secure speaking_sessions if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'speaking_sessions' AND table_schema = 'public') THEN
        ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can manage own speaking sessions" 
        ON public.speaking_sessions 
        FOR ALL 
        USING (student_id = auth.uid())
        WITH CHECK (student_id = auth.uid());
    END IF;

    -- Secure student_xp if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_xp' AND table_schema = 'public') THEN
        ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Students can view own XP" 
        ON public.student_xp 
        FOR SELECT 
        USING (student_id = auth.uid());

        CREATE POLICY IF NOT EXISTS "System can update student XP" 
        ON public.student_xp 
        FOR INSERT 
        WITH CHECK (student_id = auth.uid());

        CREATE POLICY IF NOT EXISTS "System can modify student XP" 
        ON public.student_xp 
        FOR UPDATE 
        USING (student_id = auth.uid());
    END IF;
END $$;

-- 6. Final security audit function for monitoring
CREATE OR REPLACE FUNCTION public.audit_sensitive_data_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log any access to sensitive teacher or payment data
  IF TG_TABLE_NAME IN ('teacher_profiles', 'teacher_availability', 'teacher_earnings', 'lesson_payments') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      jsonb_build_object(
        'timestamp', now(),
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'user_role', auth.jwt() ->> 'role',
        'sensitive_data_access', true
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;