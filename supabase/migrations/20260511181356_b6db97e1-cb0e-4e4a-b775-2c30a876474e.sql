-- Ensure DELETE/UPDATE realtime payloads include full old-row column values,
-- so client-side realtime filters never silently drop them.
ALTER TABLE public.teacher_availability REPLICA IDENTITY FULL;

-- Make sure the table is part of the realtime publication.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public'
       AND tablename = 'teacher_availability'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_availability';
  END IF;
END $$;