
-- Drop old constraint and recreate with all valid cycle types
ALTER TABLE public.curriculum_lessons DROP CONSTRAINT IF EXISTS curriculum_lessons_cycle_type_check;

ALTER TABLE public.curriculum_lessons ADD CONSTRAINT curriculum_lessons_cycle_type_check
  CHECK (cycle_type IS NULL OR cycle_type = ANY (ARRAY['discovery', 'ladder', 'bridge', 'reinforcement', 'review', 'quiz']));
