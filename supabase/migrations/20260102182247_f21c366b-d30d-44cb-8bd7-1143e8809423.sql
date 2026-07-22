-- Add columns to classroom_sessions for real-time sync and drawing permissions
ALTER TABLE classroom_sessions 
ADD COLUMN IF NOT EXISTS current_slide_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lesson_id UUID,
ADD COLUMN IF NOT EXISTS lesson_slides JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS active_tool TEXT DEFAULT 'pointer',
ADD COLUMN IF NOT EXISTS lesson_title TEXT,
ADD COLUMN IF NOT EXISTS student_can_draw BOOLEAN DEFAULT false;

-- Enable realtime on classroom_sessions
ALTER TABLE classroom_sessions REPLICA IDENTITY FULL;