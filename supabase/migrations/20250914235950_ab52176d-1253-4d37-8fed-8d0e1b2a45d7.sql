-- Continue Security Fixes - Phase 2: Function Security and Anonymous Access

-- 1. Fix remaining functions without proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.can_access_lesson(room_uuid text, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Remove excessive anonymous access policies and replace with authenticated-only access

-- Virtual rewards - should require authentication
DROP POLICY IF EXISTS "Anyone can view available rewards" ON public.virtual_rewards;
CREATE POLICY "Authenticated users can view available rewards" 
ON public.virtual_rewards 
FOR SELECT 
TO authenticated
USING (is_available = true);

-- Curriculum materials - restrict public access
DROP POLICY IF EXISTS "Everyone can view public materials" ON public.curriculum_materials;
CREATE POLICY "Authenticated users can view public materials" 
ON public.curriculum_materials 
FOR SELECT 
TO authenticated
USING (is_public = true OR created_by = auth.uid());

-- Speaking scenarios - require authentication
DROP POLICY IF EXISTS "Everyone can view active speaking scenarios" ON public.speaking_scenarios;
CREATE POLICY "Authenticated users can view speaking scenarios" 
ON public.speaking_scenarios 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Lesson packages - require authentication
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.lesson_packages;
CREATE POLICY "Authenticated users can view lesson packages" 
ON public.lesson_packages 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Learning challenges - require authentication
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.learning_challenges;
CREATE POLICY "Authenticated users can view learning challenges" 
ON public.learning_challenges 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Leaderboards - require authentication
DROP POLICY IF EXISTS "Anyone can view leaderboards" ON public.leaderboards;
DROP POLICY IF EXISTS "Anyone can view leaderboard entries" ON public.leaderboard_entries;

CREATE POLICY "Authenticated users can view leaderboards" 
ON public.leaderboards 
FOR SELECT 
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can view leaderboard entries" 
ON public.leaderboard_entries 
FOR SELECT 
TO authenticated
USING (true);

-- Generated curriculums - require authentication
DROP POLICY IF EXISTS "Anyone can view active curriculums" ON public.generated_curriculums;
CREATE POLICY "Authenticated users can view generated curriculums" 
ON public.generated_curriculums 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Adaptive content - require authentication for viewing
DROP POLICY IF EXISTS "Everyone can view active content" ON public.adaptive_content;
CREATE POLICY "Authenticated users can view adaptive content" 
ON public.adaptive_content 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- AI generated topics - require authentication
DROP POLICY IF EXISTS "Anyone can view active topics" ON public.ai_generated_topics;
CREATE POLICY "Authenticated users can view AI topics" 
ON public.ai_generated_topics 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Content generation jobs - restrict access
DROP POLICY IF EXISTS "Anyone can view generation jobs" ON public.content_generation_jobs;
CREATE POLICY "Authenticated users can view generation jobs" 
ON public.content_generation_jobs 
FOR SELECT 
TO authenticated
USING (created_by = auth.uid() OR EXISTS (
  SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
));

-- Subscription plans - require authentication for viewing
DROP POLICY IF EXISTS "subscription_plans_public_read" ON public.subscription_plans;
CREATE POLICY "Authenticated users can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Achievement tiers - require authentication
DROP POLICY IF EXISTS "Anyone can view achievement tiers" ON public.achievement_tiers;
CREATE POLICY "Authenticated users can view achievement tiers" 
ON public.achievement_tiers 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Systematic lessons - tighten access controls
DROP POLICY IF EXISTS "Anyone can view published lessons" ON public.systematic_lessons;
CREATE POLICY "Authenticated users can view published lessons" 
ON public.systematic_lessons 
FOR SELECT 
TO authenticated
USING (status = 'published');

-- 3. Add missing RLS policies for tables that have RLS enabled but no policies

-- Add policy for invoice_items if it exists and has RLS enabled but no policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items' AND table_schema = 'public') THEN
    -- Check if RLS is enabled but no policies exist
    IF EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' AND c.relname = 'invoice_items' AND c.relrowsecurity = true
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'invoice_items' AND schemaname = 'public'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can view their own invoice items" ON public.invoice_items FOR SELECT TO authenticated USING (user_id = auth.uid())';
    END IF;
  END IF;
END $$;

-- 4. Strengthen storage policies to require authentication
-- Remove overly permissive storage policies
DROP POLICY IF EXISTS "Anyone can view classroom files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view curriculum files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view teacher certificates" ON storage.objects;

-- Create more restrictive storage policies
CREATE POLICY "Authenticated users can view classroom files" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'classroom-files');

CREATE POLICY "Authenticated users can view curriculum files" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'curriculum-files');

CREATE POLICY "Authenticated users can view teacher certificates" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'teacher-certificates');

-- 5. Create comprehensive security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_security_events()
RETURNS TABLE (
  event_type text,
  event_count bigint,
  latest_event timestamp with time zone,
  risk_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sal.action as event_type,
    COUNT(*) as event_count,
    MAX(sal.created_at) as latest_event,
    CASE 
      WHEN COUNT(*) > 100 THEN 'HIGH'
      WHEN COUNT(*) > 50 THEN 'MEDIUM'
      ELSE 'LOW'
    END as risk_level
  FROM public.security_audit_logs sal
  WHERE sal.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY sal.action
  ORDER BY event_count DESC;
END;
$$;

-- 6. Add function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TABLE (
  user_id uuid,
  suspicious_activity_count bigint,
  last_activity timestamp with time zone,
  risk_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sal.user_id,
    COUNT(*) as suspicious_activity_count,
    MAX(sal.created_at) as last_activity,
    CASE 
      WHEN COUNT(*) > 20 THEN 100
      WHEN COUNT(*) > 10 THEN 75
      WHEN COUNT(*) > 5 THEN 50
      ELSE 25
    END as risk_score
  FROM public.security_audit_logs sal
  WHERE sal.created_at >= NOW() - INTERVAL '1 hour'
    AND sal.action IN ('DELETE', 'UPDATE')
  GROUP BY sal.user_id
  HAVING COUNT(*) > 3
  ORDER BY suspicious_activity_count DESC;
END;
$$;

-- 7. Create function to enforce rate limiting on critical operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_type text,
  user_uuid uuid DEFAULT auth.uid(),
  max_operations integer DEFAULT 10,
  time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  operation_count integer;
BEGIN
  -- Count recent operations of this type by the user
  SELECT COUNT(*)
  INTO operation_count
  FROM public.security_audit_logs
  WHERE user_id = user_uuid
    AND action = operation_type
    AND created_at >= NOW() - (time_window_minutes || ' minutes')::interval;
  
  -- Return true if under the limit, false if over
  RETURN operation_count < max_operations;
END;
$$;

-- 8. Add trigger to automatically monitor high-risk operations
CREATE OR REPLACE FUNCTION public.monitor_high_risk_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_level text := 'LOW';
  operation_count integer;
BEGIN
  -- Check recent operation frequency for this user
  SELECT COUNT(*)
  INTO operation_count
  FROM public.security_audit_logs
  WHERE user_id = auth.uid()
    AND created_at >= NOW() - INTERVAL '5 minutes';
  
  -- Determine risk level
  IF operation_count > 20 THEN
    risk_level := 'CRITICAL';
  ELSIF operation_count > 10 THEN
    risk_level := 'HIGH';
  ELSIF operation_count > 5 THEN
    risk_level := 'MEDIUM';
  END IF;
  
  -- Log high-risk activity
  IF risk_level IN ('HIGH', 'CRITICAL') THEN
    PERFORM public.log_security_event(
      'high_risk_activity_detected',
      'security_monitoring',
      auth.uid()::text,
      jsonb_build_object(
        'risk_level', risk_level,
        'operation_count', operation_count,
        'time_window', '5 minutes',
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;