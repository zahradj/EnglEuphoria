-- CRITICAL SECURITY HARDENING - Phase 1
-- Fix all identified vulnerabilities for existing tables only

-- ============================================
-- 1. SECURE DATABASE FUNCTIONS  
-- ============================================

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_monthly_class_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE user_subscriptions 
  SET classes_used_this_month = 0, updated_at = now()
  WHERE DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', now());
END;
$function$;

-- Secure admin role check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- ============================================
-- 2. SECURE CRITICAL USER DATA TABLES
-- ============================================

-- Secure users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "System can create users" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "System can create user profiles" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Secure teacher_profiles table  
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teacher_profiles;

CREATE POLICY "Public can view approved teacher basic info" ON public.teacher_profiles
FOR SELECT USING (can_teach = true AND profile_complete = true AND is_available = true);

CREATE POLICY "Teachers can view their own full profile" ON public.teacher_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile" ON public.teacher_profiles  
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Teachers can create their profile" ON public.teacher_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Secure student_profiles table
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their own profiles" ON public.student_profiles;

CREATE POLICY "Students can view their own profile" ON public.student_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile" ON public.student_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can create their profile" ON public.student_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. SECURE FINANCIAL DATA
-- ============================================

-- Secure payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own payments" ON public.payments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can create payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Secure teacher_withdrawals table
ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own withdrawals" ON public.teacher_withdrawals
FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create withdrawal requests" ON public.teacher_withdrawals
FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Secure teacher_earnings table
ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own earnings" ON public.teacher_earnings
FOR SELECT USING (auth.uid() = teacher_id);

-- ============================================
-- 4. SECURE LESSON AND AVAILABILITY DATA
-- ============================================

-- Secure teacher_availability table
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage their availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Students can view available slots" ON public.teacher_availability;

CREATE POLICY "Teachers can manage their own availability" ON public.teacher_availability
FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view available slots only" ON public.teacher_availability
FOR SELECT USING (is_available = true AND is_booked = false);

-- Secure teacher_reviews table
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can create reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can update own reviews" ON public.teacher_reviews;

CREATE POLICY "Anyone can view public reviews" ON public.teacher_reviews
FOR SELECT USING (is_public = true);

CREATE POLICY "Students can view their own reviews" ON public.teacher_reviews
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create reviews" ON public.teacher_reviews
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own reviews" ON public.teacher_reviews
FOR UPDATE USING (auth.uid() = student_id);

-- ============================================
-- 5. SECURE LEARNING DATA
-- ============================================

-- Secure student_xp table
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own XP" ON public.student_xp
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can manage student XP" ON public.student_xp
FOR ALL USING (auth.uid() = student_id);

-- Secure learning_currency table
ALTER TABLE public.learning_currency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own currency" ON public.learning_currency
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can manage learning currency" ON public.learning_currency
FOR ALL USING (auth.uid() = student_id);

-- Secure student_learning_streaks table
ALTER TABLE public.student_learning_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own streaks" ON public.student_learning_streaks
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can manage learning streaks" ON public.student_learning_streaks
FOR ALL USING (auth.uid() = student_id);

-- Secure virtual_rewards table
ALTER TABLE public.virtual_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available rewards" ON public.virtual_rewards
FOR SELECT USING (is_available = true);

-- Secure student_reward_purchases table
ALTER TABLE public.student_reward_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own reward purchases" ON public.student_reward_purchases
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can make reward purchases" ON public.student_reward_purchases
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ============================================
-- 6. SECURE CURRICULUM AND PROGRESS DATA
-- ============================================

-- Secure student_curriculum_progress table
ALTER TABLE public.student_curriculum_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own curriculum progress" ON public.student_curriculum_progress
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own curriculum progress" ON public.student_curriculum_progress
FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "System can create curriculum progress" ON public.student_curriculum_progress
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Secure lesson_completions table
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own lesson completions" ON public.lesson_completions
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create lesson completions" ON public.lesson_completions
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Secure weekly_assessments table
ALTER TABLE public.weekly_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own weekly assessments" ON public.weekly_assessments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create weekly assessments" ON public.weekly_assessments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Secure personalized_learning_paths table
ALTER TABLE public.personalized_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own learning paths" ON public.personalized_learning_paths
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can manage learning paths" ON public.personalized_learning_paths
FOR ALL USING (auth.uid() = student_id);

-- Secure adaptive_content table
ALTER TABLE public.adaptive_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active adaptive content" ON public.adaptive_content
FOR SELECT USING (is_active = true);

-- ============================================
-- 7. SECURE SPEAKING AND PRACTICE DATA
-- ============================================

-- Secure speaking_sessions table (updated name)
ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own speaking sessions" ON public.speaking_sessions
FOR ALL USING (auth.uid() = student_id);

-- Secure speaking_progress table
ALTER TABLE public.speaking_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own speaking progress" ON public.speaking_progress
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can update speaking progress" ON public.speaking_progress
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "System can update speaking progress records" ON public.speaking_progress
FOR UPDATE USING (auth.uid() = student_id);

-- ============================================
-- 8. AUDIT LOGGING FOR SECURITY MONITORING
-- ============================================

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.security_audit_logs
FOR SELECT USING (public.is_admin());

CREATE POLICY "System can create audit logs" ON public.security_audit_logs
FOR INSERT WITH CHECK (true);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.log_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;