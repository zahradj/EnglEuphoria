-- Playground one-hour lessons = two adjacent 30-minute slots, two credits.
--
-- 1. lessons.credits_used records how many credits a booking really consumed.
--    Until now the cancel/refund logic inferred "paid vs free" from
--    lessons.lesson_price, which book_class_slot never sets (defaults to 0), so
--    EVERY booked lesson looked like a free trial: students could cancel at any
--    time and nobody was ever refunded. credits_used is the real source of truth.
-- 2. book_class_slot accepts two adjacent 30-minute slots for a 60-minute
--    Playground lesson (2 credits, atomic: both slots or nothing).
-- 3. Cancel (student / teacher) and reschedule release/claim BOTH slots and
--    refund/charge the right number of credits.

-- 1 --------------------------------------------------------------------------
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS credits_used integer NOT NULL DEFAULT 0;

-- Every existing non-trial booking consumed exactly one credit in book_class_slot.
UPDATE public.lessons l
SET credits_used = 1
FROM public.class_bookings cb
WHERE cb.lesson_id = l.id
  AND cb.booking_type = 'standard'
  AND l.credits_used = 0;

CREATE OR REPLACE FUNCTION public.consume_credits(p_student_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  available INTEGER;
BEGIN
  IF p_amount IS NULL OR p_amount < 1 THEN
    RETURN FALSE;
  END IF;

  SELECT (total_credits - used_credits - expired_credits)
    INTO available
  FROM public.student_credits
  WHERE student_id = p_student_id
  FOR UPDATE;

  IF available IS NULL OR available < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.student_credits
  SET used_credits = used_credits + p_amount, updated_at = now()
  WHERE student_id = p_student_id;

  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refund_credits(p_student_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_amount IS NULL OR p_amount < 1 THEN
    RETURN;
  END IF;
  UPDATE public.student_credits
  SET used_credits = GREATEST(used_credits - p_amount, 0), updated_at = now()
  WHERE student_id = p_student_id;
END;
$function$;

-- Like consume_credit/refund_credit: only callable from other SECURITY DEFINER
-- functions, never directly by a client (otherwise anyone could mint credits).
REVOKE EXECUTE ON FUNCTION public.consume_credits(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refund_credits(uuid, integer) FROM PUBLIC;

-- Refund whatever credits this lesson actually consumed (teacher / series path).
CREATE OR REPLACE FUNCTION public.refund_lesson_credit(p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson RECORD;
BEGIN
  SELECT student_id, teacher_id, credits_used
    INTO v_lesson
  FROM public.lessons
  WHERE id = p_lesson_id;

  IF v_lesson IS NULL THEN
    RETURN FALSE;
  END IF;

  IF auth.uid() <> v_lesson.teacher_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to refund this lesson' USING ERRCODE = '42501';
  END IF;

  IF COALESCE(v_lesson.credits_used, 0) = 0 THEN
    RETURN FALSE;
  END IF;

  PERFORM public.refund_credits(v_lesson.student_id, v_lesson.credits_used);
  RETURN TRUE;
END;
$$;

-- 2 --------------------------------------------------------------------------
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

  -- A Playground hour is two 30-minute slots and costs two credits. Every
  -- other lesson costs one.
  IF v_hub_slug = 'playground' AND p_duration = 60 THEN
    IF p_is_trial THEN
      RAISE EXCEPTION 'The free trial lesson is 30 minutes.' USING ERRCODE = '22023';
    END IF;
    v_credits_needed := 2;
  END IF;

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

-- 3a: student cancel --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_cancel_lesson(p_lesson_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_student_id UUID := auth.uid();
  v_lesson RECORD;
  v_hours_until NUMERIC;
  v_is_trial BOOLEAN;
  v_refunded BOOLEAN := FALSE;
  v_student_name TEXT;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT id, student_id, teacher_id, scheduled_at, credits_used, status
    INTO v_lesson
  FROM public.lessons
  WHERE id = p_lesson_id
  FOR UPDATE;

  IF v_lesson IS NULL THEN
    RAISE EXCEPTION 'Lesson not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_lesson.student_id <> v_student_id THEN
    RAISE EXCEPTION 'Not authorized to cancel this lesson' USING ERRCODE = '42501';
  END IF;

  IF v_lesson.status IN ('cancelled', 'completed') THEN
    RAISE EXCEPTION 'This lesson is already %', v_lesson.status USING ERRCODE = 'P0001';
  END IF;

  v_is_trial := (COALESCE(v_lesson.credits_used, 0) = 0);
  v_hours_until := EXTRACT(EPOCH FROM (v_lesson.scheduled_at - now())) / 3600;

  IF NOT v_is_trial AND v_hours_until < 120 THEN
    RAISE EXCEPTION 'Lessons must be cancelled at least 5 days in advance.' USING ERRCODE = 'P0003';
  END IF;

  IF NOT v_is_trial THEN
    PERFORM public.refund_credits(v_student_id, v_lesson.credits_used);
    v_refunded := TRUE;
  END IF;

  UPDATE public.lessons
  SET status = 'cancelled', cancellation_reason = p_reason
  WHERE id = p_lesson_id;

  UPDATE public.class_bookings
  SET status = 'cancelled', cancellation_reason = p_reason, cancelled_at = now(), cancelled_by = 'student'
  WHERE lesson_id = p_lesson_id;

  -- Releases BOTH slots of a one-hour Playground lesson.
  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, student_id = NULL, lesson_id = NULL, lesson_title = NULL
  WHERE lesson_id = p_lesson_id;

  SELECT COALESCE(full_name, 'A student') INTO v_student_name FROM public.users WHERE id = v_student_id;

  INSERT INTO public.notifications (user_id, title, content, type, action_url)
  VALUES (
    v_lesson.teacher_id,
    'Lesson cancelled',
    v_student_name || ' cancelled their lesson scheduled for ' ||
      to_char(v_lesson.scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') || ' (UTC).' ||
      CASE WHEN p_reason IS NOT NULL AND p_reason <> '' THEN ' Reason: ' || p_reason ELSE '' END,
    'lesson_cancelled',
    '/teacher/schedule'
  );

  RETURN jsonb_build_object('refunded', v_refunded, 'hours_until', v_hours_until, 'is_trial', v_is_trial);
END;
$function$;

-- 3b: teacher cancel --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.teacher_cancel_slot(p_slot_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_teacher_id UUID := auth.uid();
  v_slot RECORD;
  v_lesson RECORD;
  v_refunded BOOLEAN := FALSE;
  v_hours_until NUMERIC;
  v_penalized BOOLEAN := FALSE;
  v_penalty_amount NUMERIC := 0;
  v_teacher_name TEXT;
BEGIN
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT id, teacher_id, lesson_id, start_time
    INTO v_slot
  FROM public.teacher_availability
  WHERE id = p_slot_id
  FOR UPDATE;

  IF v_slot IS NULL THEN
    RAISE EXCEPTION 'Slot not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_slot.teacher_id <> v_teacher_id THEN
    RAISE EXCEPTION 'Not authorized to cancel this slot' USING ERRCODE = '42501';
  END IF;

  IF v_slot.lesson_id IS NOT NULL THEN
    SELECT id, student_id, scheduled_at, lesson_price, status
      INTO v_lesson
    FROM public.lessons
    WHERE id = v_slot.lesson_id;

    IF v_lesson.status IN ('cancelled', 'completed') THEN
      UPDATE public.teacher_availability
      SET is_booked = false, is_available = true, lesson_id = NULL, student_id = NULL, lesson_title = NULL
      WHERE id = p_slot_id OR lesson_id = v_slot.lesson_id;
      RETURN jsonb_build_object('refunded', false, 'penalized', false, 'penalty_amount', 0);
    END IF;

    -- Hours until the LESSON starts (not this slot — a one-hour lesson has two).
    v_hours_until := EXTRACT(EPOCH FROM (v_lesson.scheduled_at - now())) / 3600;

    v_refunded := public.refund_lesson_credit(v_slot.lesson_id);

    UPDATE public.class_bookings
    SET status = 'cancelled',
        cancelled_at = now(),
        cancelled_by = 'teacher',
        cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE lesson_id = v_slot.lesson_id;

    UPDATE public.lessons
    SET status = 'cancelled', cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE id = v_slot.lesson_id;

    IF v_lesson.student_id IS NOT NULL THEN
      SELECT COALESCE(full_name, 'Your teacher') INTO v_teacher_name FROM public.users WHERE id = v_teacher_id;

      INSERT INTO public.notifications (user_id, title, content, type, action_url)
      VALUES (
        v_lesson.student_id,
        'Lesson cancelled by your teacher',
        v_teacher_name || ' cancelled your lesson scheduled for ' ||
          to_char(v_lesson.scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') || ' (UTC).' ||
          CASE WHEN p_reason IS NOT NULL AND p_reason <> '' THEN ' Reason: ' || p_reason ELSE '' END ||
          CASE WHEN v_refunded THEN ' Your lesson credit has been returned.' ELSE '' END ||
          ' You can book a new time anytime.',
        'lesson_cancelled',
        '/dashboard'
      );
    END IF;

    -- Penalty is money-based, so it only applies when the lesson has a price.
    IF COALESCE(v_lesson.lesson_price, 0) > 0 AND v_hours_until < 48 THEN
      v_penalized := TRUE;
      v_penalty_amount := round(v_lesson.lesson_price * 0.5, 2);

      INSERT INTO public.teacher_earnings (
        teacher_id, lesson_id, gross_amount, teacher_amount, platform_amount,
        amount, split_percentage, status, earned_at
      )
      VALUES (
        v_teacher_id, v_slot.lesson_id, -v_penalty_amount, -v_penalty_amount, 0,
        -v_penalty_amount, 0, 'payable', now()
      );

      INSERT INTO public.teacher_performance_metrics (teacher_id, late_cancellations_count)
      VALUES (v_teacher_id, 1)
      ON CONFLICT (teacher_id) DO UPDATE
        SET late_cancellations_count = public.teacher_performance_metrics.late_cancellations_count + 1,
            updated_at = now();

      INSERT INTO public.notifications (user_id, title, content, type, action_url)
      VALUES (
        v_teacher_id,
        'Late cancellation penalty applied',
        'You cancelled a lesson ' || round(v_hours_until) || ' hour(s) before it started — inside the 48-hour window. A ' ||
          v_penalty_amount || ' cancellation fee has been deducted from your balance. The student was refunded in full.',
        'lesson_cancelled',
        '/teacher/withdrawals'
      );
    END IF;
  END IF;

  -- Frees every slot the lesson held (both halves of a one-hour lesson).
  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, lesson_id = NULL, student_id = NULL, lesson_title = NULL
  WHERE id = p_slot_id OR (v_slot.lesson_id IS NOT NULL AND lesson_id = v_slot.lesson_id);

  RETURN jsonb_build_object('refunded', v_refunded, 'penalized', v_penalized, 'penalty_amount', v_penalty_amount);
END;
$function$;

-- 3c: student reschedule ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_reschedule_lesson(
  p_lesson_id uuid,
  p_new_scheduled_at timestamptz,
  p_reason text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_student_id UUID := auth.uid();
  v_lesson RECORD;
  v_hours_until NUMERIC;
  v_is_trial BOOLEAN;
  v_duration_minutes INTEGER;
  v_conflict_count INTEGER;
  v_old_slot_count INTEGER;
  v_new_slot_ids uuid[];
  v_student_name TEXT;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_new_scheduled_at <= now() THEN
    RAISE EXCEPTION 'The new lesson time must be in the future.' USING ERRCODE = 'P0004';
  END IF;

  SELECT l.id, l.student_id, l.teacher_id, l.scheduled_at, l.credits_used, l.status,
         COALESCE(cb.duration, 30) AS duration
    INTO v_lesson
  FROM public.lessons l
  LEFT JOIN public.class_bookings cb ON cb.lesson_id = l.id
  WHERE l.id = p_lesson_id
  FOR UPDATE OF l;

  IF v_lesson IS NULL THEN
    RAISE EXCEPTION 'Lesson not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_lesson.student_id <> v_student_id THEN
    RAISE EXCEPTION 'Not authorized to reschedule this lesson' USING ERRCODE = '42501';
  END IF;

  IF v_lesson.status IN ('cancelled', 'completed') THEN
    RAISE EXCEPTION 'This lesson is already %', v_lesson.status USING ERRCODE = 'P0001';
  END IF;

  v_is_trial := (COALESCE(v_lesson.credits_used, 0) = 0);
  v_hours_until := EXTRACT(EPOCH FROM (v_lesson.scheduled_at - now())) / 3600;
  v_duration_minutes := COALESCE(v_lesson.duration, 30);

  IF NOT v_is_trial AND v_hours_until < 120 THEN
    RAISE EXCEPTION 'Rescheduling is only available 5+ days in advance.' USING ERRCODE = 'P0003';
  END IF;

  IF p_new_scheduled_at = v_lesson.scheduled_at THEN
    RAISE EXCEPTION 'The new time is the same as the current time.' USING ERRCODE = 'P0004';
  END IF;

  SELECT count(*) INTO v_conflict_count
  FROM public.class_bookings cb2
  WHERE cb2.teacher_id = v_lesson.teacher_id
    AND cb2.lesson_id <> p_lesson_id
    AND cb2.status NOT IN ('cancelled', 'completed')
    AND cb2.scheduled_at < p_new_scheduled_at + (v_duration_minutes || ' minutes')::interval
    AND cb2.scheduled_at + (COALESCE(cb2.duration, 30) || ' minutes')::interval > p_new_scheduled_at;

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'This teacher already has a lesson booked at that time. Please choose another slot.' USING ERRCODE = 'P0005';
  END IF;

  -- Free the old slot(s) FIRST, so moving a lesson by 30 minutes can reuse its
  -- own half. Any failure below raises, which rolls this back.
  SELECT count(*) INTO v_old_slot_count FROM public.teacher_availability WHERE lesson_id = p_lesson_id;

  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, student_id = NULL, lesson_id = NULL, lesson_title = NULL
  WHERE lesson_id = p_lesson_id;

  -- A one-hour Playground lesson holds two 30-minute slots; claim two back-to-back
  -- open ones. Everything else claims a single slot of the lesson's length.
  IF v_old_slot_count >= 2 AND v_duration_minutes = 60 THEN
    SELECT array_agg(id ORDER BY start_time) INTO v_new_slot_ids FROM (
      SELECT id, start_time
      FROM public.teacher_availability
      WHERE teacher_id = v_lesson.teacher_id
        AND duration = 30
        AND is_available = true
        AND is_booked = false
        AND start_time IN (p_new_scheduled_at, p_new_scheduled_at + interval '30 minutes')
      FOR UPDATE
    ) s;
    IF COALESCE(array_length(v_new_slot_ids, 1), 0) <> 2 THEN
      RAISE EXCEPTION 'That time is not available with this teacher. Please choose one of the open times.' USING ERRCODE = 'P0005';
    END IF;
  ELSE
    SELECT array_agg(id) INTO v_new_slot_ids FROM (
      SELECT id
      FROM public.teacher_availability
      WHERE teacher_id = v_lesson.teacher_id
        AND start_time = p_new_scheduled_at
        AND duration = v_duration_minutes
        AND is_available = true
        AND is_booked = false
      LIMIT 1
      FOR UPDATE
    ) s;
    IF COALESCE(array_length(v_new_slot_ids, 1), 0) <> 1 THEN
      RAISE EXCEPTION 'That time is not available with this teacher. Please choose one of the open times.' USING ERRCODE = 'P0005';
    END IF;
  END IF;

  UPDATE public.teacher_availability
  SET is_booked = true, is_available = false, student_id = v_student_id, lesson_id = p_lesson_id
  WHERE id = ANY(v_new_slot_ids);

  UPDATE public.lessons
  SET scheduled_at = p_new_scheduled_at,
      reschedule_count = COALESCE(reschedule_count, 0) + 1
  WHERE id = p_lesson_id;

  UPDATE public.class_bookings
  SET scheduled_at = p_new_scheduled_at
  WHERE lesson_id = p_lesson_id;

  SELECT COALESCE(full_name, 'A student') INTO v_student_name FROM public.users WHERE id = v_student_id;

  INSERT INTO public.notifications (user_id, title, content, type, action_url)
  VALUES (
    v_lesson.teacher_id,
    'Lesson rescheduled',
    v_student_name || ' moved their lesson from ' || to_char(v_lesson.scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') ||
      ' to ' || to_char(p_new_scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') || ' (UTC).' ||
      CASE WHEN p_reason IS NOT NULL AND p_reason <> '' THEN ' Reason: ' || p_reason ELSE '' END,
    'lesson_rescheduled',
    '/teacher/schedule'
  );

  RETURN jsonb_build_object('old_scheduled_at', v_lesson.scheduled_at, 'new_scheduled_at', p_new_scheduled_at, 'is_trial', v_is_trial);
END;
$function$;

REVOKE ALL ON FUNCTION public.student_reschedule_lesson(uuid, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_reschedule_lesson(uuid, timestamptz, text) TO authenticated;
