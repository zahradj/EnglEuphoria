-- Add second placement test tracking columns to student_profiles
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS placement_test_2_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS placement_test_2_score INTEGER,
ADD COLUMN IF NOT EXISTS placement_test_2_total INTEGER,
ADD COLUMN IF NOT EXISTS final_cefr_level TEXT;

-- Add comment for clarity
COMMENT ON COLUMN student_profiles.placement_test_2_completed_at IS 'Timestamp when the advanced placement test (A1-C2) was completed';
COMMENT ON COLUMN student_profiles.placement_test_2_score IS 'Score achieved in the advanced placement test';
COMMENT ON COLUMN student_profiles.placement_test_2_total IS 'Total possible points in the advanced placement test';
COMMENT ON COLUMN student_profiles.final_cefr_level IS 'Final CEFR level determined after completing both placement tests';