-- Create poll_responses table for storing student votes
CREATE TABLE public.poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.classroom_sessions(id) ON DELETE CASCADE,
  slide_id TEXT NOT NULL,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for poll responses
CREATE POLICY "Allow all poll responses" ON public.poll_responses FOR ALL USING (true);

-- Enable replica identity for real-time
ALTER TABLE public.poll_responses REPLICA IDENTITY FULL;

-- Add poll state columns to classroom_sessions
ALTER TABLE public.classroom_sessions
ADD COLUMN IF NOT EXISTS poll_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS poll_show_results BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_poll_slide_id TEXT;