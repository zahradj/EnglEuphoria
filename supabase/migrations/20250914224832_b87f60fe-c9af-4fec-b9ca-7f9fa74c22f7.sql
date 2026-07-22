-- Phase 3 Complete: Final remaining database function security fixes

-- Fix all remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_approved_teachers()
RETURNS TABLE(id uuid, user_id uuid, full_name text, bio text, video_url text, profile_image_url text, specializations text[], accent text, languages_spoken text[], years_experience integer, rating numeric, total_reviews integer, hourly_rate_dzd integer, hourly_rate_eur integer, timezone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET current_members = current_members + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET current_members = current_members - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_community_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO user_community_stats (user_id, total_posts, last_activity_date)
  VALUES (NEW.author_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_posts = user_community_stats.total_posts + 1,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_teacher_available_balance(teacher_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_earned DECIMAL(10,2);
  pending_withdrawals DECIMAL(10,2);
  completed_withdrawals DECIMAL(10,2);
  available_balance DECIMAL(10,2);
BEGIN
  -- Get total earnings
  SELECT COALESCE(SUM(teacher_amount), 0.00)
  INTO total_earned
  FROM public.teacher_earnings
  WHERE teacher_id = teacher_uuid AND status = 'paid';
  
  -- Get pending withdrawals
  SELECT COALESCE(SUM(amount), 0.00)
  INTO pending_withdrawals
  FROM public.teacher_withdrawals
  WHERE teacher_id = teacher_uuid AND status IN ('pending', 'approved');
  
  -- Get completed withdrawals
  SELECT COALESCE(SUM(amount), 0.00)
  INTO completed_withdrawals
  FROM public.teacher_withdrawals
  WHERE teacher_id = teacher_uuid AND status = 'completed';
  
  available_balance := total_earned - pending_withdrawals - completed_withdrawals;
  
  RETURN GREATEST(available_balance, 0.00);
END;
$function$;

CREATE OR REPLACE FUNCTION public.book_teacher_slot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update the availability slot if it exists
  UPDATE public.teacher_availability 
  SET 
    is_booked = true,
    lesson_id = NEW.id,
    updated_at = now()
  WHERE teacher_id = NEW.teacher_id 
    AND start_time <= NEW.scheduled_at 
    AND end_time > NEW.scheduled_at
    AND is_available = true 
    AND is_booked = false;
    
  RETURN NEW;
END;
$function$;