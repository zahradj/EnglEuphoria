ALTER TABLE public.classroom_sessions
  DROP CONSTRAINT IF EXISTS classroom_sessions_session_status_check;

ALTER TABLE public.classroom_sessions
  ADD CONSTRAINT classroom_sessions_session_status_check
  CHECK (session_status = ANY (ARRAY['waiting', 'started', 'active', 'ended']));