-- Teachers could previously only see feedback they themselves wrote
-- (policy "Teachers can view their own feedback": teacher_id = auth.uid()).
-- If a student switches teachers, the new teacher had no way to see the
-- previous teacher's notes on that student. Postgres OR-combines multiple
-- permissive policies for the same command, so this simply adds visibility
-- for any teacher who has actually taught the student (has a class_booking
-- with them), without weakening the existing per-teacher/per-student/admin
-- policies already in place.
CREATE POLICY "Teachers can view feedback for students they've taught"
ON public.lesson_feedback_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = lesson_feedback_submissions.student_id
      AND cb.teacher_id = auth.uid()
  )
);
