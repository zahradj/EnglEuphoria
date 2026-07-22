-- Add content_creator role to admin user so they can use the content creator dashboard
INSERT INTO public.user_roles (user_id, role)
VALUES ('7368f171-f0df-45ce-8e8e-cc3413c803ed', 'content_creator')
ON CONFLICT (user_id, role) DO NOTHING;