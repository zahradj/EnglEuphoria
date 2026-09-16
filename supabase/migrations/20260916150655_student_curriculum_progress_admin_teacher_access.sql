-- student_curriculum_progress previously had RLS policies only for the
-- student themselves (view/update own row). This silently blocked every
-- admin- or teacher-initiated write/read of the table: the admin
-- "current lesson" editor, the automated advance-on-lesson-complete call
-- in LessonWrapUpDialog, and the pre-existing LessonSwitcher.tsx mid-class
-- lesson override all run as the admin/teacher's own session, not the
-- student's, so they were being rejected by RLS with no working code path
-- exercising them to surface the failure until now.

CREATE POLICY "Admins can view all curriculum progress"
  ON public.student_curriculum_progress FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert curriculum progress"
  ON public.student_curriculum_progress FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update curriculum progress"
  ON public.student_curriculum_progress FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view progress of their students"
  ON public.student_curriculum_progress FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM class_bookings cb
    WHERE cb.student_id = student_curriculum_progress.student_id
      AND cb.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can insert progress for their students"
  ON public.student_curriculum_progress FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM class_bookings cb
    WHERE cb.student_id = student_curriculum_progress.student_id
      AND cb.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can update progress of their students"
  ON public.student_curriculum_progress FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM class_bookings cb
    WHERE cb.student_id = student_curriculum_progress.student_id
      AND cb.teacher_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM class_bookings cb
    WHERE cb.student_id = student_curriculum_progress.student_id
      AND cb.teacher_id = auth.uid()
  ));
