-- Add admin user for teacher application management
-- First check if user already exists, if not insert new admin user
DO $$
BEGIN
  -- Check if the email already exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'f.zahra.djaanine@engleuphoria.com') THEN
    -- Insert new admin user
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      gen_random_uuid(),
      'f.zahra.djaanine@engleuphoria.com',
      'Fatima Zahra Djaanine',
      'admin'
    );
  ELSE
    -- Update existing user to admin role
    UPDATE public.users 
    SET role = 'admin', updated_at = now()
    WHERE email = 'f.zahra.djaanine@engleuphoria.com';
  END IF;
END $$;