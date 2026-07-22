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
  v_row public.interviews%ROWTYPE;
BEGIN
  IF p_token IS NULL OR length(p_token) < 8 THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  SELECT * INTO v_row FROM public.interviews
  WHERE invite_token = p_token OR room_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  IF v_row.status = 'cancelled' THEN
    RAISE EXCEPTION 'interview_cancelled';
  END IF;

  IF v_row.status = 'completed' THEN
    RAISE EXCEPTION 'interview_completed';
  END IF;

  IF v_row.status NOT IN ('scheduled','booked') OR v_row.scheduled_at IS NULL THEN
    RAISE EXCEPTION 'not_scheduled';
  END IF;

  IF v_row.scheduled_at <= now() + interval '15 minutes' THEN
    RAISE EXCEPTION 'too_close_to_start';
  END IF;

  IF COALESCE(v_row.reschedule_count, 0) >= 2 THEN
    RAISE EXCEPTION 'reschedule_limit_reached';
  END IF;

  UPDATE public.interviews
  SET status = 'awaiting_booking',
      scheduled_at = NULL,
      reschedule_count = COALESCE(reschedule_count, 0) + 1,
      booking_token_expires_at = now() + interval '48 hours',
      updated_at = now()
  WHERE id = v_row.id
  RETURNING public.interviews.id,
            public.interviews.status,
            public.interviews.scheduled_at,
            public.interviews.reschedule_count,
            (2 - public.interviews.reschedule_count)::smallint AS remaining_reschedules,
            public.interviews.booking_token_expires_at
  INTO id, status, scheduled_at, reschedule_count, remaining_reschedules, booking_expires_at;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_interview_slot(text) TO anon, authenticated, service_role;