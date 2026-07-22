-- Add mistake_history and weekly_goal columns for AI personalization
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS mistake_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS weekly_goal TEXT,
ADD COLUMN IF NOT EXISTS weekly_goal_set_at TIMESTAMPTZ;

-- Index for efficient mistake queries
CREATE INDEX IF NOT EXISTS idx_student_profiles_mistake_history 
ON student_profiles USING GIN (mistake_history);

-- Add comments for documentation
COMMENT ON COLUMN student_profiles.mistake_history IS 
'Rolling array of last 50 mistakes for AI lesson personalization';
COMMENT ON COLUMN student_profiles.weekly_goal IS 
'Student-set short-term learning goal (e.g., Prepare for job interview)';