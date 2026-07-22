
ALTER TABLE public.classroom_sessions
  ADD COLUMN IF NOT EXISTS shared_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS session_context jsonb DEFAULT '{}';
