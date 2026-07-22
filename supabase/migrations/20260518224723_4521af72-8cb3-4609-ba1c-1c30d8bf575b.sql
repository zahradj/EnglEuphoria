ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS grammar_package jsonb;

UPDATE storage.buckets SET public = false WHERE id = 'classroom-files';
UPDATE storage.buckets SET public = false WHERE id = 'teacher-applications';