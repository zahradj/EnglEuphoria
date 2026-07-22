ALTER TABLE public.curriculum_lessons ADD COLUMN IF NOT EXISTS media_plan jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS storybook_style_pref text;