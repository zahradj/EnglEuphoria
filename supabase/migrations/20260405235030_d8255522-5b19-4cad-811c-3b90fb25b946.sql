
DROP POLICY IF EXISTS "Admins can manage teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Authenticated users can view approved teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Public can view basic teacher info" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Students can view basic approved teacher info" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "secure_teacher_profiles_own" ON public.teacher_profiles;
DROP POLICY IF EXISTS "secure_teacher_profiles_public" ON public.teacher_profiles;
DROP POLICY IF EXISTS "secure_teacher_profiles_update" ON public.teacher_profiles;
DROP POLICY IF EXISTS "teacher_profiles_own_write" ON public.teacher_profiles;
