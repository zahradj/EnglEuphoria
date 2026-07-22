
-- Add video_status to teacher_profiles for the 3-stage video review funnel
ALTER TABLE public.teacher_profiles
ADD COLUMN IF NOT EXISTS video_status text DEFAULT 'pending'
CHECK (video_status IN ('pending', 'ai_checked', 'admin_review', 'approved', 'rejected'));

-- Add rejection reason for video
ALTER TABLE public.teacher_profiles
ADD COLUMN IF NOT EXISTS video_rejection_reason text;
