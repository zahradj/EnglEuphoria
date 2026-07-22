-- Approve the first teacher profile for testing
UPDATE teacher_profiles 
SET 
  profile_approved_by_admin = true,
  can_teach = true,
  updated_at = now()
WHERE id = '9dba0b43-03f8-42f4-a971-80f031f77e44';