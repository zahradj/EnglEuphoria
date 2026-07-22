
-- 1. student_accessories: remove unrestricted insert
DROP POLICY IF EXISTS "System can grant accessories" ON public.student_accessories;

CREATE POLICY "Admins can grant accessories"
ON public.student_accessories
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. curriculum_skills: restrict writes to admin/content_creator
DROP POLICY IF EXISTS "Authenticated users can manage skills" ON public.curriculum_skills;

CREATE POLICY "Admins and content creators can insert skills"
ON public.curriculum_skills
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));

CREATE POLICY "Admins and content creators can update skills"
ON public.curriculum_skills
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));

CREATE POLICY "Admins and content creators can delete skills"
ON public.curriculum_skills
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));

-- 3. content_generation_jobs: remove public read
DROP POLICY IF EXISTS "Anyone can view generation jobs" ON public.content_generation_jobs;

CREATE POLICY "Admins and content creators can view generation jobs"
ON public.content_generation_jobs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));

-- 4. teacher_availability: drop policies that expose student_id on booked slots
DROP POLICY IF EXISTS "Authenticated users can view teacher availability" ON public.teacher_availability;
DROP POLICY IF EXISTS "Anyone can view available slots" ON public.teacher_availability;
-- Keep: "Students can view available teacher slots", "secure_availability_student",
-- "Students can view available slots only", "Authenticated users can view available slots"
-- (all of these already restrict to is_available=true AND is_booked=false, so student_id is null)
-- Keep teacher/admin own-data policies.
