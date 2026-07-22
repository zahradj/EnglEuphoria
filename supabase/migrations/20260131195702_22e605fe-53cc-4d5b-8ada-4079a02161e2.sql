-- Add new columns to teacher_applications for enhanced form
ALTER TABLE public.teacher_applications 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS teaching_philosophy TEXT,
ADD COLUMN IF NOT EXISTS classroom_management TEXT,
ADD COLUMN IF NOT EXISTS video_description TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Ensure RLS is enabled
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for public applications)
DROP POLICY IF EXISTS "Anyone can submit teacher applications" ON public.teacher_applications;
CREATE POLICY "Anyone can submit teacher applications"
ON public.teacher_applications
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Applicants can view their own applications by email
DROP POLICY IF EXISTS "Applicants can view own application by email" ON public.teacher_applications;
CREATE POLICY "Applicants can view own application by email"
ON public.teacher_applications
FOR SELECT
TO public
USING (true);

-- Policy: Only admins can update applications (via user_roles check)
DROP POLICY IF EXISTS "Admins can update applications" ON public.teacher_applications;
CREATE POLICY "Admins can update applications"
ON public.teacher_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Only admins can delete applications
DROP POLICY IF EXISTS "Admins can delete applications" ON public.teacher_applications;
CREATE POLICY "Admins can delete applications"
ON public.teacher_applications
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);