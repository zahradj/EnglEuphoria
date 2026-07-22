-- =====================================================
-- TEACHER CALENDAR DIAGNOSTICS - Manual SQL Test
-- =====================================================
-- Run this in your Supabase SQL Editor to diagnose issues
-- with teacher availability slot creation.
--
-- This will help identify:
-- - Authentication issues
-- - Role permission problems  
-- - RLS policy failures
-- - Database constraint violations
-- =====================================================

-- 1. Check your current session
-- Should return your user ID
SELECT 
  auth.uid() as your_user_id, 
  auth.role() as your_postgres_role;

-- 2. Check your role in the user_roles table
-- Should show 'teacher' if you're a teacher
SELECT 
  user_id,
  role,
  created_at
FROM user_roles 
WHERE user_id = auth.uid();

-- 3. Check your user profile
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM users 
WHERE id = auth.uid();

-- 4. List your existing availability slots
-- Shows what slots you currently have
SELECT 
  id,
  teacher_id,
  start_time,
  end_time,
  duration,
  is_available,
  is_booked,
  created_at
FROM teacher_availability
WHERE teacher_id = auth.uid()
ORDER BY start_time DESC
LIMIT 10;

-- 5. Count total slots by status
SELECT 
  COUNT(*) FILTER (WHERE is_available = true AND is_booked = false) as available_slots,
  COUNT(*) FILTER (WHERE is_booked = true) as booked_slots,
  COUNT(*) as total_slots
FROM teacher_availability
WHERE teacher_id = auth.uid();

-- 6. Test INSERT permission (WILL ACTUALLY CREATE A SLOT)
-- This creates a test slot 30 days in the future
-- DELETE IT AFTER if you don't want it
INSERT INTO teacher_availability (
  teacher_id,
  start_time,
  end_time,
  duration,
  lesson_type,
  is_available,
  is_booked
) VALUES (
  auth.uid(),
  (now() + interval '30 days')::timestamptz,
  (now() + interval '30 days' + interval '25 minutes')::timestamptz,
  25,
  'free_slot',
  true,
  false
)
RETURNING 
  id,
  teacher_id,
  start_time,
  'Successfully created test slot!' as message;

-- 7. If the above INSERT worked, delete the test slot
-- Replace 'YOUR_SLOT_ID' with the ID returned above
-- DELETE FROM teacher_availability 
-- WHERE id = 'YOUR_SLOT_ID';

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- 1. your_user_id should be a valid UUID
-- 2. role should be 'teacher'
-- 3. user profile should exist with your email
-- 4. existing slots (if any) should display
-- 5. counts should match your actual slots
-- 6. INSERT should succeed and return the new slot ID
--
-- IF ANY OF THESE FAIL:
-- - Query 1 returns NULL: Not logged in
-- - Query 2 returns nothing: No role set in user_roles
-- - Query 2 shows 'student': Wrong role
-- - Query 6 fails with permission error: RLS policy issue
-- - Query 6 fails with constraint error: Validation issue
-- =====================================================
