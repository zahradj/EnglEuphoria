
-- Security definer function for auto-heal (bypasses RLS)
CREATE OR REPLACE FUNCTION public.ensure_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Update get_user_role to include parent in priority
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'content_creator' THEN 2
      WHEN 'teacher' THEN 3
      WHEN 'parent' THEN 4
      WHEN 'student' THEN 5
      ELSE 6
    END
  LIMIT 1
$$;

-- Backfill missing user_roles from users.role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, u.role::app_role
FROM public.users u
WHERE u.role IS NOT NULL
  AND u.role::text IN ('admin', 'content_creator', 'teacher', 'parent', 'student')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = u.id AND ur.role = u.role::app_role
  );
