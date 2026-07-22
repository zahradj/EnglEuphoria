ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS parent_lesson_id uuid NULL
  REFERENCES public.curriculum_lessons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_parent_lesson_id
  ON public.curriculum_lessons(parent_lesson_id)
  WHERE parent_lesson_id IS NOT NULL;