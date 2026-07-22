-- First, drop and recreate the problematic trigger function to fix the metadata column issue
CREATE OR REPLACE FUNCTION public.log_teacher_application_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access attempts to teacher applications for security monitoring
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    'teacher_applications',
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Now add user_id column to teacher_applications for secure RLS
ALTER TABLE public.teacher_applications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Populate user_id from existing users where email matches
UPDATE public.teacher_applications ta
SET user_id = u.id
FROM auth.users u
WHERE LOWER(ta.email) = LOWER(u.email)
AND ta.user_id IS NULL;

-- Drop insecure email-based policies
DROP POLICY IF EXISTS "Users can view own applications by user_id" ON public.teacher_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.teacher_applications;

-- Create secure user_id-based policies
CREATE POLICY "Users can view own applications"
ON public.teacher_applications
FOR SELECT
USING (user_id = auth.uid() OR is_user_admin());

CREATE POLICY "Users can update own applications"
ON public.teacher_applications
FOR UPDATE
USING (user_id = auth.uid() OR is_user_admin());

CREATE POLICY "Authenticated users can create applications"
ON public.teacher_applications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_teacher_applications_user_id 
ON public.teacher_applications(user_id);