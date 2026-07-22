UPDATE public.curriculum_lessons
SET is_published = true
WHERE is_published = false
  AND created_by IS NOT NULL;