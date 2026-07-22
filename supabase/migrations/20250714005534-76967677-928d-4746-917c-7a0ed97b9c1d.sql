-- Add admin user for teacher application management
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'f.zahra.djaanine@engleuphoria.com',
  'Fatima Zahra Djaanine',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = COALESCE(EXCLUDED.full_name, users.full_name),
  updated_at = now();