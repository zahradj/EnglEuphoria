-- CRITICAL SECURITY HARDENING - Final Implementation
-- Clean up existing policies and implement secure access control

-- ============================================
-- 1. SECURE DATABASE FUNCTIONS (Fix search_path issues)
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
-- 2. SECURE CRITICAL FINANCIAL DATA (Highest Priority)
-- ============================================

-- Secure teacher_withdrawals table - CRITICAL for financial security
ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for clean slate
DROP POLICY IF EXISTS "Teachers can view their own withdrawals" ON public.teacher_withdrawals;
DROP POLICY IF EXISTS "Teachers can create withdrawal requests" ON public.teacher_withdrawals;
DROP POLICY IF EXISTS "teacher_withdrawals_insert" ON public.teacher_withdrawals;
DROP POLICY IF EXISTS "teacher_withdrawals_select" ON public.teacher_withdrawals;

-- Create secure withdrawal policies
CREATE POLICY "secure_teacher_withdrawals_select" ON public.teacher_withdrawals
FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "secure_teacher_withdrawals_insert" ON public.teacher_withdrawals
FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Secure teacher_earnings - CRITICAL for payment data
ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_earnings_select" ON public.teacher_earnings;
DROP POLICY IF EXISTS "teacher_earnings_insert" ON public.teacher_earnings;
DROP POLICY IF EXISTS "teacher_earnings_update" ON public.teacher_earnings;

CREATE POLICY "secure_teacher_earnings_select" ON public.teacher_earnings
FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "secure_teacher_earnings_insert" ON public.teacher_earnings
FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "secure_teacher_earnings_update" ON public.teacher_earnings
FOR UPDATE USING (auth.uid() = teacher_id);

-- Secure payments table - CRITICAL for transaction data
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "System can create payments" ON public.payments;

CREATE POLICY "secure_payments_select" ON public.payments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "secure_payments_insert" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ============================================
-- 3. SECURE USER PROFILE DATA
-- ============================================

-- Secure users table - Contains sensitive personal data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "System can create user profiles" ON public.users;

CREATE POLICY "secure_users_select" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "secure_users_update" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "secure_users_insert" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Secure teacher_profiles - Contains professional data and rates
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved teacher basic info" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can view their own full profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can create their profile" ON public.teacher_profiles;

-- Only show basic info for approved teachers to public
CREATE POLICY "secure_teacher_profiles_public" ON public.teacher_profiles
FOR SELECT USING (can_teach = true AND profile_complete = true);

-- Teachers can see their full profile including financial info
CREATE POLICY "secure_teacher_profiles_own" ON public.teacher_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "secure_teacher_profiles_update" ON public.teacher_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "secure_teacher_profiles_insert" ON public.teacher_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Secure student_profiles - Contains personal learning data
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can update their own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can create their profile" ON public.student_profiles;

CREATE POLICY "secure_student_profiles_select" ON public.student_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "secure_student_profiles_update" ON public.student_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "secure_student_profiles_insert" ON public.student_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. SECURE LEARNING AND PROGRESS DATA
-- ============================================

-- Secure student_xp - Learning currency data
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own XP" ON public.student_xp;
DROP POLICY IF EXISTS "System can manage student XP" ON public.student_xp;

CREATE POLICY "secure_student_xp_select" ON public.student_xp
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "secure_student_xp_all" ON public.student_xp
FOR ALL USING (auth.uid() = student_id);

-- Secure learning_currency
ALTER TABLE public.learning_currency ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own currency" ON public.learning_currency;
DROP POLICY IF EXISTS "System can manage learning currency" ON public.learning_currency;

CREATE POLICY "secure_learning_currency_select" ON public.learning_currency
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "secure_learning_currency_all" ON public.learning_currency
FOR ALL USING (auth.uid() = student_id);

-- ============================================
-- 5. SECURE COMMUNICATION AND REVIEWS
-- ============================================

-- Secure teacher_reviews - Contains feedback and ratings
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can view their own reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can create reviews" ON public.teacher_reviews;
DROP POLICY IF EXISTS "Students can update their own reviews" ON public.teacher_reviews;

CREATE POLICY "secure_reviews_public" ON public.teacher_reviews
FOR SELECT USING (is_public = true);

CREATE POLICY "secure_reviews_own" ON public.teacher_reviews
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "secure_reviews_insert" ON public.teacher_reviews
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "secure_reviews_update" ON public.teacher_reviews
FOR UPDATE USING (auth.uid() = student_id);

-- ============================================
-- 6. SECURE AVAILABILITY AND SCHEDULING
-- ============================================

-- Secure teacher_availability - Critical for scheduling integrity
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage their own availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Students can view available slots only" ON public.teacher_availability;

CREATE POLICY "secure_availability_teacher" ON public.teacher_availability
FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "secure_availability_student" ON public.teacher_availability
FOR SELECT USING (is_available = true AND is_booked = false);

-- ============================================
-- 7. CREATE SECURITY AUDIT TABLE
-- ============================================

-- Create audit table for monitoring sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_admin_only" ON public.security_audit_logs
FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_system_insert" ON public.security_audit_logs
FOR INSERT WITH CHECK (true);