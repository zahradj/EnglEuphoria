-- Where a student stopped INSIDE a lesson, saved automatically so the same lesson picks up there next time
-- (any device). The map already keeps a lesson "current" until it is completed and then unlocks the next one;
-- this adds the missing piece: the position within the lesson. One row per student per lesson, deleted when
-- the lesson is completed. A separate table (not new columns on student_lesson_progress) so nothing that
-- already reads that table can break.

CREATE TABLE IF NOT EXISTS public.student_lesson_resume (
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    uuid        NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  scene_id     text,
  scene_index  integer     NOT NULL CHECK (scene_index >= 0),
  total_scenes integer     NOT NULL CHECK (total_scenes >= 1),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.student_lesson_resume ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students manage their own lesson position" ON public.student_lesson_resume;
CREATE POLICY "Students manage their own lesson position" ON public.student_lesson_resume
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- A parent can see how far each of their approved children got.
DROP POLICY IF EXISTS "Parents read their children's lesson position" ON public.student_lesson_resume;
CREATE POLICY "Parents read their children's lesson position" ON public.student_lesson_resume
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_parent_relationships r
    WHERE r.parent_id = auth.uid() AND r.student_id = student_lesson_resume.user_id
  ));

-- Teachers can see it too (same rule as student_lesson_progress: "Teachers can view all progress").
DROP POLICY IF EXISTS "Teachers read lesson positions" ON public.student_lesson_resume;
CREATE POLICY "Teachers read lesson positions" ON public.student_lesson_resume
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_student_lesson_resume_user ON public.student_lesson_resume(user_id, updated_at DESC);
