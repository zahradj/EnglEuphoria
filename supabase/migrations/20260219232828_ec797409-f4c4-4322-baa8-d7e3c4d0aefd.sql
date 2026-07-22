-- Add shared_notes column to lesson_completions if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'lesson_completions' AND column_name = 'shared_notes'
  ) THEN
    ALTER TABLE public.lesson_completions ADD COLUMN shared_notes text DEFAULT '';
  END IF;
END $$;

-- Add daily_streak to student_profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'daily_streak'
  ) THEN
    ALTER TABLE public.student_profiles ADD COLUMN daily_streak integer DEFAULT 0;
    ALTER TABLE public.student_profiles ADD COLUMN last_streak_date date;
  END IF;
END $$;