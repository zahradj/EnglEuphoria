-- Secure teacher_profiles: restrict public reads and allow only authenticated access
-- Enable RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Clean up existing conflicting policies (if any)
DROP POLICY IF EXISTS "Authenticated users can view approved teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can insert their profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teacher_profiles;

-- Read access: only authenticated users, and only for approved/teachable profiles
CREATE POLICY "Authenticated users can view approved teacher profiles"
ON public.teacher_profiles
FOR SELECT
TO authenticated
USING (
  COALESCE(profile_complete, false) = true
  AND COALESCE(can_teach, false) = true
  AND COALESCE(profile_approved_by_admin, false) = true
);

-- Allow a teacher to view their own profile regardless of approval state
CREATE POLICY "Teachers can view their own profile"
ON public.teacher_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Preserve existing functionality: allow teachers to create their own profile rows
CREATE POLICY "Teachers can insert their profile"
ON public.teacher_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Preserve existing functionality: allow teachers to update their own profile rows
CREATE POLICY "Teachers can update their own profile"
ON public.teacher_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
