-- Critical Security Hardening Migration - Phase 1
-- Fix database vulnerabilities and implement proper RLS policies

-- ============================================
-- 1. SECURE DATABASE FUNCTIONS (Fix search_path vulnerabilities)  
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

-- ============================================
-- 2. SECURE ADMIN FUNCTIONS
-- ============================================

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
-- 3. LOCK DOWN USER DATA TABLES (Critical Data Protection)
-- ============================================

-- Secure users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create secure ones
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
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
-- 4. SECURE PAYMENT AND FINANCIAL DATA
-- ============================================

-- Secure payments table (uses student_id, not user_id)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own payments" ON public.payments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can create payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Secure payment_plans table
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment plans" ON public.payment_plans
FOR SELECT USING (is_active = true);

-- ============================================
-- 5. SECURE TEACHER FINANCIAL DATA
-- ============================================

-- Secure teacher_withdrawals table
ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own withdrawals" ON public.teacher_withdrawals
FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create withdrawal requests" ON public.teacher_withdrawals
FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- ============================================
-- 6. SECURE LESSON AND BOOKING DATA
-- ============================================

-- Secure teacher_availability table
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage their availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Students can view available slots" ON public.teacher_availability;

CREATE POLICY "Teachers can manage their own availability" ON public.teacher_availability
FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view available slots only" ON public.teacher_availability
FOR SELECT USING (is_available = true AND is_booked = false);

-- ============================================
-- 7. SECURE COMMUNICATION DATA
-- ============================================

-- Secure teacher_reviews table
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can create reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can update own reviews" ON public.teacher_reviews;

CREATE POLICY "Anyone can view public reviews" ON public.teacher_reviews
FOR SELECT USING (is_public = true);

CREATE POLICY "Students can view their own reviews" ON public.teacher_reviews
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create reviews for their lessons" ON public.teacher_reviews
FOR INSERT WITH CHECK (
  auth.uid() = student_id 
  AND EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE lessons.teacher_id = teacher_reviews.teacher_id 
    AND lessons.student_id = auth.uid()
    AND lessons.status = 'completed'
  )
);

CREATE POLICY "Students can update their own reviews" ON public.teacher_reviews
FOR UPDATE USING (auth.uid() = student_id);

-- ============================================
-- 8. AUDIT LOGGING FOR SECURITY
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