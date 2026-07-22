-- Update users_role_check to include content_creator
ALTER TABLE public.users DROP CONSTRAINT users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'parent'::text, 'admin'::text, 'content_creator'::text]));

-- Now insert the user profile
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'content_creator'
FROM auth.users
WHERE email = 'f.zahra.djaanine@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'content_creator';

-- Assign content_creator role in user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'content_creator'::app_role
FROM auth.users
WHERE email = 'f.zahra.djaanine@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;