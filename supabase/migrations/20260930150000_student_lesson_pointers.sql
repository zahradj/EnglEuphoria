-- Per-student "current lesson" pointer for the Master Library resolver.
--
-- The app has been storing this in student_curriculum_progress, but that
-- table belongs to the older generated-curriculum system and can never
-- accept the app's writes:
--   * curriculum_id is NOT NULL (FK to generated_curriculums) and the app
--     never has one to send;
--   * current_lesson_id is an FK to lessons_content, while the app writes
--     curriculum_lessons ids;
--   * the app upserts ON CONFLICT (student_id), but the only unique key is
--     (student_id, curriculum_id).
-- Every write (end-of-lesson advance, admin "set current lesson", teacher
-- mid-class LessonSwitcher) has therefore failed silently — the table has
-- 0 rows platform-wide — and every student restarts from the hub's first
-- lesson in every class.
--
-- This dedicated table replaces it for that one purpose. The legacy table is
-- left untouched. No backfill: there is no existing pointer data to move.

CREATE TABLE IF NOT EXISTS public.student_lesson_pointers (
  student_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_lesson_id uuid REFERENCES public.curriculum_lessons(id) ON DELETE SET NULL,
  updated_by        uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_lesson_pointers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.student_lesson_pointers TO authenticated;

-- Students read their own pointer (the classroom resolves the lesson in the
-- student's browser too). They cannot change it.
CREATE POLICY "Students can view own lesson pointer"
  ON public.student_lesson_pointers FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Admins: full read/write (admin "set current lesson" editor).
CREATE POLICY "Admins can view lesson pointers"
  ON public.student_lesson_pointers FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert lesson pointers"
  ON public.student_lesson_pointers FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lesson pointers"
  ON public.student_lesson_pointers FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Teachers: read/write only for students they have a booking with
-- (end-of-lesson advance and mid-class LessonSwitcher run as the teacher).
CREATE POLICY "Teachers can view their students' lesson pointers"
  ON public.student_lesson_pointers FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = student_lesson_pointers.student_id
      AND cb.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can insert their students' lesson pointers"
  ON public.student_lesson_pointers FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = student_lesson_pointers.student_id
      AND cb.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can update their students' lesson pointers"
  ON public.student_lesson_pointers FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = student_lesson_pointers.student_id
      AND cb.teacher_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = student_lesson_pointers.student_id
      AND cb.teacher_id = auth.uid()
  ));
