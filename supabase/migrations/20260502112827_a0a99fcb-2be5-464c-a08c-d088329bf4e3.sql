
-- Progressive onboarding wizard support
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS hub_type TEXT,
  ADD COLUMN IF NOT EXISTS lesson_duration INTEGER,
  ADD COLUMN IF NOT EXISTS learning_reason TEXT,
  ADD COLUMN IF NOT EXISTS profile_completion_dismissed_at TIMESTAMPTZ;

-- Validate hub_type values when provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_profiles_hub_type_check'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT student_profiles_hub_type_check
      CHECK (hub_type IS NULL OR hub_type IN ('playground','academy','professional'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_profiles_learning_reason_check'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT student_profiles_learning_reason_check
      CHECK (learning_reason IS NULL OR learning_reason IN ('school','career','travel','fun'));
  END IF;
END$$;
