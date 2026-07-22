-- Assign content_creator role to f.zahra.djaanine@gmail.com once the account exists
-- This will only insert if the user exists in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'content_creator'::app_role
FROM auth.users
WHERE email = 'f.zahra.djaanine@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;