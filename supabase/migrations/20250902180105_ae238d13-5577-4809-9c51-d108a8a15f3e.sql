-- Fix teacher_applications table security vulnerabilities
-- The current RLS policies are too permissive and allow unauthorized access

-- Drop existing potentially problematic policies
DROP POLICY IF EXISTS "Authenticated users can submit applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.teacher_applications;

-- Create secure RLS policies for teacher_applications
-- 1. Only allow authenticated users to insert their own applications
CREATE POLICY "Users can submit applications with their email" 
ON public.teacher_applications 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = email AND
  status = 'pending'
);

-- 2. Users can only view applications submitted with their email
CREATE POLICY "Users can view their own applications"
ON public.teacher_applications
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = email);

-- 3. Users can only update their own pending applications (limited fields)
CREATE POLICY "Users can update their own pending applications"
ON public.teacher_applications
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = email AND 
  status = 'pending'
)
WITH CHECK (
  auth.jwt() ->> 'email' = email AND
  status = 'pending'
);

-- 4. Admin users can manage all applications (strict admin check)
CREATE POLICY "Verified admins can manage all applications"
ON public.teacher_applications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ) OR
  auth.jwt() ->> 'email' = 'f.zahra.djaanine@engleuphoria.com'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ) OR
  auth.jwt() ->> 'email' = 'f.zahra.djaanine@engleuphoria.com'
);

-- 5. Ensure RLS is enabled (it should already be, but making sure)
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

-- Create audit logging for sensitive operations on teacher applications
CREATE OR REPLACE FUNCTION public.log_teacher_application_access()
RETURNS trigger AS $$
BEGIN
  -- Log access attempts to teacher applications for security monitoring
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    'teacher_applications',
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    jsonb_build_object(
      'timestamp', now(),
      'user_email', auth.jwt() ->> 'email',
      'ip_address', inet_client_addr()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS trigger_log_teacher_application_access ON public.teacher_applications;
CREATE TRIGGER trigger_log_teacher_application_access
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_applications
  FOR EACH ROW EXECUTE FUNCTION public.log_teacher_application_access();