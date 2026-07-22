-- Create quiz_responses table for storing student answers
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
  slide_id TEXT NOT NULL,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (classroom context)
CREATE POLICY "Allow all quiz responses" ON quiz_responses FOR ALL USING (true);

-- Enable realtime for live updates
ALTER TABLE quiz_responses REPLICA IDENTITY FULL;

-- Add quiz state columns to classroom_sessions
ALTER TABLE classroom_sessions
ADD COLUMN IF NOT EXISTS quiz_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiz_reveal_answer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiz_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_quiz_slide_id TEXT;

-- Create index for faster lookups
CREATE INDEX idx_quiz_responses_session_slide ON quiz_responses(session_id, slide_id);
CREATE INDEX idx_quiz_responses_student ON quiz_responses(student_id);