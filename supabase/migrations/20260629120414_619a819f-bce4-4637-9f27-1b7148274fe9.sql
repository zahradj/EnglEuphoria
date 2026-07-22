ALTER TABLE public.curriculum_lessons ADD COLUMN IF NOT EXISTS story_plan jsonb;
CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_story_plan ON public.curriculum_lessons USING GIN (story_plan);