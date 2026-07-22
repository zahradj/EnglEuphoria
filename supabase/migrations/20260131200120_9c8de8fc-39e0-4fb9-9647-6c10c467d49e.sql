-- Add pet and streak columns to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS pet_type TEXT DEFAULT 'lion',
ADD COLUMN IF NOT EXISTS pet_happiness INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS words_learned_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Add check constraints for valid values
ALTER TABLE public.student_profiles
ADD CONSTRAINT pet_happiness_range CHECK (pet_happiness >= 0 AND pet_happiness <= 100),
ADD CONSTRAINT current_streak_positive CHECK (current_streak >= 0),
ADD CONSTRAINT longest_streak_positive CHECK (longest_streak >= 0),
ADD CONSTRAINT words_learned_today_positive CHECK (words_learned_today >= 0);

-- Create index for streak-based queries
CREATE INDEX IF NOT EXISTS idx_student_profiles_current_streak ON public.student_profiles(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_student_profiles_last_activity ON public.student_profiles(last_activity_date);