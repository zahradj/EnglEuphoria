-- Critical Security Hardening Migration - Core Tables Only
-- This addresses the most critical security vulnerabilities

-- 1. Enable RLS on core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 2. Secure Users Table - Most Critical
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only system can create users (through signup)
CREATE POLICY "System can create users" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 3. Secure Teacher Profiles
DROP POLICY IF EXISTS "Teacher profiles are public" ON public.teacher_profiles;

-- Public can view approved teacher profiles only
CREATE POLICY "Public can view approved teacher profiles" 
ON public.teacher_profiles 
FOR SELECT 
TO public
USING (profile_complete = true AND can_teach = true AND profile_approved_by_admin = true);

-- Teachers can manage their own profiles
CREATE POLICY "Teachers can manage own profile" 
ON public.teacher_profiles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Secure Student Profiles
-- Students can only view/update their own profiles
CREATE POLICY "Students can manage own profile" 
ON public.student_profiles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Secure Lessons
-- Users can only see lessons they're involved in
CREATE POLICY "Users can view own lessons" 
ON public.lessons 
FOR SELECT 
TO authenticated
USING (teacher_id = auth.uid() OR student_id = auth.uid());

-- Teachers and students can create lessons
CREATE POLICY "Users can create lessons" 
ON public.lessons 
FOR INSERT 
TO authenticated
WITH CHECK (teacher_id = auth.uid() OR student_id = auth.uid());

-- Teachers can update their lessons
CREATE POLICY "Teachers can update lessons" 
ON public.lessons 
FOR UPDATE 
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- 6. Secure Homework
-- Students and teachers can only see homework for their lessons
CREATE POLICY "Users can view own homework" 
ON public.homework 
FOR SELECT 
TO authenticated
USING (teacher_id = auth.uid() OR student_id = auth.uid());

-- Teachers can create homework
CREATE POLICY "Teachers can create homework" 
ON public.homework 
FOR INSERT 
TO authenticated
WITH CHECK (teacher_id = auth.uid());

-- Teachers and students can update homework
CREATE POLICY "Users can update own homework" 
ON public.homework 
FOR UPDATE 
TO authenticated
USING (teacher_id = auth.uid() OR student_id = auth.uid())
WITH CHECK (teacher_id = auth.uid() OR student_id = auth.uid());

-- 7. Secure Financial Data
-- Users can only see their own payments
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own payments" 
ON public.payments 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add security comments to critical tables
COMMENT ON TABLE public.users IS 'Contains sensitive user data. Access strictly controlled by RLS policies.';
COMMENT ON TABLE public.teacher_profiles IS 'Contains teacher personal and professional data. Public access limited to approved profiles only.';
COMMENT ON TABLE public.student_profiles IS 'Contains student private data. Access restricted to owner only.';
COMMENT ON TABLE public.payments IS 'Contains sensitive financial data. Private access only.';