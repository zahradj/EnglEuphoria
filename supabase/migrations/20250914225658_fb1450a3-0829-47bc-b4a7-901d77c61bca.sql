-- CRITICAL SECURITY FIX: Address data exposure vulnerabilities
-- Fix the 3 critical security issues identified by enhanced scanner

-- 1. CRITICAL FIX: Classroom Sessions (ERROR level - unauthorized access)
-- Remove public access to classroom_sessions and restrict to participants only

-- First, check if classroom_sessions table exists and has public policies
DO $$
BEGIN
    -- Drop any overly permissive policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classroom_sessions' AND policyname LIKE '%public%') THEN
        DROP POLICY IF EXISTS "Public read access" ON public.classroom_sessions;
        DROP POLICY IF EXISTS "Anyone can view classroom sessions" ON public.classroom_sessions;
        DROP POLICY IF EXISTS "Public classroom sessions" ON public.classroom_sessions;
    END IF;
    
    -- Enable RLS if not already enabled
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classroom_sessions' AND table_schema = 'public') THEN
        ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;
        
        -- Create secure policies for classroom sessions - PARTICIPANTS ONLY
        CREATE POLICY "Only session participants can view classroom sessions" 
        ON public.classroom_sessions 
        FOR SELECT 
        USING (
            teacher_id = auth.uid() OR 
            student_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.lessons 
                WHERE lessons.room_id = classroom_sessions.room_id 
                AND (lessons.teacher_id = auth.uid() OR lessons.student_id = auth.uid())
            )
        );

        CREATE POLICY "Only session participants can update classroom sessions" 
        ON public.classroom_sessions 
        FOR UPDATE 
        USING (
            teacher_id = auth.uid() OR 
            student_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.lessons 
                WHERE lessons.room_id = classroom_sessions.room_id 
                AND (lessons.teacher_id = auth.uid() OR lessons.student_id = auth.uid())
            )
        );

        CREATE POLICY "Teachers and students can create classroom sessions" 
        ON public.classroom_sessions 
        FOR INSERT 
        WITH CHECK (
            teacher_id = auth.uid() OR 
            student_id = auth.uid()
        );
    END IF;
END $$;

-- 2. FIX: Teacher Profiles - Remove public access, add secure viewing
DO $$
BEGIN
    -- Drop overly permissive policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_profiles' AND policyname LIKE '%public%') THEN
        DROP POLICY IF EXISTS "Public read access" ON public.teacher_profiles;
        DROP POLICY IF EXISTS "Anyone can view teacher profiles" ON public.teacher_profiles;
        DROP POLICY IF EXISTS "Public teacher profiles" ON public.teacher_profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_profiles' AND table_schema = 'public') THEN
        ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Secure policies for teacher profiles - AUTHENTICATED USERS ONLY for basic info
        CREATE POLICY "Authenticated users can view basic teacher info" 
        ON public.teacher_profiles 
        FOR SELECT 
        USING (
            auth.role() = 'authenticated' AND 
            profile_complete = true AND 
            can_teach = true
        );

        CREATE POLICY "Teachers can update their own profiles" 
        ON public.teacher_profiles 
        FOR UPDATE 
        USING (user_id = auth.uid());

        CREATE POLICY "Teachers can create their own profiles" 
        ON public.teacher_profiles 
        FOR INSERT 
        WITH CHECK (user_id = auth.uid());

        -- Admins can manage all profiles
        CREATE POLICY "Admins can manage teacher profiles" 
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

-- 3. FIX: Teacher Availability - Secure schedule access
DO $$
BEGIN
    -- Drop overly permissive policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_availability' AND policyname LIKE '%public%') THEN
        DROP POLICY IF EXISTS "Public read access" ON public.teacher_availability;
        DROP POLICY IF EXISTS "Anyone can view teacher availability" ON public.teacher_availability;
        DROP POLICY IF EXISTS "Public teacher availability" ON public.teacher_availability;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_availability' AND table_schema = 'public') THEN
        ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
        
        -- Secure policies for teacher availability - AUTHENTICATED USERS ONLY for available slots
        CREATE POLICY "Authenticated users can view available slots only" 
        ON public.teacher_availability 
        FOR SELECT 
        USING (
            auth.role() = 'authenticated' AND 
            is_available = true AND 
            is_booked = false AND
            start_time > NOW()
        );

        CREATE POLICY "Teachers can manage their own availability" 
        ON public.teacher_availability 
        FOR ALL 
        USING (teacher_id = auth.uid());

        -- System can book slots for lessons
        CREATE POLICY "System can book availability slots" 
        ON public.teacher_availability 
        FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM public.lessons 
                WHERE lessons.teacher_id = teacher_availability.teacher_id 
                AND (lessons.teacher_id = auth.uid() OR lessons.student_id = auth.uid())
            )
        );
    END IF;
END $$;

-- 4. ADDITIONAL SECURITY: Add function security for missed functions
-- These are likely the remaining 3 functions with mutable search paths

-- Fix handle_new_user if it exists (commonly has search path issues)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        CREATE OR REPLACE FUNCTION public.handle_new_user()
         RETURNS trigger
         LANGUAGE plpgsql
         SECURITY DEFINER
         SET search_path TO 'public'
        AS $function$
        BEGIN
          INSERT INTO public.users (id, email, full_name, role)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'student')
          );
          RETURN NEW;
        END;
        $function$;
    END IF;
END $$;

-- Fix set_lesson_room_id if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_lesson_room_id') THEN
        CREATE OR REPLACE FUNCTION public.set_lesson_room_id()
         RETURNS trigger
         LANGUAGE plpgsql
         SECURITY DEFINER
         SET search_path TO 'public'
        AS $function$
        BEGIN
          IF NEW.room_id IS NULL THEN
            NEW.room_id := public.generate_room_id();
          END IF;
          
          IF NEW.room_link IS NULL THEN
            NEW.room_link := 'https://engleuphoria.lovable.app/oneonone-classroom-new?roomId=' || NEW.room_id;
          END IF;
          
          RETURN NEW;
        END;
        $function$;
    END IF;
END $$;

-- Fix generate_room_id if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_room_id') THEN
        CREATE OR REPLACE FUNCTION public.generate_room_id()
         RETURNS text
         LANGUAGE plpgsql
         SECURITY DEFINER
         SET search_path TO 'public'
        AS $function$
        BEGIN
          RETURN 'room-' || encode(gen_random_bytes(8), 'hex');
        END;
        $function$;
    END IF;
END $$;

-- Final security check: Add comprehensive access audit logging
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access to sensitive tables for security monitoring
  IF TG_TABLE_NAME IN ('teacher_profiles', 'teacher_availability', 'classroom_sessions') THEN
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
        'user_role', auth.jwt() ->> 'role'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;