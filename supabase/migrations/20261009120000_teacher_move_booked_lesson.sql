-- Teacher edits a booked slot: move the lesson to another of their OPEN slots.
--
-- The schedule could cancel a booked lesson but not move it. This is the
-- teacher-side twin of student_reschedule_lesson: same bookkeeping (lesson,
-- booking, calendar rows, join-link window), but
--   * no "5 days ahead" rule and no credit change - the student keeps the same
--     lesson and the same credits, and is told about the new time;
--   * it works for lessons a student booked AND for lessons the teacher made
--     with "Invite a Student" (no lessons row, calendar rows the teacher never
--     published as open slots);
--   * the new time must be one of the teacher's own open slots (to move
--     somewhere else, open a slot there first), in the same hub.
--
-- One lesson = one booking. A 60-minute lesson is one 60-minute calendar row or
-- two back-to-back 30-minute rows; the move keeps whichever shape it had, and a
-- move of 30 minutes may reuse the lesson's own half.

CREATE OR REPLACE FUNCTION public.teacher_move_booked_lesson(
  p_slot_id uuid,
  p_new_start timestamptz,
  p_reason text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_teacher_id UUID := auth.uid();
  v_slot RECORD;
  v_cb RECORD;
  v_old_rows INTEGER;
  v_conflicts INTEGER;
  v_new_ids uuid[];
  v_title TEXT;
  v_hub TEXT;
  v_teacher_name TEXT;
BEGIN
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_new_start IS NULL OR p_new_start <= now() THEN
    RAISE EXCEPTION 'The new lesson time must be in the future.' USING ERRCODE = 'P0004';
  END IF;

  SELECT id, teacher_id, student_id, lesson_id, start_time, lesson_title, hub_specialty, is_booked
    INTO v_slot
  FROM public.teacher_availability
  WHERE id = p_slot_id
  FOR UPDATE;

  IF v_slot IS NULL THEN
    RAISE EXCEPTION 'Slot not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_slot.teacher_id <> v_teacher_id THEN
    RAISE EXCEPTION 'Not authorized to move this lesson' USING ERRCODE = '42501';
  END IF;
  IF NOT v_slot.is_booked OR v_slot.student_id IS NULL THEN
    RAISE EXCEPTION 'This slot has no booked lesson to move.' USING ERRCODE = 'P0001';
  END IF;

  -- The booking that covers this calendar row (works for both kinds of lesson).
  SELECT cb.id, cb.student_id, cb.lesson_id, cb.scheduled_at, COALESCE(cb.duration, 30) AS duration
    INTO v_cb
  FROM public.class_bookings cb
  WHERE cb.teacher_id = v_teacher_id
    AND cb.student_id = v_slot.student_id
    AND cb.status NOT IN ('cancelled', 'completed')
    AND cb.scheduled_at <= v_slot.start_time
    AND v_slot.start_time < cb.scheduled_at + (COALESCE(cb.duration, 30) || ' minutes')::interval
  ORDER BY cb.scheduled_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_cb.id IS NULL THEN
    RAISE EXCEPTION 'No active booking found for this slot.' USING ERRCODE = 'P0002';
  END IF;

  IF p_new_start = v_cb.scheduled_at THEN
    RAISE EXCEPTION 'The new time is the same as the current time.' USING ERRCODE = 'P0004';
  END IF;

  -- No other lesson of this teacher may overlap the new time.
  SELECT count(*) INTO v_conflicts
  FROM public.class_bookings cb2
  WHERE cb2.teacher_id = v_teacher_id
    AND cb2.id <> v_cb.id
    AND cb2.status NOT IN ('cancelled', 'completed')
    AND cb2.scheduled_at < p_new_start + (v_cb.duration || ' minutes')::interval
    AND cb2.scheduled_at + (COALESCE(cb2.duration, 30) || ' minutes')::interval > p_new_start;

  IF v_conflicts > 0 THEN
    RAISE EXCEPTION 'You already have a lesson at that time. Please choose another slot.' USING ERRCODE = 'P0005';
  END IF;

  v_title := v_slot.lesson_title;
  v_hub := v_slot.hub_specialty;

  -- Free the old calendar rows FIRST so a 30-minute move can reuse the lesson's
  -- own half. Rows made by "Invite a Student" were never open slots, so they are
  -- removed; rows of a normal booking go back to being open. Any failure below
  -- raises, which rolls all of this back.
  SELECT count(*) INTO v_old_rows
  FROM public.teacher_availability
  WHERE teacher_id = v_teacher_id
    AND is_booked
    AND student_id = v_cb.student_id
    AND start_time >= v_cb.scheduled_at
    AND start_time < v_cb.scheduled_at + (v_cb.duration || ' minutes')::interval;

  DELETE FROM public.teacher_availability
  WHERE teacher_id = v_teacher_id
    AND is_booked
    AND student_id = v_cb.student_id
    AND lesson_type = 'direct_booking'
    AND start_time >= v_cb.scheduled_at
    AND start_time < v_cb.scheduled_at + (v_cb.duration || ' minutes')::interval;

  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, student_id = NULL, lesson_id = NULL, lesson_title = NULL
  WHERE teacher_id = v_teacher_id
    AND is_booked
    AND student_id = v_cb.student_id
    AND start_time >= v_cb.scheduled_at
    AND start_time < v_cb.scheduled_at + (v_cb.duration || ' minutes')::interval;

  -- Claim the new open slot(s): two back-to-back 30s for a split one-hour lesson,
  -- otherwise one row of the lesson's own length.
  IF v_old_rows >= 2 AND v_cb.duration = 60 THEN
    SELECT array_agg(id ORDER BY start_time) INTO v_new_ids FROM (
      SELECT id, start_time
      FROM public.teacher_availability
      WHERE teacher_id = v_teacher_id
        AND duration = 30
        AND is_available = true
        AND is_booked = false
        AND start_time IN (p_new_start, p_new_start + interval '30 minutes')
        AND (v_hub IS NULL OR hub_specialty IS NULL OR hub_specialty = v_hub)
      FOR UPDATE
    ) s;
    IF COALESCE(array_length(v_new_ids, 1), 0) <> 2 THEN
      RAISE EXCEPTION 'That time is not one of your open slots. Open a slot there first, then move the lesson.' USING ERRCODE = 'P0005';
    END IF;
  ELSE
    SELECT array_agg(id) INTO v_new_ids FROM (
      SELECT id
      FROM public.teacher_availability
      WHERE teacher_id = v_teacher_id
        AND start_time = p_new_start
        AND duration = v_cb.duration
        AND is_available = true
        AND is_booked = false
        AND (v_hub IS NULL OR hub_specialty IS NULL OR hub_specialty = v_hub)
      LIMIT 1
      FOR UPDATE
    ) s;
    IF COALESCE(array_length(v_new_ids, 1), 0) <> 1 THEN
      RAISE EXCEPTION 'That time is not one of your open slots. Open a slot there first, then move the lesson.' USING ERRCODE = 'P0005';
    END IF;
  END IF;

  UPDATE public.teacher_availability
  SET is_booked = true,
      student_id = v_cb.student_id,
      lesson_id = v_cb.lesson_id,
      lesson_title = v_title,
      updated_at = now()
  WHERE id = ANY(v_new_ids);

  UPDATE public.class_bookings
  SET scheduled_at = p_new_start
  WHERE id = v_cb.id;

  IF v_cb.lesson_id IS NOT NULL THEN
    UPDATE public.lessons
    SET scheduled_at = p_new_start
    WHERE id = v_cb.lesson_id;

    UPDATE public.appointments
    SET scheduled_at = p_new_start, availability_id = v_new_ids[1]
    WHERE lesson_id = v_cb.lesson_id::text;
  END IF;

  -- The student's join link works from an hour before to an hour after the lesson.
  UPDATE public.class_booking_invites
  SET expires_at = p_new_start + ((v_cb.duration + 60) || ' minutes')::interval
  WHERE booking_id = v_cb.id AND revoked_at IS NULL;

  SELECT COALESCE(full_name, 'Your teacher') INTO v_teacher_name FROM public.users WHERE id = v_teacher_id;

  INSERT INTO public.notifications (user_id, title, content, type, action_url)
  VALUES (
    v_cb.student_id,
    'Your lesson has moved',
    v_teacher_name || ' moved your lesson from ' ||
      to_char(v_cb.scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') || ' to ' ||
      to_char(p_new_start, 'FMDay, FMMonth FMDD at HH12:MI AM') || ' (UTC).' ||
      CASE WHEN p_reason IS NOT NULL AND p_reason <> '' THEN ' Reason: ' || p_reason ELSE '' END ||
      ' Your credits are unchanged.',
    'lesson_rescheduled',
    '/dashboard'
  );

  RETURN jsonb_build_object(
    'old_scheduled_at', v_cb.scheduled_at,
    'new_scheduled_at', p_new_start,
    'duration', v_cb.duration
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.teacher_move_booked_lesson(uuid, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_move_booked_lesson(uuid, timestamptz, text) TO authenticated;
