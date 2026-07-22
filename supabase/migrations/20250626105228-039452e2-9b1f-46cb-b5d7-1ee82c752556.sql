
-- Create a table to track classroom session states
CREATE TABLE public.classroom_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL UNIQUE,
  teacher_id UUID NOT NULL,
  session_status TEXT NOT NULL DEFAULT 'waiting' CHECK (session_status IN ('waiting', 'started', 'ended')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for session access
CREATE POLICY "Users can view sessions for their rooms" 
  ON public.classroom_sessions 
  FOR SELECT 
  USING (true); -- Allow all authenticated users to read session states

CREATE POLICY "Teachers can create sessions" 
  ON public.classroom_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their sessions" 
  ON public.classroom_sessions 
  FOR UPDATE 
  USING (auth.uid() = teacher_id);

-- Enable realtime for the table
ALTER TABLE public.classroom_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_sessions;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_classroom_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_classroom_sessions_updated_at
  BEFORE UPDATE ON public.classroom_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_classroom_sessions_updated_at();
