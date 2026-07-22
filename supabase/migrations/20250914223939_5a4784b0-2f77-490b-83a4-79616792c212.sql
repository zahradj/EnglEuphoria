-- Phase 1: Critical Security Fixes (Fixed)
-- Drop ALL existing policies first to avoid conflicts

-- Drop all policies on lessons_content
DROP POLICY IF EXISTS "Authenticated users can create lessons" ON public.lessons_content;
DROP POLICY IF EXISTS "Authenticated users can delete lessons" ON public.lessons_content;
DROP POLICY IF EXISTS "Authenticated users can update lessons" ON public.lessons_content;
DROP POLICY IF EXISTS "Authenticated users can view active lessons" ON public.lessons_content;
DROP POLICY IF EXISTS "Authenticated users can view lesson content" ON public.lessons_content;
DROP POLICY IF EXISTS "Teachers can create lessons" ON public.lessons_content;
DROP POLICY IF EXISTS "Teachers can update their own lessons" ON public.lessons_content;
DROP POLICY IF EXISTS "Teachers can view lessons" ON public.lessons_content;

-- Drop all policies on teacher_profiles
DROP POLICY IF EXISTS "Anyone can view approved teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Students can view basic approved teacher info" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Admins can manage teacher profiles" ON public.teacher_profiles;

-- Drop all policies on teacher_availability
DROP POLICY IF EXISTS "Anyone can view teacher availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Teachers can manage their own availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Students can view available slots only" ON public.teacher_availability;
DROP POLICY IF EXISTS "Admins can view all availability" ON public.teacher_availability;

-- Drop existing policies on curriculum_levels
DROP POLICY IF EXISTS "Authenticated users can manage levels" ON public.curriculum_levels;
DROP POLICY IF EXISTS "Everyone can view curriculum levels" ON public.curriculum_levels;

-- Drop existing policies on student_profiles
DROP POLICY IF EXISTS "Students can manage their own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Teachers can view assigned students profiles" ON public.student_profiles;

-- Now create all the secure policies

-- 1. Secure lessons_content - Only teachers/admins can access
CREATE POLICY "Teachers and admins can view lesson content" ON public.lessons_content
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers can create lesson content" ON public.lessons_content
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers can update their own lesson content" ON public.lessons_content
FOR UPDATE USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Teachers can delete their own lesson content" ON public.lessons_content
FOR DELETE USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 2. Secure teacher_profiles - Restricted access
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

-- 3. Secure teacher_availability - Only show available slots to students
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

-- 4. Secure curriculum_levels
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

-- 5. Secure student_profiles
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