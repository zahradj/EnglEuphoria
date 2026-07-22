CREATE OR REPLACE FUNCTION public.book_interview_slot(p_token text, p_starts_at timestamp with time zone)
 RETURNS TABLE(interview_id uuid, scheduled_at timestamp with time zone, duration_minutes integer, teacher_email text, teacher_name text, room_token text, application_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_iv public.interviews%ROWTYPE;
  v_dur integer;
  v_end timestamptz;
  v_collision integer;
BEGIN
  IF p_token IS NULL OR length(p_token) < 8 THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;
  IF p_starts_at IS NULL OR p_starts_at < now() + interval '15 minutes' THEN
    RAISE EXCEPTION 'slot_too_soon' USING ERRCODE = 'P0001';
  END IF;

  SELECT i.* INTO v_iv
  FROM public.interviews AS i
  WHERE i.room_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  IF v_iv.status = 'cancelled' THEN
    RAISE EXCEPTION 'interview_cancelled' USING ERRCODE = 'P0001';
  END IF;

  IF v_iv.scheduled_at IS NOT NULL OR v_iv.status <> 'awaiting_booking' THEN
    RAISE EXCEPTION 'already_booked' USING ERRCODE = 'P0001';
  END IF;

  IF v_iv.booking_token_expires_at IS NOT NULL
     AND now() > v_iv.booking_token_expires_at THEN
    RAISE EXCEPTION 'booking_expired' USING ERRCODE = 'P0001';
  END IF;

  v_dur := COALESCE(v_iv.duration_minutes, 25);
  v_end := p_starts_at + (v_dur || ' minutes')::interval;

  SELECT count(*) INTO v_collision
  FROM public.interviews c
  WHERE c.id <> v_iv.id
    AND c.scheduled_at IS NOT NULL
    AND c.status IN ('scheduled','in_progress')
    AND c.scheduled_at < v_end
    AND (c.scheduled_at + (COALESCE(c.duration_minutes, 25) || ' minutes')::interval) > p_starts_at;

  IF v_collision > 0 THEN
    RAISE EXCEPTION 'slot_taken' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.interviews AS i
  SET scheduled_at = p_starts_at,
      status = 'scheduled',
      updated_at = now()
  WHERE i.id = v_iv.id
  RETURNING i.* INTO v_iv;

  interview_id := v_iv.id;
  scheduled_at := v_iv.scheduled_at;
  duration_minutes := v_iv.duration_minutes;
  teacher_email := v_iv.teacher_email;
  teacher_name := v_iv.teacher_name;
  room_token := v_iv.room_token;
  application_id := v_iv.application_id;
  RETURN NEXT;
END;
$function$;

REVOKE ALL ON FUNCTION public.book_interview_slot(text, timestamp with time zone) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_interview_slot(text, timestamp with time zone) TO service_role;