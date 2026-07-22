-- Update the teacher profile to enable teaching since profile is complete
UPDATE public.teacher_profiles 
SET can_teach = true, profile_approved_by_admin = true, updated_at = NOW()
WHERE user_id = '1f13bcce-f367-4e72-93e9-cd88a074e93e' 
  AND profile_complete = true 
  AND bio IS NOT NULL 
  AND video_url IS NOT NULL;