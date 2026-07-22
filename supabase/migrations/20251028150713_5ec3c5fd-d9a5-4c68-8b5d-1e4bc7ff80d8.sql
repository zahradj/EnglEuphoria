-- Add lesson tracking fields to student_curriculum_progress table
ALTER TABLE student_curriculum_progress 
ADD COLUMN IF NOT EXISTS current_lesson_id UUID REFERENCES lessons_content(id),
ADD COLUMN IF NOT EXISTS next_lesson_id UUID,
ADD COLUMN IF NOT EXISTS placement_test_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recommended_stage_id INTEGER;

-- Add curriculum linking fields to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS curriculum_lesson_id UUID REFERENCES lessons_content(id),
ADD COLUMN IF NOT EXISTS lesson_plan_notes TEXT,
ADD COLUMN IF NOT EXISTS prep_materials_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lesson_objectives JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reschedule_history JSONB DEFAULT '[]'::jsonb;

-- Create index for faster lesson lookups
CREATE INDEX IF NOT EXISTS idx_lessons_curriculum_lesson_id ON lessons(curriculum_lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_current_lesson ON student_curriculum_progress(current_lesson_id);

-- Create function to help with reschedule history tracking
CREATE OR REPLACE FUNCTION jsonb_array_append(target jsonb, new_value jsonb)
RETURNS jsonb AS $$
BEGIN
  IF target IS NULL OR jsonb_typeof(target) != 'array' THEN
    RETURN jsonb_build_array(new_value);
  ELSE
    RETURN target || jsonb_build_array(new_value);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;