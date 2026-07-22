-- Ensure classroom_sessions broadcasts realtime UPDATE/DELETE payloads with full row
ALTER TABLE public.classroom_sessions REPLICA IDENTITY FULL;

-- Add to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'classroom_sessions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_sessions';
  END IF;
END $$;

-- Helpful index for room lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_classroom_sessions_room_id ON public.classroom_sessions(room_id);