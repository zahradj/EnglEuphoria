-- Create lesson_progress_tracking table for tracking student progress within lessons
CREATE TABLE IF NOT EXISTS lesson_progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  lesson_content_id UUID NOT NULL,
  current_slide_index INT DEFAULT 0,
  total_slides INT,
  slides_completed INT[] DEFAULT '{}',
  xp_earned INT DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress_tracking(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_content ON lesson_progress_tracking(lesson_content_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress_tracking(status);

-- Enable RLS
ALTER TABLE lesson_progress_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can manage their own lesson progress"
  ON lesson_progress_tracking
  FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view student progress for their students"
  ON lesson_progress_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.student_id = lesson_progress_tracking.student_id
      AND lessons.teacher_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lesson_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_accessed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_progress_updated_at();