-- Final security hardening migration
-- Address remaining critical data exposure issues

-- 1. Secure teacher_profiles table - remove public access
DROP POLICY IF EXISTS "Students can view approved teachers for booking" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can manage own profile" ON public.teacher_profiles;

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

-- 4. Add missing RLS policies for remaining tables with gaps

-- Check and secure any remaining tables that need policies
-- Add policy for any table that has RLS enabled but missing policies

-- Secure audit_logs table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
    CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (public.is_user_admin());
    
    CREATE POLICY "System can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- 5. Update all remaining functions to have proper search_path

-- Fix remaining functions with mutable search_path
CREATE OR REPLACE FUNCTION public.update_teacher_availability_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.book_teacher_slot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update the availability slot if it exists
  UPDATE public.teacher_availability 
  SET 
    is_booked = true,
    lesson_id = NEW.id,
    updated_at = now()
  WHERE teacher_id = NEW.teacher_id 
    AND start_time <= NEW.scheduled_at 
    AND end_time > NEW.scheduled_at
    AND is_available = true 
    AND is_booked = false;
    
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.purchase_virtual_reward(student_uuid uuid, reward_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  reward_record RECORD;
  currency_record RECORD;
  purchase_result JSONB;
BEGIN
  -- Get reward details
  SELECT * INTO reward_record FROM public.virtual_rewards WHERE id = reward_uuid AND is_available = true;
  
  IF reward_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or not available');
  END IF;
  
  -- Check if limited quantity and still available
  IF reward_record.limited_quantity IS NOT NULL AND reward_record.purchased_count >= reward_record.limited_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward sold out');
  END IF;
  
  -- Get student currency
  SELECT * INTO currency_record FROM public.learning_currency WHERE student_id = student_uuid;
  
  IF currency_record IS NULL OR currency_record.total_coins < reward_record.cost_coins THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;
  
  -- Make the purchase
  INSERT INTO public.student_reward_purchases (student_id, reward_id, coins_spent)
  VALUES (student_uuid, reward_uuid, reward_record.cost_coins);
  
  -- Deduct coins
  UPDATE public.learning_currency
  SET 
    total_coins = total_coins - reward_record.cost_coins,
    coins_spent = coins_spent + reward_record.cost_coins,
    updated_at = now()
  WHERE student_id = student_uuid;
  
  -- Update purchase count
  UPDATE public.virtual_rewards
  SET purchased_count = purchased_count + 1
  WHERE id = reward_uuid;
  
  RETURN jsonb_build_object(
    'success', true,
    'reward_name', reward_record.name,
    'coins_spent', reward_record.cost_coins,
    'remaining_coins', currency_record.total_coins - reward_record.cost_coins
  );
END;
$function$;

-- 6. Create comprehensive data access logging
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('teacher_profiles', 'teacher_availability', 'classroom_sessions', 'teacher_applications') THEN
    PERFORM public.log_security_event(
      'sensitive_data_access',
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      jsonb_build_object(
        'operation', TG_OP,
        'table', TG_TABLE_NAME,
        'user_id', auth.uid(),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add access logging triggers to sensitive tables
DROP TRIGGER IF EXISTS log_teacher_profile_access ON public.teacher_profiles;
CREATE TRIGGER log_teacher_profile_access
  AFTER SELECT ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

DROP TRIGGER IF EXISTS log_teacher_availability_access ON public.teacher_availability;
CREATE TRIGGER log_teacher_availability_access
  AFTER SELECT ON public.teacher_availability
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

-- 7. Final security hardening - ensure all critical tables have proper policies

-- Create emergency admin override function
CREATE OR REPLACE FUNCTION public.emergency_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_emergency boolean := false;
BEGIN
  -- Check if user is admin and log emergency access
  IF public.is_user_admin() THEN
    PERFORM public.log_security_event(
      'emergency_admin_access',
      'security',
      auth.uid()::text,
      jsonb_build_object(
        'type', 'emergency_override',
        'timestamp', now(),
        'user_id', auth.uid()
      )
    );
    is_emergency := true;
  END IF;
  
  RETURN is_emergency;
END;
$$;