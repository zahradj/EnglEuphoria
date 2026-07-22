-- Fix: "infinite recursion detected in policy for relation
-- homework_assignment_students" (Postgres 42P17), live-verified against the
-- running database. homework_assignment_students' "Teachers can manage
-- assignment students" policy does an EXISTS lookup into homework_assignments,
-- whose own "Students can view assignments assigned to them" policy does an
-- EXISTS lookup right back into homework_assignment_students — a genuine
-- cross-table RLS cycle since both were created in 20251015144446. This has
-- silently broken every student's homework fetch since that migration:
-- homeworkService.getStudentAssignments() catches the error and returns [],
-- so students just saw "no homework" instead of a visible failure.
--
-- Fix using the same SECURITY DEFINER pattern already used for has_role()
-- elsewhere in this codebase (explicitly commented there as "prevents
-- recursion") — the helper functions bypass RLS internally, so evaluating
-- them doesn't re-trigger the other table's policies.

CREATE OR REPLACE FUNCTION public.is_homework_assignment_teacher(_assignment_id uuid, _teacher_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.homework_assignments
    WHERE id = _assignment_id AND teacher_id = _teacher_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_homework_assignment_student(_assignment_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.homework_assignment_students
    WHERE assignment_id = _assignment_id AND student_id = _student_id
  )
$$;

-- homework_assignments: replace the direct EXISTS-into-homework_assignment_students
-- with the SECURITY DEFINER equivalent.
DROP POLICY IF EXISTS "Students can view assignments assigned to them" ON public.homework_assignments;
CREATE POLICY "Students can view assignments assigned to them"
ON public.homework_assignments
FOR SELECT
USING (public.is_homework_assignment_student(id, auth.uid()));

-- homework_assignment_students: replace the direct EXISTS-into-homework_assignments
-- with the SECURITY DEFINER equivalent.
DROP POLICY IF EXISTS "Teachers can manage assignment students" ON public.homework_assignment_students;
CREATE POLICY "Teachers can manage assignment students"
ON public.homework_assignment_students
FOR ALL
USING (public.is_homework_assignment_teacher(assignment_id, auth.uid()))
WITH CHECK (public.is_homework_assignment_teacher(assignment_id, auth.uid()));
