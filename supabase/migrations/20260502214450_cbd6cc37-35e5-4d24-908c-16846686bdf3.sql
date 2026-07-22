CREATE OR REPLACE FUNCTION public.book_class_slot(
  p_slot_ids uuid[],
  p_teacher_id uuid,
  p_scheduled_at timestamptz,
  p_duration integer,
  p_hub_type text,
  p_lesson_title text,
  p_is_trial boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_locked_count integer;
  v_expected_count integer;
  v_lesson_id uuid;
  v_booking_id uuid;
  v_classroom_id uuid;
  v_session_id text;
  v_meeting_link text;
  v_credits_available integer;
  v_consumed boolean;
  v_hub_slug text;
  v_hub_title text;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_slot_ids IS NULL OR array_length(p_slot_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No slot specified' USING ERRCODE = '22023';
  END IF;

  IF p_teacher_id IS NULL OR p_scheduled_at IS NULL THEN
    RAISE EXCEPTION 'Missing teacher or scheduled time' USING ERRCODE = '22023';
  END IF;

  v_expected_count := array_length(p_slot_ids, 1);

  -- Normalize hub values for the two destinations
  v_hub_slug := lower(coalesce(p_hub_type, 'academy'));
  IF v_hub_slug IN ('success', 'professional') THEN
    v_hub_slug := 'professional';
    v_hub_title := 'Professional';
  ELSIF v_hub_slug = 'playground' THEN
    v_hub_title := 'Playground';
  ELSE
    v_hub_slug := 'academy';
    v_hub_title := 'Academy';
  END IF;

  -- Lock the actual slot rows (no aggregate + FOR UPDATE)
  WITH locked AS (
    SELECT id
    FROM public.teacher_availability
    WHERE id = ANY(p_slot_ids)
      AND teacher_id = p_teacher_id
      AND is_available = true
      AND is_booked = false
      AND start_time > now()
    FOR UPDATE
  )
  SELECT count(*) INTO v_locked_count FROM locked;

  IF v_locked_count <> v_expected_count THEN
    RAISE EXCEPTION 'This slot is no longer available. Please pick another time.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Credit check (skip for trial)
  IF NOT p_is_trial THEN
    SELECT (total_credits - used_credits - expired_credits)
      INTO v_credits_available
    FROM public.student_credits
    WHERE student_id = v_student_id;

    IF COALESCE(v_credits_available, 0) <= 0 THEN
      RAISE EXCEPTION 'You have no credits available. Please purchase a package to book.'
        USING ERRCODE = 'P0003';
    END IF;
  END IF;

  -- Create the lesson record (write both duration columns to satisfy valid_lesson_duration)
  INSERT INTO public.lessons (
    title, teacher_id, student_id, scheduled_at,
    duration, duration_minutes, status, cost
  ) VALUES (
    p_lesson_title, p_teacher_id, v_student_id, p_scheduled_at,
    p_duration, p_duration, 'scheduled', 0
  )
  RETURNING id INTO v_lesson_id;

  -- Create the booking (BEFORE INSERT trigger fills session_id, meeting_link, classroom_id)
  INSERT INTO public.class_bookings (
    student_id, teacher_id, scheduled_at, duration,
    booking_type, price_paid, status, lesson_id, hub_type
  ) VALUES (
    v_student_id, p_teacher_id, p_scheduled_at, p_duration,
    CASE WHEN p_is_trial THEN 'trial' ELSE 'standard' END,
    0, 'confirmed', v_lesson_id, v_hub_slug
  )
  RETURNING id, classroom_id, session_id, meeting_link
    INTO v_booking_id, v_classroom_id, v_session_id, v_meeting_link;

  -- Mark the source slots booked
  UPDATE public.teacher_availability
  SET is_booked = true,
      student_id = v_student_id,
      lesson_id = v_lesson_id,
      lesson_title = p_lesson_title,
      updated_at = now()
  WHERE id = ANY(p_slot_ids);

  -- Insert the appointment row using the constraint-safe title-case hub
  INSERT INTO public.appointments (
    student_id, teacher_id, availability_id, status,
    hub_type, scheduled_at, duration, meeting_link, lesson_id
  ) VALUES (
    v_student_id, p_teacher_id, p_slot_ids[1], 'confirmed',
    v_hub_title, p_scheduled_at, p_duration,
    v_meeting_link, v_lesson_id::text
  );

  -- Consume a credit when not a trial
  IF NOT p_is_trial THEN
    SELECT public.consume_credit(v_student_id) INTO v_consumed;
    IF NOT v_consumed THEN
      RAISE EXCEPTION 'Failed to consume credit. Please try again.'
        USING ERRCODE = 'P0003';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'classroom_id', v_classroom_id,
    'session_id', v_session_id,
    'meeting_link', v_meeting_link,
    'lesson_id', v_lesson_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_class_slot(uuid[], uuid, timestamptz, integer, text, text, boolean) TO authenticated;