CREATE OR REPLACE FUNCTION public.assign_marketing_role_for_engleuphoria()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = lower('engleuphoria@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'marketing'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_marketing_engleuphoria ON auth.users;

CREATE TRIGGER on_auth_user_created_assign_marketing_engleuphoria
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_marketing_role_for_engleuphoria();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'marketing'::public.app_role
FROM auth.users
WHERE lower(email) = lower('engleuphoria@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;