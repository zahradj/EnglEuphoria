ALTER TABLE public.homework_assignments
  DROP CONSTRAINT IF EXISTS homework_assignments_lesson_id_fkey;

ALTER TABLE public.homework_assignments
  ADD CONSTRAINT homework_assignments_lesson_id_fkey
  FOREIGN KEY (lesson_id)
  REFERENCES public.curriculum_lessons(id)
  ON DELETE SET NULL;