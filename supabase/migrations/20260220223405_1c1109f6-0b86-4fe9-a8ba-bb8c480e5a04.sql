-- Add fluency_score column to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS fluency_score INTEGER NOT NULL DEFAULT 0;