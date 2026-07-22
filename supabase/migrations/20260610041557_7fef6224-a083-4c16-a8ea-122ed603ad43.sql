-- 1. Backfill teacher_profiles.market_access from legacy market_region when array is empty or just default ['DZ']
UPDATE public.teacher_profiles
   SET market_access = ARRAY[market_region::text]
 WHERE market_region IS NOT NULL
   AND (
     market_access IS NULL
     OR cardinality(market_access) = 0
     OR (market_access = ARRAY['DZ']::text[] AND market_region::text = 'INTL')
   );

-- 2. Recreate get_approved_teachers to expose market_access
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
  profile_approved_by_admin boolean,
  market_access text[]
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
    COALESCE(tp.profile_approved_by_admin, false) AS profile_approved_by_admin,
    COALESCE(tp.market_access, ARRAY['DZ']::text[]) AS market_access
  FROM public.teacher_profiles tp
  JOIN public.users u ON tp.user_id = u.id
  WHERE COALESCE(tp.profile_complete, false) = true
    AND COALESCE(tp.can_teach, false) = true
    AND COALESCE(tp.is_available, true) = true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_approved_teachers() TO authenticated, anon;

-- 3. Rewrite booking trigger to validate against market_access array
CREATE OR REPLACE FUNCTION public.enforce_booking_market()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s_region public.market_region;
  t_markets text[];
BEGIN
  SELECT market_region INTO s_region FROM public.users WHERE id = NEW.student_id;
  SELECT COALESCE(market_access, ARRAY[market_region::text]) INTO t_markets
    FROM public.teacher_profiles WHERE user_id = NEW.teacher_id;

  IF s_region IS NOT NULL AND t_markets IS NOT NULL AND NOT (s_region::text = ANY(t_markets)) THEN
    RAISE EXCEPTION 'Cross-market bookings are not allowed (student=% teacher_markets=%)', s_region, t_markets;
  END IF;

  NEW.market_region := COALESCE(s_region, NEW.market_region, 'INTL');
  RETURN NEW;
END $$;
