-- Let a teacher read the post-class 👍/👎 their students leave about THEIR
-- lessons. Before this only the student, their parents and admins could, so
-- the "student feedback to the teacher" step of the lesson flow never
-- reached the teacher.
DROP POLICY IF EXISTS "Teachers can read feedback about their lessons" ON public.post_class_feedback;
CREATE POLICY "Teachers can read feedback about their lessons" ON public.post_class_feedback
  FOR SELECT
  USING (teacher_id = (SELECT auth.uid()));
