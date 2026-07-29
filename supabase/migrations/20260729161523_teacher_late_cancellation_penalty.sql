ALTER TABLE public.teacher_performance_metrics
  ADD COLUMN IF NOT EXISTS late_cancellations_count integer NOT NULL DEFAULT 0;

-- teacher_cancel_slot previously always refunded the student in full and
-- freed the slot with zero consequence for the teacher, regardless of how
-- close to the lesson they cancelled. This adds a real penalty for
-- cancelling inside 48 hours of the lesson start: a 50% fee charged against
-- the teacher's balance (a negative teacher_earnings row, same table/columns
-- get_teacher_available_balance already sums), a running strike count on
-- teacher_performance_metrics, and a notification explaining why. The
-- student is still always refunded in full — this is purely a teacher-side
-- consequence, not a change to the student's refund policy.
CREATE OR REPLACE FUNCTION public.teacher_cancel_slot(p_slot_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_teacher_id UUID := auth.uid();
  v_slot RECORD;
  v_refunded BOOLEAN := FALSE;
  v_lesson_price NUMERIC;
  v_is_trial BOOLEAN;
  v_hours_until NUMERIC;
  v_penalized BOOLEAN := FALSE;
  v_penalty_amount NUMERIC := 0;
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
    v_refunded := public.refund_lesson_credit(v_slot.lesson_id);

    SELECT lesson_price INTO v_lesson_price FROM public.lessons WHERE id = v_slot.lesson_id;
    v_is_trial := (v_lesson_price IS NULL OR v_lesson_price = 0);

    UPDATE public.class_bookings
    SET status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE lesson_id = v_slot.lesson_id;

    UPDATE public.lessons
    SET status = 'cancelled', cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE id = v_slot.lesson_id;

    -- 48-hour penalty window: only for real (non-trial) lessons the teacher
    -- is cancelling with less than 2 days' notice.
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

  RETURN jsonb_build_object(
    'refunded', v_refunded,
    'penalized', v_penalized,
    'penalty_amount', v_penalty_amount,
    'hours_until', v_hours_until
  );
END;
$function$;
