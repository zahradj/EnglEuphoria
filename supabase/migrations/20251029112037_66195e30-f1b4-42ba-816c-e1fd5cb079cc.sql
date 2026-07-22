-- Remove duplicate slots (keep oldest)
DELETE FROM teacher_availability a
USING teacher_availability b
WHERE a.id > b.id
  AND a.teacher_id = b.teacher_id
  AND a.start_time = b.start_time
  AND a.is_available = b.is_available
  AND a.is_booked = b.is_booked;

-- Add unique constraint to prevent future duplicates
-- This ensures a teacher cannot have duplicate availability slots at the same time
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_teacher_slot
ON teacher_availability(teacher_id, start_time)
WHERE is_booked = false;

-- Enable real-time updates for teacher_availability table
ALTER TABLE teacher_availability REPLICA IDENTITY FULL;

-- Add table to real-time publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'teacher_availability'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE teacher_availability;
  END IF;
END $$;