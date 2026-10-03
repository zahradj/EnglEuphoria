-- Cancelling a lesson that a teacher created with "Invite a Student" from the
-- schedule used to free the calendar slot but leave the booking itself active:
-- it stayed in "Upcoming", on the "Next lesson" card, and the student's join
-- link kept working. (Invited bookings have no `lessons` row, and
-- teacher_cancel_slot only cancelled a booking when the slot pointed at one.)
--
-- 1. teacher_cancel_slot now finds the invited booking behind a booked slot,
--    cancels it, revokes the student's link, clears the booking's calendar rows
--    and tells the student.
-- 2. One-off clean-up: invited bookings that were already cancelled this way
--    (no calendar slot left, link still live) are cancelled properly.

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
  v_inv RECORD;
  v_refunded BOOLEAN := FALSE;
  v_hours_until NUMERIC;
  v_penalized BOOLEAN := FALSE;
  v_penalty_amount NUMERIC := 0;
  v_teacher_name TEXT;
BEGIN
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT id, teacher_id, lesson_id, start_time, student_id, is_booked
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

  ELSIF v_slot.is_booked AND v_slot.student_id IS NOT NULL THEN
    -- A slot made by "Invite a Student": no lessons row, no credit. The booking
    -- is the class_bookings row whose time covers this slot.
    SELECT cb.id, cb.student_id, cb.scheduled_at, cb.duration
      INTO v_inv
    FROM public.class_bookings cb
    WHERE cb.teacher_id = v_teacher_id
      AND cb.student_id = v_slot.student_id
      AND cb.lesson_id IS NULL
      AND cb.status NOT IN ('cancelled', 'completed')
      AND cb.scheduled_at <= v_slot.start_time
      AND v_slot.start_time < cb.scheduled_at + (cb.duration || ' minutes')::interval
    ORDER BY cb.scheduled_at DESC
    LIMIT 1
    FOR UPDATE;

    IF v_inv.id IS NOT NULL THEN
      UPDATE public.class_bookings
      SET status = 'cancelled',
          cancelled_at = now(),
          cancelled_by = 'teacher',
          cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
      WHERE id = v_inv.id;

      -- The student's join link stops working.
      UPDATE public.class_booking_invites
      SET revoked_at = now()
      WHERE booking_id = v_inv.id AND revoked_at IS NULL;

      -- Every calendar row of this booking (both halves of a one-hour lesson).
      -- Rows made by the invite are removed, not re-opened: the teacher never
      -- published those times for booking.
      DELETE FROM public.teacher_availability
      WHERE teacher_id = v_teacher_id
        AND student_id = v_inv.student_id
        AND lesson_id IS NULL
        AND lesson_type = 'direct_booking'
        AND start_time >= v_inv.scheduled_at
        AND start_time < v_inv.scheduled_at + (v_inv.duration || ' minutes')::interval;

      SELECT COALESCE(full_name, 'Your teacher') INTO v_teacher_name FROM public.users WHERE id = v_teacher_id;

      INSERT INTO public.notifications (user_id, title, content, type, action_url)
      VALUES (
        v_inv.student_id,
        'Lesson cancelled by your teacher',
        v_teacher_name || ' cancelled your lesson scheduled for ' ||
          to_char(v_inv.scheduled_at, 'FMDay, FMMonth FMDD at HH12:MI AM') || ' (UTC).' ||
          CASE WHEN p_reason IS NOT NULL AND p_reason <> '' THEN ' Reason: ' || p_reason ELSE '' END,
        'lesson_cancelled',
        '/dashboard'
      );
    END IF;
  END IF;

  -- Whatever is left of this slot goes back to being open (a no-op if it was deleted above).
  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, lesson_id = NULL, student_id = NULL, lesson_title = NULL
  WHERE id = p_slot_id OR (v_slot.lesson_id IS NOT NULL AND lesson_id = v_slot.lesson_id);

  RETURN jsonb_build_object('refunded', v_refunded, 'penalized', v_penalized, 'penalty_amount', v_penalty_amount);
END;
$function$;

-- One-off clean-up: invited lessons that were cancelled from the schedule before
-- this fix — the booking is still 'scheduled' with a live link, but no calendar
-- slot is booked for it any more.
WITH stuck AS (
  SELECT cb.id
  FROM public.class_bookings cb
  WHERE cb.lesson_id IS NULL
    AND cb.status IN ('scheduled', 'confirmed')
    AND cb.scheduled_at > now() - interval '30 minutes'
    AND EXISTS (SELECT 1 FROM public.class_booking_invites i WHERE i.booking_id = cb.id AND i.revoked_at IS NULL)
    AND NOT EXISTS (
      SELECT 1 FROM public.teacher_availability ta
      WHERE ta.teacher_id = cb.teacher_id
        AND ta.student_id = cb.student_id
        AND ta.is_booked
        AND ta.start_time >= cb.scheduled_at
        AND ta.start_time < cb.scheduled_at + (cb.duration || ' minutes')::interval
    )
), cancelled AS (
  UPDATE public.class_bookings cb
  SET status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = 'teacher',
      cancellation_reason = 'Cancelled from the schedule'
  FROM stuck
  WHERE cb.id = stuck.id
  RETURNING cb.id
)
UPDATE public.class_booking_invites
SET revoked_at = now()
WHERE booking_id IN (SELECT id FROM cancelled) AND revoked_at IS NULL;
