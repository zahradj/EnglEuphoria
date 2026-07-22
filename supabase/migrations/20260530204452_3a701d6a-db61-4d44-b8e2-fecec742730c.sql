
-- Add session struggles tracking for live classroom
ALTER TABLE public.classroom_states
  ADD COLUMN IF NOT EXISTS session_struggles jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Ensure homework_assignment_students is in realtime publication (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'homework_assignment_students'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.homework_assignment_students';
  END IF;
END $$;
