-- Fix RLS policies for teacher_availability table

-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can manage own availability" ON teacher_availability;
DROP POLICY IF EXISTS "Students can view available slots" ON teacher_availability;
DROP POLICY IF EXISTS "System can update booking status" ON teacher_availability;

-- Create comprehensive policies

-- Allow authenticated users to view available, non-booked slots
CREATE POLICY "Anyone can view available slots"
ON teacher_availability FOR SELECT
TO authenticated
USING (is_available = true);

-- Teachers can insert their own availability slots
CREATE POLICY "Teachers can create own availability"
ON teacher_availability FOR INSERT
TO authenticated
WITH CHECK (teacher_id = auth.uid());

-- Teachers can update their own availability slots
CREATE POLICY "Teachers can update own availability"
ON teacher_availability FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid());

-- Teachers can delete their own non-booked slots
CREATE POLICY "Teachers can delete own non-booked slots"
ON teacher_availability FOR DELETE
TO authenticated
USING (teacher_id = auth.uid() AND is_booked = false);

-- System/students can update booking status when creating lessons
CREATE POLICY "System can mark slots as booked"
ON teacher_availability FOR UPDATE
TO authenticated
USING (is_available = true AND is_booked = false)
WITH CHECK (is_booked = true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher_date 
ON teacher_availability(teacher_id, start_time);

CREATE INDEX IF NOT EXISTS idx_teacher_availability_available 
ON teacher_availability(is_available, is_booked, start_time) 
WHERE is_available = true;

-- Ensure the handle_lesson_booking trigger exists and works correctly
-- This trigger should automatically update is_booked when a lesson is created
CREATE OR REPLACE FUNCTION update_availability_on_lesson_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark the availability slot as booked
  UPDATE teacher_availability 
  SET 
    is_booked = true,
    lesson_id = NEW.id
  WHERE teacher_id = NEW.teacher_id 
    AND start_time <= NEW.scheduled_at 
    AND end_time > NEW.scheduled_at
    AND is_available = true 
    AND is_booked = false;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_availability_on_lesson_booking ON lessons;

-- Create trigger for lesson bookings
CREATE TRIGGER trigger_update_availability_on_lesson_booking
AFTER INSERT ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_availability_on_lesson_booking();

-- Create function to free up slots when lessons are cancelled
CREATE OR REPLACE FUNCTION free_availability_on_lesson_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE teacher_availability 
    SET 
      is_booked = false,
      lesson_id = NULL
    WHERE lesson_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_free_availability_on_lesson_cancel ON lessons;

-- Create trigger for lesson cancellations
CREATE TRIGGER trigger_free_availability_on_lesson_cancel
AFTER UPDATE ON lessons
FOR EACH ROW
WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
EXECUTE FUNCTION free_availability_on_lesson_cancel();