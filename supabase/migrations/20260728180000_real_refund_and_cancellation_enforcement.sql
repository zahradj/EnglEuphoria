-- ============================================================
-- Real refund/credit-restoration on cancellation, enforced server-side.
--
-- Two problems fixed here:
--
-- 1. consume_credit()/refund_credit() (added in
--    20260221000946_bc35c6d2-...) were created with no explicit GRANT,
--    which means Postgres's default behavior applies: EXECUTE is granted
--    to PUBLIC automatically. Any authenticated (or anonymous) client could
--    call `supabase.rpc('refund_credit', { p_student_id: <anyone> })`
--    directly and repeatedly to manufacture free credits for themselves,
--    or call `consume_credit` against another student's id to drain their
--    balance. Locking these down to be callable only from within other
--    SECURITY DEFINER functions (never directly from a client).
--
-- 2. The cancellation flows (src/hooks/useCancelReschedule.ts,
--    src/services/cancelSlotService.ts) computed the 120-hour refund
--    window and the "should this refund" decision entirely in client JS,
--    then wrote directly to lessons/class_bookings/teacher_availability —
--    nothing server-side ever actually called refund_credit(), so
--    cancellations showed a "Refund: €X" toast that never restored
--    anything, contradicting the Refund Policy. These two new RPCs make
--    the window check and the refund decision authoritative, and are the
--    only supported way to cancel going forward.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.consume_credit(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refund_credit(uuid) FROM PUBLIC;

-- Shared helper: refund the credit tied to one lesson, if it's not a
-- trial/free lesson. Only the lesson's own teacher (or an admin) may
-- trigger it — used internally by teacher_cancel_slot() below, and also
-- exposed directly for the weekly-series cancellation path, which cancels
-- many lessons belonging to the same teacher in a client-side loop.
CREATE OR REPLACE FUNCTION public.refund_lesson_credit(p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson RECORD;
  v_is_trial BOOLEAN;
BEGIN
  SELECT student_id, teacher_id, lesson_price
    INTO v_lesson
  FROM public.lessons
  WHERE id = p_lesson_id;

  IF v_lesson IS NULL THEN
    RETURN FALSE;
  END IF;

  IF auth.uid() <> v_lesson.teacher_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to refund this lesson' USING ERRCODE = '42501';
  END IF;

  v_is_trial := (v_lesson.lesson_price IS NULL OR v_lesson.lesson_price = 0);
  IF v_is_trial THEN
    RETURN FALSE;
  END IF;

  PERFORM public.refund_credit(v_lesson.student_id);
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refund_lesson_credit(uuid) TO authenticated;

-- Student-initiated cancellation. Replaces the client-side canCancel()/
-- getRefundInfo() logic in useCancelReschedule.ts — the 120-hour window is
-- computed here from the DB's own clock, and the credit is only ever
-- actually restored through this function.
CREATE OR REPLACE FUNCTION public.student_cancel_lesson(p_lesson_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_lesson RECORD;
  v_hours_until NUMERIC;
  v_is_trial BOOLEAN;
  v_refunded BOOLEAN := FALSE;
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

  -- Matches the product's existing 5-day-rule UX: within the window, the
  -- booking stands (teacher already reserved the time) — trial lessons are
  -- always exempt.
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

  RETURN jsonb_build_object('refunded', v_refunded, 'hours_until', v_hours_until, 'is_trial', v_is_trial);
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_cancel_lesson(uuid, text) TO authenticated;

-- Teacher-initiated single-occurrence cancellation. Per the Refund Policy,
-- teacher cancellations ALWAYS refund the credit regardless of timing.
CREATE OR REPLACE FUNCTION public.teacher_cancel_slot(p_slot_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teacher_id UUID := auth.uid();
  v_slot RECORD;
  v_refunded BOOLEAN := FALSE;
BEGIN
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT id, teacher_id, lesson_id
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
    v_refunded := public.refund_lesson_credit(v_slot.lesson_id);

    UPDATE public.class_bookings
    SET status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE lesson_id = v_slot.lesson_id;

    UPDATE public.lessons
    SET status = 'cancelled', cancellation_reason = COALESCE(p_reason, 'Cancelled by teacher')
    WHERE id = v_slot.lesson_id;
  END IF;

  UPDATE public.teacher_availability
  SET is_booked = false, is_available = true, lesson_id = NULL, student_id = NULL, lesson_title = NULL
  WHERE id = p_slot_id;

  RETURN jsonb_build_object('refunded', v_refunded);
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_cancel_slot(uuid, text) TO authenticated;
