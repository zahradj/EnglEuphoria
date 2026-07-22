CREATE OR REPLACE FUNCTION public.cancel_interview_slot(p_token text)
RETURNS TABLE (
  id uuid,
  status text,
  scheduled_at timestamptz,
  reschedule_count smallint,
  remaining_reschedules smallint,
  booking_expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interview public.interviews%ROWTYPE;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) < 8 THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  SELECT i.*
  INTO v_interview
  FROM public.interviews AS i
  WHERE i.room_token = trim(p_token)
     OR i.invite_token = trim(p_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  IF v_interview.status = 'cancelled' THEN
    RAISE EXCEPTION 'interview_cancelled' USING ERRCODE = 'P0001';
  END IF;

  IF v_interview.status = 'completed' THEN
    RAISE EXCEPTION 'interview_completed' USING ERRCODE = 'P0001';
  END IF;

  IF v_interview.status NOT IN ('scheduled', 'booked', 'in_progress')
     OR v_interview.scheduled_at IS NULL THEN
    RAISE EXCEPTION 'not_scheduled' USING ERRCODE = 'P0001';
  END IF;

  IF v_interview.scheduled_at <= now() + interval '15 minutes' THEN
    RAISE EXCEPTION 'too_close_to_start' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(v_interview.reschedule_count, 0) >= 2 THEN
    RAISE EXCEPTION 'reschedule_limit_reached' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  UPDATE public.interviews AS i
  SET status = 'awaiting_booking',
      scheduled_at = NULL,
      classroom_session_id = NULL,
      reschedule_count = (COALESCE(i.reschedule_count, 0) + 1)::smallint,
      booking_token_expires_at = now() + interval '48 hours',
      updated_at = now()
  WHERE i.id = v_interview.id
  RETURNING i.id,
            i.status,
            i.scheduled_at,
            i.reschedule_count,
            GREATEST(0, 2 - COALESCE(i.reschedule_count, 0))::smallint,
            i.booking_token_expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_interview_slot(text) TO anon, authenticated, service_role;