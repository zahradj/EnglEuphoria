-- Phase 6: Database Schema Improvements - Complete Fix

-- STEP 1: Drop ALL existing duration constraints across all tables
ALTER TABLE teacher_availability DROP CONSTRAINT IF EXISTS valid_duration;
ALTER TABLE teacher_availability DROP CONSTRAINT IF EXISTS valid_availability_duration;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS valid_lesson_duration;
ALTER TABLE lesson_packages DROP CONSTRAINT IF EXISTS lesson_packages_duration_minutes_check;

-- STEP 2: Update all existing data to use standardized 30/60 minute durations

-- Update lessons table
UPDATE lessons
SET duration = 30, duration_minutes = 30
WHERE duration < 40 OR duration_minutes < 40;

UPDATE lessons
SET duration = 60, duration_minutes = 60
WHERE duration >= 40 OR duration_minutes >= 40;

-- Update teacher_availability table
UPDATE teacher_availability
SET duration = 30
WHERE duration < 40;

UPDATE teacher_availability
SET duration = 60
WHERE duration >= 40;

-- Update lesson_packages table
UPDATE lesson_packages
SET duration_minutes = 30
WHERE duration_minutes < 40;

UPDATE lesson_packages
SET duration_minutes = 60
WHERE duration_minutes >= 40;

-- STEP 3: Add NEW check constraints for standardized durations
ALTER TABLE lessons
ADD CONSTRAINT valid_lesson_duration 
CHECK (duration IN (30, 60) AND duration_minutes IN (30, 60));

ALTER TABLE teacher_availability
ADD CONSTRAINT valid_availability_duration 
CHECK (duration IN (30, 60));

ALTER TABLE lesson_packages
ADD CONSTRAINT valid_package_duration 
CHECK (duration_minutes IN (30, 60));

-- STEP 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_booking 
ON teacher_availability (teacher_id, is_available, is_booked, start_time)
WHERE is_available = true AND is_booked = false;

CREATE INDEX IF NOT EXISTS idx_lessons_scheduling
ON lessons (student_id, scheduled_at, status)
WHERE status != 'cancelled';

-- STEP 5: Add trigger to prevent booking past slots
CREATE OR REPLACE FUNCTION check_future_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scheduled_at < NOW() THEN
    RAISE EXCEPTION 'Cannot book lessons in the past';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_past_bookings ON lessons;
CREATE TRIGGER prevent_past_bookings
BEFORE INSERT ON lessons
FOR EACH ROW EXECUTE FUNCTION check_future_booking();

-- STEP 6: Add trigger to auto-release slots when lessons are cancelled
CREATE OR REPLACE FUNCTION release_cancelled_lesson_slot()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE teacher_availability
    SET is_booked = false,
        lesson_id = NULL
    WHERE lesson_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_release_slots ON lessons;
CREATE TRIGGER auto_release_slots
AFTER UPDATE ON lessons
FOR EACH ROW 
WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
EXECUTE FUNCTION release_cancelled_lesson_slot();

-- STEP 7: Enable real-time updates
ALTER TABLE teacher_availability REPLICA IDENTITY FULL;