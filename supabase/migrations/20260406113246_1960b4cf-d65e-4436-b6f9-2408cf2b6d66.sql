
-- Clean up duplicate/conflicting SELECT policies and add a clear admin SELECT policy
DROP POLICY IF EXISTS "Users can view own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Admins can update any application" ON public.teacher_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Only admins can delete applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.teacher_applications;

-- Admins can do everything (using has_role to avoid RLS recursion)
CREATE POLICY "Admins full access to applications"
ON public.teacher_applications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON public.teacher_applications FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can update their own applications
CREATE POLICY "Users can update own applications"
ON public.teacher_applications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
