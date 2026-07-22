-- Create student_level enum type
CREATE TYPE public.student_level AS ENUM ('playground', 'academy', 'professional');

-- Add student_level and onboarding_completed columns to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS student_level public.student_level DEFAULT 'playground',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Sync existing student_profiles based on users.current_system
UPDATE public.student_profiles sp
SET student_level = CASE 
  WHEN u.current_system = 'KIDS' THEN 'playground'::public.student_level
  WHEN u.current_system = 'TEENS' THEN 'academy'::public.student_level
  WHEN u.current_system = 'ADULTS' THEN 'professional'::public.student_level
  ELSE 'playground'::public.student_level
END
FROM public.users u
WHERE sp.user_id = u.id;

-- Set onboarding_completed to true for existing students who have placement_test_score
UPDATE public.student_profiles
SET onboarding_completed = true
WHERE placement_test_score IS NOT NULL AND placement_test_score > 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_level ON public.student_profiles(student_level);
CREATE INDEX IF NOT EXISTS idx_student_profiles_onboarding ON public.student_profiles(onboarding_completed);