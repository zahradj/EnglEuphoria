-- 1. Update get_approved_teachers to expose hub_role + approval flags
DROP FUNCTION IF EXISTS public.get_approved_teachers();

CREATE OR REPLACE FUNCTION public.get_approved_teachers()
RETURNS TABLE(
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
  timezone text,
  hub_role text,
  is_available boolean,
  can_teach boolean,
  profile_complete boolean,
  profile_approved_by_admin boolean
)
LANGUAGE plpgsql
STABLE
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
    tp.timezone,
    tp.hub_role,
    COALESCE(tp.is_available, true) AS is_available,
    COALESCE(tp.can_teach, false) AS can_teach,
    COALESCE(tp.profile_complete, false) AS profile_complete,
    COALESCE(tp.profile_approved_by_admin, false) AS profile_approved_by_admin
  FROM public.teacher_profiles tp
  JOIN public.users u ON tp.user_id = u.id
  WHERE COALESCE(tp.profile_complete, false) = true
    AND COALESCE(tp.can_teach, false) = true
    AND COALESCE(tp.is_available, true) = true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_approved_teachers() TO authenticated, anon;

-- 2. Helper: map hub_role -> (duration, hub_specialty)
CREATE OR REPLACE FUNCTION public.hub_role_slot_profile(p_hub_role text)
RETURNS TABLE(target_duration integer, target_hub_specialty text)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    CASE
      WHEN p_hub_role = 'playground_specialist' THEN 30
      ELSE 60
    END AS target_duration,
    CASE
      WHEN p_hub_role = 'playground_specialist' THEN 'Playground'
      WHEN p_hub_role = 'success_mentor' THEN 'Professional'
      WHEN p_hub_role = 'academy_mentor' THEN 'Academy'
      WHEN p_hub_role = 'academy_success_mentor' THEN 'Academy'
      ELSE 'Academy'
    END AS target_hub_specialty;
$$;

-- 3. Trigger: when teacher_profiles.hub_role changes, normalize all future
--    unbooked availability rows so the teacher is bookable in the new hub.
CREATE OR REPLACE FUNCTION public.realign_availability_to_hub_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_duration integer;
  v_hub_specialty text;
BEGIN
  IF TG_OP = 'UPDATE' AND COALESCE(NEW.hub_role, '') = COALESCE(OLD.hub_role, '') THEN
    RETURN NEW;
  END IF;

  SELECT target_duration, target_hub_specialty
    INTO v_duration, v_hub_specialty
  FROM public.hub_role_slot_profile(NEW.hub_role);

  UPDATE public.teacher_availability ta
     SET duration = v_duration,
         end_time = ta.start_time + make_interval(mins => v_duration),
         hub_specialty = v_hub_specialty
   WHERE ta.teacher_id = NEW.user_id
     AND ta.is_booked = false
     AND ta.start_time >= now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_realign_availability_to_hub_role ON public.teacher_profiles;
CREATE TRIGGER trg_realign_availability_to_hub_role
AFTER INSERT OR UPDATE OF hub_role ON public.teacher_profiles
FOR EACH ROW
EXECUTE FUNCTION public.realign_availability_to_hub_role();

-- 4. Backfill: re-align existing future unbooked slots for every teacher
--    so the current Playground specialist immediately becomes bookable.
UPDATE public.teacher_availability ta
   SET duration = prof.target_duration,
       end_time = ta.start_time + make_interval(mins => prof.target_duration),
       hub_specialty = prof.target_hub_specialty
  FROM public.teacher_profiles tp
  CROSS JOIN LATERAL public.hub_role_slot_profile(tp.hub_role) prof
 WHERE ta.teacher_id = tp.user_id
   AND ta.is_booked = false
   AND ta.start_time >= now()
   AND (
     ta.duration IS DISTINCT FROM prof.target_duration
     OR COALESCE(ta.hub_specialty, '') IS DISTINCT FROM prof.target_hub_specialty
   );