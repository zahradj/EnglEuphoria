
DROP POLICY IF EXISTS "Teachers can manage own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Authenticated users can view approved teachers" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Admins can manage all teacher profiles" ON public.teacher_profiles;

CREATE POLICY "Teachers can manage own profile"
ON public.teacher_profiles FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can view approved teachers"
ON public.teacher_profiles FOR SELECT TO authenticated
USING (
  profile_complete = true AND can_teach = true AND profile_approved_by_admin = true
);

CREATE POLICY "Admins can manage all teacher profiles"
ON public.teacher_profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
