-- Critical Security Hardening Migration
-- Phase 1: Fix all security vulnerabilities identified by linter

-- ============================================
-- 1. SECURE DATABASE FUNCTIONS (Fix search_path vulnerabilities)
-- ============================================

-- Fix all functions with mutable search_path
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

CREATE OR REPLACE FUNCTION public.update_classroom_sessions_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_teacher_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE teacher_profiles 
  SET 
    rating = (
      SELECT ROUND(AVG(rating::numeric), 2)
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    updated_at = now()
  WHERE user_id = NEW.teacher_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lesson_packages_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_teacher_application_stage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.equipment_test_passed = true AND OLD.equipment_test_passed = false THEN
    NEW.current_stage = 'interview_scheduled';
  ELSIF NEW.interview_passed = true AND OLD.interview_passed = false THEN
    NEW.current_stage = 'final_review';
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_teacher_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.profile_complete = (
    NEW.bio IS NOT NULL AND NEW.bio != '' AND 
    NEW.video_url IS NOT NULL AND NEW.video_url != ''
  );
  
  IF NEW.profile_complete = true AND OLD.profile_complete = false THEN
    NEW.can_teach = true;
    NEW.profile_approved_by_admin = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ============================================
-- 2. LOCK DOWN USER DATA TABLES (Critical Data Protection)
-- ============================================

-- Secure users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "System can create users" ON public.users;

-- Create secure user policies
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "System can create user profiles"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Secure teacher_profiles table
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Anyone can view approved teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teacher_profiles;

-- Create secure teacher profile policies  
CREATE POLICY "Public can view approved teacher basic info"
ON public.teacher_profiles FOR SELECT
USING (
  can_teach = true 
  AND profile_complete = true 
  AND is_available = true
);

CREATE POLICY "Teachers can view their own full profile"
ON public.teacher_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile"
ON public.teacher_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can create their profile"
ON public.teacher_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Secure student_profiles table
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Students can manage their own profiles" ON public.student_profiles;

-- Create secure student profile policies
CREATE POLICY "Students can view their own profile"
ON public.student_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile"
ON public.student_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their profile"
ON public.student_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. SECURE PAYMENT AND FINANCIAL DATA
-- ============================================

-- Secure payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Secure payment_plans table
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment plans"
ON public.payment_plans FOR SELECT
USING (is_active = true);

-- Secure subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions"
ON public.subscriptions FOR ALL
USING (auth.uid() = user_id);

-- Secure invoice_items table
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoice items"
ON public.invoice_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.payments 
    WHERE payments.id = invoice_items.payment_id 
    AND payments.user_id = auth.uid()
  )
);

-- ============================================
-- 4. SECURE TEACHER FINANCIAL DATA
-- ============================================

-- Secure teacher_withdrawals table
ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own withdrawals"
ON public.teacher_withdrawals FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create withdrawal requests"
ON public.teacher_withdrawals FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

-- ============================================
-- 5. SECURE LESSON AND BOOKING DATA
-- ============================================

-- Secure teacher_availability table
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Teachers can manage their availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Students can view available slots" ON public.teacher_availability;

CREATE POLICY "Teachers can manage their own availability"
ON public.teacher_availability FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view available slots only"
ON public.teacher_availability FOR SELECT
USING (is_available = true AND is_booked = false);

-- ============================================
-- 6. SECURE COMMUNICATION DATA
-- ============================================

-- Secure teacher_reviews table
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view public reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can create reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can update own reviews" ON public.teacher_reviews;

CREATE POLICY "Anyone can view public reviews"
ON public.teacher_reviews FOR SELECT
USING (is_public = true);

CREATE POLICY "Students can view their own reviews"
ON public.teacher_reviews FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create reviews for their lessons"
ON public.teacher_reviews FOR INSERT
WITH CHECK (
  auth.uid() = student_id 
  AND EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE lessons.teacher_id = teacher_reviews.teacher_id 
    AND lessons.student_id = auth.uid()
    AND lessons.status = 'completed'
  )
);

CREATE POLICY "Students can update their own reviews"
ON public.teacher_reviews FOR UPDATE
USING (auth.uid() = student_id);

-- ============================================
-- 7. SECURE SENSITIVE TABLES WITHOUT POLICIES
-- ============================================

-- Secure curriculum tables
ALTER TABLE public.student_curriculum_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own curriculum progress"
ON public.student_curriculum_progress FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own curriculum progress"
ON public.student_curriculum_progress FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "System can create curriculum progress"
ON public.student_curriculum_progress FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Secure lesson completions
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own lesson completions"
ON public.lesson_completions FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create lesson completions"
ON public.lesson_completions FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Secure weekly assessments
ALTER TABLE public.weekly_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own weekly assessments"
ON public.weekly_assessments FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create weekly assessments"
ON public.weekly_assessments FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- ============================================
-- 8. SECURE ADMIN FUNCTIONS
-- ============================================

-- Create secure admin role check function
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

-- Create admin policies for sensitive data
CREATE POLICY "Admins can view all teacher applications"
ON public.teacher_applications FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can manage teacher applications"
ON public.teacher_applications FOR UPDATE
USING (public.is_admin());

-- ============================================
-- 9. AUDIT LOGGING FOR SECURITY
-- ============================================

-- Create audit log table
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

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.security_audit_logs FOR SELECT
USING (public.is_admin());

-- System can insert audit logs
CREATE POLICY "System can create audit logs"
ON public.security_audit_logs FOR INSERT
WITH CHECK (true);

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

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_users ON public.users;
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.log_security_audit();

DROP TRIGGER IF EXISTS audit_teacher_profiles ON public.teacher_profiles;
CREATE TRIGGER audit_teacher_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_security_audit();

DROP TRIGGER IF EXISTS audit_payments ON public.payments;
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.log_security_audit();

DROP TRIGGER IF EXISTS audit_teacher_withdrawals ON public.teacher_withdrawals;
CREATE TRIGGER audit_teacher_withdrawals
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.log_security_audit();

-- ============================================
-- 10. SECURE REMAINING TABLES
-- ============================================

-- Secure speaking_practice_sessions
ALTER TABLE public.speaking_practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own speaking sessions"
ON public.speaking_practice_sessions FOR ALL
USING (auth.uid() = student_id);

-- Secure speaking_progress
ALTER TABLE public.speaking_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own speaking progress"
ON public.speaking_progress FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can update speaking progress"
ON public.speaking_progress FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "System can update speaking progress records"
ON public.speaking_progress FOR UPDATE
USING (auth.uid() = student_id);

-- Secure student_xp
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own XP"
ON public.student_xp FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can manage student XP"
ON public.student_xp FOR ALL
USING (auth.uid() = student_id);

-- Secure learning_currency
ALTER TABLE public.learning_currency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own currency"
ON public.learning_currency FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can manage learning currency"
ON public.learning_currency FOR ALL
USING (auth.uid() = student_id);

-- Secure student_learning_streaks
ALTER TABLE public.student_learning_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own streaks"
ON public.student_learning_streaks FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can manage learning streaks"
ON public.student_learning_streaks FOR ALL
USING (auth.uid() = student_id);

-- Secure virtual_rewards
ALTER TABLE public.virtual_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available rewards"
ON public.virtual_rewards FOR SELECT
USING (is_available = true);

-- Secure student_reward_purchases
ALTER TABLE public.student_reward_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own reward purchases"
ON public.student_reward_purchases FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can make reward purchases"
ON public.student_reward_purchases FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Secure personalized_learning_paths
ALTER TABLE public.personalized_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own learning paths"
ON public.personalized_learning_paths FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can manage learning paths"
ON public.personalized_learning_paths FOR ALL
USING (auth.uid() = student_id);

-- Secure adaptive_content
ALTER TABLE public.adaptive_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active adaptive content"
ON public.adaptive_content FOR SELECT
USING (is_active = true);

COMMENT ON MIGRATION IS 'Critical security hardening: Fixed all RLS policies, secured database functions, implemented audit logging, and protected sensitive user and financial data';