-- Phase 1: Critical Security Fixes
-- Fix 1: Secure Educational Content - Only allow organization members and teachers/admins to access lessons

-- Drop overly permissive policies on lessons_content
DROP POLICY IF EXISTS "Authenticated users can view active lessons" ON public.lessons_content;
DROP POLICY IF EXISTS "Authenticated users can view lesson content" ON public.lessons_content;
DROP POLICY IF EXISTS "Teachers can view lessons" ON public.lessons_content;

-- Create secure policies for lessons_content
CREATE POLICY "Teachers and admins can view lesson content" ON public.lessons_content
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers can manage their own lesson content" ON public.lessons_content
FOR ALL USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Fix 2: Secure Teacher Personal Data - Restrict teacher profiles access

-- Drop overly permissive policies on teacher_profiles
DROP POLICY IF EXISTS "Anyone can view approved teacher profiles" ON public.teacher_profiles;

-- Create secure policies for teacher_profiles
CREATE POLICY "Teachers can view their own profile" ON public.teacher_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile" ON public.teacher_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can view basic approved teacher info" ON public.teacher_profiles
FOR SELECT USING (
  can_teach = true 
  AND profile_complete = true 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'student'
  )
);

CREATE POLICY "Admins can manage teacher profiles" ON public.teacher_profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Fix 3: Secure Teacher Schedule Data - Restrict availability access

-- Drop overly permissive policies on teacher_availability
DROP POLICY IF EXISTS "Anyone can view teacher availability" ON public.teacher_availability;

-- Create secure policies for teacher_availability
CREATE POLICY "Teachers can manage their own availability" ON public.teacher_availability
FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view available slots only" ON public.teacher_availability
FOR SELECT USING (
  is_available = true 
  AND is_booked = false 
  AND start_time > now()
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'student'
  )
);

CREATE POLICY "Admins can view all availability" ON public.teacher_availability
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Fix 4: Add missing RLS policies for audit_logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- Fix 5: Secure lesson_payments access
CREATE POLICY "Users can view their own lesson payments" ON public.lesson_payments
FOR SELECT USING (
  auth.uid() = student_id OR 
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Fix 6: Secure teacher_withdrawals access
CREATE POLICY "Teachers can manage their own withdrawals" ON public.teacher_withdrawals
FOR ALL USING (
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Fix 7: Secure systematic_lessons access
CREATE POLICY "Teachers and admins can access systematic lessons" ON public.systematic_lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'admin')
  )
);

-- Fix 8: Secure curriculum_levels access to prevent data leakage
DROP POLICY IF EXISTS "Authenticated users can manage levels" ON public.curriculum_levels;

CREATE POLICY "Everyone can view curriculum levels" ON public.curriculum_levels
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage curriculum levels" ON public.curriculum_levels
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update curriculum levels" ON public.curriculum_levels
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete curriculum levels" ON public.curriculum_levels
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Fix 9: Secure student_profiles access
CREATE POLICY "Students can manage their own profile" ON public.student_profiles
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view assigned students profiles" ON public.student_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE teacher_id = auth.uid() 
    AND student_id = student_profiles.user_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);