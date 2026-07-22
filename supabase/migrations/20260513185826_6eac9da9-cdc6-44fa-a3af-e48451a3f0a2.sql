ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.homework_assignments ADD COLUMN IF NOT EXISTS image_style text;
ALTER TABLE public.curriculum_lessons ADD COLUMN IF NOT EXISTS image_style text;