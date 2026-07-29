-- 1. student_cancel_lesson: notify the teacher when a student cancels.
--    Runs SECURITY DEFINER already, so this insert bypasses RLS cleanly —
--    no client-side permission dependency, fires atomically with the cancel.
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
  SET status = 'cancelled', cancellation_reason = p_reason, cancelled_at = now()
  WHERE lesson_id = p_lesson_id;

  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, student_id = NULL, lesson_id = NULL, lesson_title = NULL
  WHERE lesson_id = p_lesson_id;

  SELECT COALESCE(full_name, 'A student') INTO v_student_name FROM public.users WHERE id = v_student_id;

  INSERT INTO public.notifications (user_id, title, content, type, action_url)
  VALUES (
    v_lesson.teacher_id,
    'Lesson cancelled',
    v_student_name || ' cancelled their lesson scheduled for ' || to_char(v_lesson.scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') || '.' ||
      CASE WHEN p_reason IS NOT NULL AND p_reason <> '' THEN ' Reason: ' || p_reason ELSE '' END,
    'lesson_cancelled',
    '/teacher/schedule'
  );

  RETURN jsonb_build_object('refunded', v_refunded, 'hours_until', v_hours_until, 'is_trial', v_is_trial);
END;
$function$;

-- 2. student_reschedule_lesson: the reschedule path previously had NO server-side
--    enforcement at all (the 120h policy was only checked client-side and easily
--    bypassed), did two separate non-atomic table writes that could drift on
--    partial failure, never validated the new time against the teacher's actual
--    availability/other bookings (so a student could "reschedule" onto a time
--    slot the teacher never opened, or one already booked by someone else), and
--    never freed/rebooked the teacher_availability rows for the old/new slot.
--    Uses public.users (not public.profiles, which doesn't exist in this
--    database — verified via pg_class across all schemas) for the student's
--    display name in the teacher notification.
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

  -- Don't let the new time collide with another active booking this teacher
  -- already has — the previous client-only implementation had no such check.
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

  -- Free whatever availability row was tied to the old slot.
  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, student_id = NULL, lesson_id = NULL, lesson_title = NULL
  WHERE lesson_id = p_lesson_id;

  UPDATE public.lessons
  SET scheduled_at = p_new_scheduled_at,
      reschedule_count = COALESCE(reschedule_count, 0) + 1
  WHERE id = p_lesson_id;

  UPDATE public.class_bookings
  SET scheduled_at = p_new_scheduled_at
  WHERE lesson_id = p_lesson_id;

  -- Best-effort: if the teacher happens to have a pre-published open slot at
  -- the exact new time, claim it so their calendar reflects the booking. Not
  -- required to succeed — the conflict check above is what actually prevents
  -- double-booking regardless of whether a matching availability row exists.
  UPDATE public.teacher_availability
  SET is_booked = true, is_available = false, student_id = v_student_id, lesson_id = p_lesson_id
  WHERE teacher_id = v_lesson.teacher_id
    AND start_time = p_new_scheduled_at
    AND is_available = true
    AND is_booked = false;

  SELECT COALESCE(full_name, 'A student') INTO v_student_name FROM public.users WHERE id = v_student_id;

  INSERT INTO public.notifications (user_id, title, content, type, action_url)
  VALUES (
    v_lesson.teacher_id,
    'Lesson rescheduled',
    v_student_name || ' moved their lesson from ' || to_char(v_lesson.scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') ||
      ' to ' || to_char(p_new_scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') || '.' ||
      CASE WHEN p_reason IS NOT NULL AND p_reason <> '' THEN ' Reason: ' || p_reason ELSE '' END,
    'lesson_rescheduled',
    '/teacher/schedule'
  );

  RETURN jsonb_build_object('old_scheduled_at', v_lesson.scheduled_at, 'new_scheduled_at', p_new_scheduled_at, 'is_trial', v_is_trial);
END;
$function$;

REVOKE ALL ON FUNCTION public.student_reschedule_lesson(uuid, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_reschedule_lesson(uuid, timestamptz, text) TO authenticated;
