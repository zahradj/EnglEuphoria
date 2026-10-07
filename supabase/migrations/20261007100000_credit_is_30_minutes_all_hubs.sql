-- One credit = 30 minutes in EVERY hub (owner decision, 2026-10-07).
--
-- Students of all hubs can now book a 30-minute lesson (1 credit) or a 60-minute
-- lesson (2 credits). Playground already worked this way; Academy and Success
-- hour lessons used to cost 1 credit, so to keep every student's value unchanged
-- this migration, ONCE:
--   * doubles Academy / Success students' credit balances (total / used / expired),
--   * doubles credits_used of their lessons that have not happened yet (so a
--     cancel or teacher-cancel refunds the full amount),
--   * doubles the credit count of Academy / Success packs (prices unchanged:
--     Academy EUR 15/hour -> EUR 7.50 per credit, same per-credit price as Playground).
-- and teaches book_class_slot to charge duration/30 credits in every hub.
-- Re-running is safe: a marker row makes the data part run only once.

CREATE TABLE IF NOT EXISTS public.schema_data_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schema_data_migrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.schema_data_migrations WHERE name = 'credit_is_30_minutes_all_hubs') THEN
    RAISE NOTICE 'credit unit migration already applied - skipping data changes';
    RETURN;
  END IF;

  -- balances of Academy / Success students
  UPDATE public.student_credits sc
  SET total_credits = sc.total_credits * 2,
      used_credits = sc.used_credits * 2,
      expired_credits = sc.expired_credits * 2,
      updated_at = now()
  FROM public.student_profiles sp
  WHERE sp.user_id = sc.student_id
    AND sp.student_level IN ('academy', 'professional');

  -- lessons that are still to come: they were paid with 1 credit per hour
  UPDATE public.lessons l
  SET credits_used = l.credits_used * 2
  FROM public.class_bookings cb
  WHERE cb.lesson_id = l.id
    AND cb.hub_type IN ('academy', 'professional')
    AND l.credits_used > 0
    AND l.status NOT IN ('cancelled', 'completed')
    AND l.scheduled_at > now();

  -- packs sold to Academy / Success students (price unchanged)
  UPDATE public.credit_packs
  SET session_count = session_count * 2, updated_at = now()
  WHERE student_level IN ('academy', 'professional');

  INSERT INTO public.schema_data_migrations (name) VALUES ('credit_is_30_minutes_all_hubs');
END $$;

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
  v_total_minutes integer;
  v_first_start timestamptz;
  v_last_end timestamptz;
  v_credits_needed integer := 1;
  v_lesson_id uuid;
  v_booking_id uuid;
  v_classroom_id uuid;
  v_session_id text;
  v_meeting_link text;
  v_credits_available integer;
  v_consumed boolean;
  v_hub_slug text;
  v_hub_title text;
  v_multi_hub boolean := false;
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

  -- One credit = 30 minutes, in every hub. A lesson is 30 minutes (one credit)
  -- or 60 minutes (two credits; one 60-minute slot or two back-to-back 30s).
  IF p_duration NOT IN (30, 60) THEN
    RAISE EXCEPTION 'A lesson is 30 or 60 minutes.' USING ERRCODE = '22023';
  END IF;
  IF p_is_trial AND p_duration <> 30 THEN
    RAISE EXCEPTION 'The free trial lesson is 30 minutes.' USING ERRCODE = '22023';
  END IF;
  v_credits_needed := p_duration / 30;

  -- Lock the slot rows and measure them.
  WITH locked AS (
    SELECT id, start_time, end_time, duration
    FROM public.teacher_availability
    WHERE id = ANY(p_slot_ids)
      AND teacher_id = p_teacher_id
      AND is_available = true
      AND is_booked = false
      AND start_time > now()
    FOR UPDATE
  )
  SELECT count(*), COALESCE(sum(duration), 0), min(start_time), max(end_time)
    INTO v_locked_count, v_total_minutes, v_first_start, v_last_end
  FROM locked;

  IF v_locked_count <> v_expected_count THEN
    RAISE EXCEPTION 'This slot is no longer available. Please pick another time.'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_total_minutes <> p_duration THEN
    RAISE EXCEPTION 'The selected time does not match a % minute lesson.', p_duration
      USING ERRCODE = '22023';
  END IF;

  -- Multiple slots must form one unbroken block that starts when the lesson does.
  IF v_locked_count > 1 AND
     EXTRACT(EPOCH FROM (v_last_end - v_first_start)) / 60 <> v_total_minutes THEN
    RAISE EXCEPTION 'The selected times are not back-to-back. Please pick another time.'
      USING ERRCODE = '22023';
  END IF;

  IF v_first_start <> p_scheduled_at THEN
    RAISE EXCEPTION 'The lesson start time does not match the selected slot.'
      USING ERRCODE = '22023';
  END IF;

  -- A teacher who holds two or more hubs opens slots per hub (tagged in hub_specialty).
  -- Such a slot can only be booked for the hub it is tagged with.
  SELECT COALESCE(cardinality(assigned_hubs), 0) >= 2
    INTO v_multi_hub
  FROM public.teacher_profiles
  WHERE user_id = p_teacher_id;

  IF COALESCE(v_multi_hub, false) AND EXISTS (
    SELECT 1 FROM public.teacher_availability
    WHERE id = ANY(p_slot_ids) AND hub_specialty IS DISTINCT FROM v_hub_title
  ) THEN
    RAISE EXCEPTION 'This time is set aside for a different hub. Please pick another time.'
      USING ERRCODE = '22023';
  END IF;

  IF NOT p_is_trial THEN
    SELECT (total_credits - used_credits - expired_credits)
      INTO v_credits_available
    FROM public.student_credits
    WHERE student_id = v_student_id;

    IF COALESCE(v_credits_available, 0) < v_credits_needed THEN
      RAISE EXCEPTION 'You need % credit(s) to book this lesson. Please purchase a package to book.', v_credits_needed
        USING ERRCODE = 'P0003';
    END IF;
  END IF;

  INSERT INTO public.lessons (
    title, teacher_id, student_id, scheduled_at,
    duration, duration_minutes, status, cost, credits_used
  ) VALUES (
    p_lesson_title, p_teacher_id, v_student_id, p_scheduled_at,
    p_duration, p_duration, 'scheduled', 0,
    CASE WHEN p_is_trial THEN 0 ELSE v_credits_needed END
  )
  RETURNING id INTO v_lesson_id;

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

  UPDATE public.teacher_availability
  SET is_booked = true,
      student_id = v_student_id,
      lesson_id = v_lesson_id,
      lesson_title = p_lesson_title,
      updated_at = now()
  WHERE id = ANY(p_slot_ids);

  INSERT INTO public.appointments (
    student_id, teacher_id, availability_id, status,
    hub_type, scheduled_at, duration, meeting_link, lesson_id
  ) VALUES (
    v_student_id, p_teacher_id, p_slot_ids[1], 'confirmed',
    v_hub_title, p_scheduled_at, p_duration,
    v_meeting_link, v_lesson_id::text
  );

  IF NOT p_is_trial THEN
    SELECT public.consume_credits(v_student_id, v_credits_needed) INTO v_consumed;
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
    'lesson_id', v_lesson_id,
    'credits_used', CASE WHEN p_is_trial THEN 0 ELSE v_credits_needed END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_class_slot(uuid[], uuid, timestamptz, integer, text, text, boolean) TO authenticated;
