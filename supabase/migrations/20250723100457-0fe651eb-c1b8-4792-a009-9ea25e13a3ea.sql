-- Remove specific user accounts from public tables
-- First, let's find and delete from public.users table
DELETE FROM public.users 
WHERE email IN ('djaanine.zahra@gmail.com', 'zahra.djaanine@gmail.com');

-- Clean up any related data in other tables
-- Remove any teacher applications
DELETE FROM public.teacher_applications 
WHERE email IN ('djaanine.zahra@gmail.com', 'zahra.djaanine@gmail.com');

-- Remove any organization memberships for these users
DELETE FROM public.organization_members 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('djaanine.zahra@gmail.com', 'zahra.djaanine@gmail.com')
);

-- Remove any lesson bookings
DELETE FROM public.class_bookings 
WHERE student_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('djaanine.zahra@gmail.com', 'zahra.djaanine@gmail.com')
) OR teacher_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('djaanine.zahra@gmail.com', 'zahra.djaanine@gmail.com')
);

-- Remove any lessons
DELETE FROM public.lessons 
WHERE student_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('djaanine.zahra@gmail.com', 'zahra.djaanine@gmail.com')
) OR teacher_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('djaanine.zahra@gmail.com', 'zahra.djaanine@gmail.com')
);