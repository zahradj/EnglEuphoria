-- Two-way cancel / reschedule: every cancellation or move is now mirrored to
-- BOTH sides, atomically, inside the RPC (SECURITY DEFINER, so the notification
-- insert never depends on client RLS).
--
-- Bugs fixed:
--  1. student_cancel_lesson lost its teacher notification when
--     20260918143150_add_cancelled_by_tracking.sql re-created the function from
--     an older body -> the teacher was never told a student cancelled.
--  2. teacher_cancel_slot never notified the student at all.
--  3. student_reschedule_lesson accepted ANY future time (it only checked for
--     collisions), so a student could move a lesson onto a time the teacher never
--     opened. It now requires one of the teacher's open slots and claims it.

-- 1 + 2 ----------------------------------------------------------------------
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
  v_lesson_price NUMERIC;
  v_is_trial BOOLEAN;
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

  v_hours_until := EXTRACT(EPOCH FROM (v_slot.start_time - now())) / 3600;

  IF v_slot.lesson_id IS NOT NULL THEN
    SELECT id, student_id, scheduled_at, lesson_price, status
      INTO v_lesson
    FROM public.lessons
    WHERE id = v_slot.lesson_id;

    -- Already cancelled/completed: just free the slot, never refund or notify twice.
    IF v_lesson.status IN ('cancelled', 'completed') THEN
      UPDATE public.teacher_availability
      SET is_booked = false, is_available = true, lesson_id = NULL, student_id = NULL, lesson_title = NULL
      WHERE id = p_slot_id;
      RETURN jsonb_build_object('refunded', false, 'penalized', false, 'penalty_amount', 0);
    END IF;

    v_refunded := public.refund_lesson_credit(v_slot.lesson_id);

    v_lesson_price := v_lesson.lesson_price;
    v_is_trial := (v_lesson_price IS NULL OR v_lesson_price = 0);

    UPDATE public.class_bookings
    SET status = 'cancelled',
        cancelled_at = now(),
        cancelled_by = 'teacher',
        cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE lesson_id = v_slot.lesson_id;

    UPDATE public.lessons
    SET status = 'cancelled', cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE id = v_slot.lesson_id;

    -- Tell the student (their lesson list also refreshes live off the lessons row).
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

    IF NOT v_is_trial AND v_hours_until < 48 THEN
      v_penalized := TRUE;
      v_penalty_amount := round(v_lesson_price * 0.5, 2);

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

  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, lesson_id = NULL, student_id = NULL, lesson_title = NULL
  WHERE id = p_slot_id;

  RETURN jsonb_build_object('refunded', v_refunded, 'penalized', v_penalized, 'penalty_amount', v_penalty_amount);
END;
$function$;

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

  SELECT id, student_id, teacher_id, scheduled_at, lesson_price, status
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

  v_is_trial := (v_lesson.lesson_price IS NULL OR v_lesson.lesson_price = 0);
  v_hours_until := EXTRACT(EPOCH FROM (v_lesson.scheduled_at - now())) / 3600;

  IF NOT v_is_trial AND v_hours_until < 120 THEN
    RAISE EXCEPTION 'Lessons must be cancelled at least 5 days in advance.' USING ERRCODE = 'P0003';
  END IF;

  IF NOT v_is_trial THEN
    PERFORM public.refund_credit(v_student_id);
    v_refunded := TRUE;
  END IF;

  UPDATE public.lessons
  SET status = 'cancelled', cancellation_reason = p_reason
  WHERE id = p_lesson_id;

  UPDATE public.class_bookings
  SET status = 'cancelled', cancellation_reason = p_reason, cancelled_at = now(), cancelled_by = 'student'
  WHERE lesson_id = p_lesson_id;

  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, student_id = NULL, lesson_id = NULL, lesson_title = NULL
  WHERE lesson_id = p_lesson_id;

  -- Tell the teacher (restored: the 20260918 rewrite had silently dropped this).
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

-- 3 --------------------------------------------------------------------------
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
  v_new_slot_id UUID;
  v_student_name TEXT;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_new_scheduled_at <= now() THEN
    RAISE EXCEPTION 'The new lesson time must be in the future.' USING ERRCODE = 'P0004';
  END IF;

  SELECT l.id, l.student_id, l.teacher_id, l.scheduled_at, l.lesson_price, l.status,
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

  v_is_trial := (v_lesson.lesson_price IS NULL OR v_lesson.lesson_price = 0);
  v_hours_until := EXTRACT(EPOCH FROM (v_lesson.scheduled_at - now())) / 3600;
  v_duration_minutes := COALESCE(v_lesson.duration, 30);

  IF NOT v_is_trial AND v_hours_until < 120 THEN
    RAISE EXCEPTION 'Rescheduling is only available 5+ days in advance.' USING ERRCODE = 'P0003';
  END IF;

  IF p_new_scheduled_at = v_lesson.scheduled_at THEN
    RAISE EXCEPTION 'The new time is the same as the current time.' USING ERRCODE = 'P0004';
  END IF;

  -- The new time must be a slot this teacher actually opened and nobody has taken.
  SELECT id INTO v_new_slot_id
  FROM public.teacher_availability
  WHERE teacher_id = v_lesson.teacher_id
    AND start_time = p_new_scheduled_at
    AND duration = v_duration_minutes
    AND is_available = true
    AND is_booked = false
  LIMIT 1
  FOR UPDATE;

  IF v_new_slot_id IS NULL THEN
    RAISE EXCEPTION 'That time is not available with this teacher. Please choose one of the open slots.' USING ERRCODE = 'P0005';
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

  -- Free the old slot, claim the new one.
  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, student_id = NULL, lesson_id = NULL, lesson_title = NULL
  WHERE lesson_id = p_lesson_id;

  UPDATE public.teacher_availability
  SET is_booked = true, is_available = false, student_id = v_student_id, lesson_id = p_lesson_id
  WHERE id = v_new_slot_id;

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
