-- Fix missing user profile for zahra.djaanine@gmail.com
-- Insert missing user record
INSERT INTO users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as full_name,
  'student' as role
FROM auth.users
WHERE email = 'zahra.djaanine@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Insert missing user_role record
INSERT INTO user_roles (user_id, role)
SELECT id, 'student'
FROM auth.users
WHERE email = 'zahra.djaanine@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;