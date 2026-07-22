INSERT INTO public.user_roles (user_id, role)
SELECT id, 'marketing'::app_role FROM auth.users WHERE lower(email) = 'engleuphoria@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;