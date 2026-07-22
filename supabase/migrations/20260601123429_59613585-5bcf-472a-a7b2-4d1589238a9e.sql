ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS flow_profile text NOT NULL DEFAULT 'standard';

COMMENT ON COLUMN public.curriculum_lessons.flow_profile IS
  'Lesson flow preset: ''standard'' (existing 6-slide arc) or ''novakid'' (9-beat: hook→vocab reveal→listen&repeat→picture match→drag sort→sentence builder→mini story→Q&A→reward). Opt-in per lesson.';