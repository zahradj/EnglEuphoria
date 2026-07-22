
-- Add hub_preference to teacher_applications
ALTER TABLE public.teacher_applications 
ADD COLUMN IF NOT EXISTS hub_preference text;

-- Drop old check constraint on teacher_profiles.hub_role if it exists
DO $$ BEGIN
  ALTER TABLE public.teacher_profiles DROP CONSTRAINT IF EXISTS teacher_profiles_hub_role_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Add expanded check constraint
ALTER TABLE public.teacher_profiles 
ADD CONSTRAINT teacher_profiles_hub_role_check 
CHECK (hub_role IN ('playground_specialist', 'academy_mentor', 'success_mentor', 'academy_success_mentor'));
