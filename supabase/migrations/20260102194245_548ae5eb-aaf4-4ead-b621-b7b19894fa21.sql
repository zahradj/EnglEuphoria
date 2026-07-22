-- Fix: Restrict payoneer_account_email from public access
-- Only the teacher themselves and admins should see payment details

-- Drop existing function first to allow signature change
DROP FUNCTION IF EXISTS public.get_approved_teachers();

-- Recreate get_approved_teachers function WITHOUT payoneer_account_email (it was never exposed before - the function is secure)
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
  -- Note: payoneer_account_email is intentionally excluded from public results
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_approved_teachers() TO authenticated, anon;

-- Create a secure function to get teacher profile WITH payment info (only for owner/admin)
CREATE OR REPLACE FUNCTION public.get_teacher_profile_with_payment(teacher_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  bio text,
  specializations text[],
  accent text,
  languages_spoken text[],
  video_url text,
  profile_image_url text,
  hourly_rate_dzd integer,
  hourly_rate_eur integer,
  years_experience integer,
  rating numeric,
  total_reviews integer,
  is_available boolean,
  timezone text,
  full_name text,
  payoneer_account_email text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if the requester is the owner or an admin
  IF auth.uid() = teacher_user_id OR public.has_role(auth.uid(), 'admin') THEN
    RETURN QUERY
    SELECT 
      tp.id,
      tp.user_id,
      tp.bio,
      tp.specializations,
      tp.accent,
      tp.languages_spoken,
      tp.video_url,
      tp.profile_image_url,
      tp.hourly_rate_dzd,
      tp.hourly_rate_eur,
      tp.years_experience,
      tp.rating,
      tp.total_reviews,
      tp.is_available,
      tp.timezone,
      u.full_name,
      tp.payoneer_account_email
    FROM teacher_profiles tp
    LEFT JOIN users u ON u.id = tp.user_id
    WHERE tp.user_id = teacher_user_id;
  ELSE
    -- Return NULL for payment info if not authorized
    RETURN QUERY
    SELECT 
      tp.id,
      tp.user_id,
      tp.bio,
      tp.specializations,
      tp.accent,
      tp.languages_spoken,
      tp.video_url,
      tp.profile_image_url,
      tp.hourly_rate_dzd,
      tp.hourly_rate_eur,
      tp.years_experience,
      tp.rating,
      tp.total_reviews,
      tp.is_available,
      tp.timezone,
      u.full_name,
      NULL::text as payoneer_account_email
    FROM teacher_profiles tp
    LEFT JOIN users u ON u.id = tp.user_id
    WHERE tp.user_id = teacher_user_id
      AND tp.can_teach = true
      AND tp.profile_complete = true;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_teacher_profile_with_payment(uuid) TO authenticated;