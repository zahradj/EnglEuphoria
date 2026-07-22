-- Remove the old constraint that only allows 25 and 55 minutes
ALTER TABLE teacher_availability DROP CONSTRAINT valid_duration;

-- Add the new constraint that allows 30 and 60 minutes
ALTER TABLE teacher_availability ADD CONSTRAINT valid_duration 
CHECK (duration = ANY (ARRAY[30, 60]));