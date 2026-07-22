
-- 1) Atomic, race-safe booking: one invitation = one slot, ever.
CREATE OR REPLACE FUNCTION public.book_interview_slot(
  p_token text,
  p_starts_at timestamptz
)
RETURNS TABLE (
  interview_id uuid,
  scheduled_at timestamptz,
  duration_minutes integer,
  teacher_email text,
  teacher_name text,
  room_token text,
  application_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_iv public.interviews%ROWTYPE;
  v_dur integer;
  v_end timestamptz;
  v_collision integer;
BEGIN
  IF p_token IS NULL OR length(p_token) < 8 THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;
  IF p_starts_at IS NULL OR p_starts_at < now() + interval '1 hour' THEN
    RAISE EXCEPTION 'slot_too_soon' USING ERRCODE = 'P0001';
  END IF;

  -- Lock the row so two clicks cannot both succeed.
  SELECT * INTO v_iv
  FROM public.interviews
  WHERE room_token = p_token
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

  UPDATE public.interviews
  SET scheduled_at = p_starts_at,
      status = 'scheduled',
      updated_at = now()
  WHERE id = v_iv.id
  RETURNING * INTO v_iv;

  interview_id := v_iv.id;
  scheduled_at := v_iv.scheduled_at;
  duration_minutes := v_iv.duration_minutes;
  teacher_email := v_iv.teacher_email;
  teacher_name := v_iv.teacher_name;
  room_token := v_iv.room_token;
  application_id := v_iv.application_id;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.book_interview_slot(text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.book_interview_slot(text, timestamptz) TO service_role;

-- 2) Bound applicant can read their own interview row.
DROP POLICY IF EXISTS "Bound applicant can view own interview" ON public.interviews;
CREATE POLICY "Bound applicant can view own interview"
ON public.interviews
FOR SELECT
TO authenticated
USING (applicant_user_id = auth.uid());

-- 3) Bound applicant can read + update the interview classroom row.
DROP POLICY IF EXISTS "Bound applicant can view interview classroom" ON public.classroom_states;
CREATE POLICY "Bound applicant can view interview classroom"
ON public.classroom_states
FOR SELECT
TO authenticated
USING (
  is_interview = true
  AND EXISTS (
    SELECT 1 FROM public.interviews i
    WHERE i.classroom_session_id = classroom_states.session_id
      AND i.applicant_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Bound applicant can update interview classroom" ON public.classroom_states;
CREATE POLICY "Bound applicant can update interview classroom"
ON public.classroom_states
FOR UPDATE
TO authenticated
USING (
  is_interview = true
  AND EXISTS (
    SELECT 1 FROM public.interviews i
    WHERE i.classroom_session_id = classroom_states.session_id
      AND i.applicant_user_id = auth.uid()
  )
)
WITH CHECK (
  is_interview = true
  AND EXISTS (
    SELECT 1 FROM public.interviews i
    WHERE i.classroom_session_id = classroom_states.session_id
      AND i.applicant_user_id = auth.uid()
  )
);

-- 4) Repair: undo accidental admin-as-applicant bindings.
UPDATE public.interviews
SET applicant_user_id = NULL
WHERE applicant_user_id IS NOT NULL
  AND applicant_user_id = admin_id;
