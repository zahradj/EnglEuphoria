
CREATE OR REPLACE FUNCTION public.grant_engleuphoria_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) = 'engleuphoria@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_engleuphoria_created ON auth.users;
CREATE TRIGGER on_engleuphoria_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_engleuphoria_admin();

DROP TRIGGER IF EXISTS on_engleuphoria_confirmed ON auth.users;
CREATE TRIGGER on_engleuphoria_confirmed
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_engleuphoria_admin();

-- If the account already exists and is confirmed, grant now.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = 'engleuphoria@gmail.com'
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;
