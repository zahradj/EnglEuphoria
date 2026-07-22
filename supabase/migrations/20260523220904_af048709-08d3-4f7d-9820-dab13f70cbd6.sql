
-- 1. HOMEWORK: remove blanket "Teachers can manage homework" (ALL with is_user_teacher())
DROP POLICY IF EXISTS "Teachers can manage homework" ON public.homework;

-- Replace with a narrow DELETE policy so teachers can still delete their own homework
DROP POLICY IF EXISTS "Teachers can delete own homework" ON public.homework;
CREATE POLICY "Teachers can delete own homework"
ON public.homework
FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);

-- 2. STUDENT_SESSIONS: scope teacher SELECT to students they're booked with
DROP POLICY IF EXISTS "students_select_own_sessions" ON public.student_sessions;
CREATE POLICY "students_select_own_sessions"
ON public.student_sessions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'teacher'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = student_sessions.user_id
        AND cb.teacher_id = auth.uid()
    )
  )
);

-- 3. SYSTEM_TRANSITIONS: scope teacher SELECT to their students
DROP POLICY IF EXISTS "Teachers can view all transitions" ON public.system_transitions;
CREATE POLICY "Teachers can view their students transitions"
ON public.system_transitions
FOR SELECT
TO authenticated
USING (
  is_user_teacher()
  AND EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = system_transitions.user_id
      AND cb.teacher_id = auth.uid()
  )
);

-- 4. TEACHER_APPLICATIONS: hide internal admin columns from applicants via column-level REVOKE
--    RLS still gates rows; column privileges gate fields. Admins keep access via service role
--    and via their separate ALL policy (column grants applied to authenticated only).
REVOKE SELECT (admin_notes, interview_feedback, interviewed_by, contact_notes)
  ON public.teacher_applications FROM authenticated;
REVOKE SELECT (admin_notes, interview_feedback, interviewed_by, contact_notes)
  ON public.teacher_applications FROM anon;
