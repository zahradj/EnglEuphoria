ALTER TABLE public.student_assignments
  DROP CONSTRAINT IF EXISTS student_assignments_lesson_id_fkey;

ALTER TABLE public.student_assignments
  ADD CONSTRAINT student_assignments_lesson_id_fkey
  FOREIGN KEY (lesson_id)
  REFERENCES public.curriculum_lessons(id)
  ON DELETE CASCADE;