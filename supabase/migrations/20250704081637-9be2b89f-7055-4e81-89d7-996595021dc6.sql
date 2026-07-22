-- Update teacher_profiles table to include required fields for profile completion
ALTER TABLE public.teacher_profiles 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_teach BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_approved_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_urls TEXT[];

-- Update teacher_profiles to require bio for profile completion
UPDATE public.teacher_profiles SET profile_complete = (
  bio IS NOT NULL AND bio != '' AND 
  video_url IS NOT NULL AND video_url != ''
);

-- Create trigger to automatically update profile_complete status
CREATE OR REPLACE FUNCTION public.update_teacher_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if required fields are filled
  NEW.profile_complete = (
    NEW.bio IS NOT NULL AND NEW.bio != '' AND 
    NEW.video_url IS NOT NULL AND NEW.video_url != ''
  );
  
  -- Auto-approve for now (admin can change this later)
  IF NEW.profile_complete = true AND OLD.profile_complete = false THEN
    NEW.can_teach = true;
    NEW.profile_approved_by_admin = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_teacher_profile_completion_trigger ON public.teacher_profiles;
CREATE TRIGGER update_teacher_profile_completion_trigger
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teacher_profile_completion();

-- Insert trigger for new profiles
DROP TRIGGER IF EXISTS insert_teacher_profile_completion_trigger ON public.teacher_profiles;
CREATE TRIGGER insert_teacher_profile_completion_trigger
  BEFORE INSERT ON public.teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teacher_profile_completion();

-- Create RLS policy for teacher profile updates
CREATE POLICY "Teachers can update their own profiles" ON public.teacher_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Create storage bucket for teacher certificates if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('teacher-certificates', 'teacher-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for teacher certificates
CREATE POLICY "Teachers can upload their certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'teacher-certificates' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Teachers can view their own certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'teacher-certificates'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view teacher certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'teacher-certificates');

-- Create API functions for teacher discovery
CREATE OR REPLACE FUNCTION public.get_approved_teachers()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  bio text,
  video_url text,
  profile_image_url text,
  specializations text[],
  accent text,
  languages_spoken text[],
  years_experience integer,
  rating numeric,
  total_reviews integer,
  hourly_rate_dzd integer,
  hourly_rate_eur integer,
  timezone text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.user_id,
    u.full_name,
    tp.bio,
    tp.video_url,
    tp.profile_image_url,
    tp.specializations,
    tp.accent,
    tp.languages_spoken,
    tp.years_experience,
    tp.rating,
    tp.total_reviews,
    tp.hourly_rate_dzd,
    tp.hourly_rate_eur,
    tp.timezone
  FROM public.teacher_profiles tp
  JOIN public.users u ON tp.user_id = u.id
  WHERE tp.profile_complete = true 
    AND tp.can_teach = true 
    AND tp.is_available = true;
END;
$$;