-- Cancellation policy (owner, 2026-10-13): a student can cancel a paid lesson up to 8 hours before it starts and the
-- credit is returned; inside 8 hours the lesson is final. Teachers' rule is 48 hours (app-side). Rescheduling by a
-- student is unchanged (student_reschedule_lesson still needs 120 hours' notice).
--
-- Same function as in 20261002150000_playground_hour_lessons_two_credits.sql, with the window changed from 120 to 8 hours.

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

  IF NOT v_is_trial AND v_hours_until < 8 THEN
    RAISE EXCEPTION 'Lessons must be cancelled at least 8 hours in advance.' USING ERRCODE = 'P0003';
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
