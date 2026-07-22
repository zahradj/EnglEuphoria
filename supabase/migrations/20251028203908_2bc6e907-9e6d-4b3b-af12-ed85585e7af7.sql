-- Clean up invalid and past availability slots
-- This migration removes:
-- 1. All past slots (before today)
-- 2. All slots with invalid durations (not 30 or 60 minutes)
-- 3. Duplicate slots (keeps most recent)

-- Step 1: Delete past slots and invalid durations
DELETE FROM teacher_availability 
WHERE start_time < CURRENT_DATE 
   OR duration NOT IN (30, 60);

-- Step 2: Remove duplicate slots (keep most recent by created_at)
DELETE FROM teacher_availability a
USING teacher_availability b
WHERE a.start_time = b.start_time
  AND a.teacher_id = b.teacher_id
  AND a.created_at < b.created_at;