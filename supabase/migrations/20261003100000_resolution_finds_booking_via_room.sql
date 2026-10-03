-- Follow-up to 20261002160000_credit_security_and_refund_fixes.sql.
--
-- Found afterwards on the live data: classroom_sessions.booking_id is NEVER filled in (0 of 77 rows).
-- A session is tied to its booking through room_id (text = class_bookings.id) instead. The refund fix in
-- apply_classroom_resolution looked the booking up through booking_id only, so it would have found no
-- booking and therefore refunded nothing (credit_refunded = false) for every teacher-fault resolution.
--
-- This version finds the booking via booking_id OR room_id, and falls back to the booking's student when
-- the session row has none (20 of 77 sessions have no student_id). No resolution had been recorded yet, so
-- nothing was affected; this closes the gap before the first one.

CREATE OR REPLACE FUNCTION public.apply_classroom_resolution(p_session_id uuid, p_resolution_type text, p_notes text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.classroom_sessions%ROWTYPE;
  v_booking public.class_bookings%ROWTYPE;
  v_student_id uuid;
  v_pct numeric := 0;
  v_refund boolean := false;
  v_final text;
  v_hourly numeric := 0;
  v_pay numeric := 0;
  v_duration_h numeric;
  v_res_id uuid;
  v_teacher_name text;
  v_credits integer := 0;
  v_already_refunded boolean := false;
BEGIN
  IF NOT public.has_role(v_uid, 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;

  SELECT * INTO v_session FROM public.classroom_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;

  -- The booking is linked through booking_id when set, otherwise through room_id (text of the booking id).
  SELECT * INTO v_booking
  FROM public.class_bookings
  WHERE id::text = COALESCE(v_session.booking_id::text, v_session.room_id);

  v_student_id := COALESCE(v_session.student_id, v_booking.student_id);

  CASE p_resolution_type
    WHEN 'teacher_absent'     THEN v_pct := 0;   v_refund := true;  v_final := 'teacher_no_show';
    WHEN 'student_absent'     THEN v_pct := 100; v_refund := false; v_final := 'student_no_show';
    WHEN 'teacher_tech_fault' THEN v_pct := 0;   v_refund := true;  v_final := 'redo';
    WHEN 'student_tech_fault' THEN v_pct := 50;  v_refund := false; v_final := 'incomplete';
    WHEN 'platform_fault'     THEN v_pct := 100; v_refund := true;  v_final := 'system_error_redo';
    ELSE RAISE EXCEPTION 'invalid resolution_type';
  END CASE;

  -- What did this lesson actually cost? (0 for trials / teacher-invited free lessons.)
  IF v_refund AND v_booking.lesson_id IS NOT NULL THEN
    SELECT COALESCE(credits_used, 0) INTO v_credits FROM public.lessons WHERE id = v_booking.lesson_id;
  END IF;

  -- Never refund the same booking twice (earlier resolution, left-early trigger, cancel).
  IF v_refund AND v_booking.id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.classroom_resolutions
      WHERE booking_id = v_booking.id AND credit_refunded = true
    ) OR EXISTS (
      SELECT 1 FROM public.audit_logs
      WHERE action = 'class_credit_refunded' AND resource_id = v_booking.id
    ) INTO v_already_refunded;
  END IF;

  -- Compute teacher pay
  v_duration_h := COALESCE(v_session.duration_minutes, COALESCE(v_booking.duration, 60))::numeric / 60.0;
  SELECT hourly_rate_eur, COALESCE(full_name, email)
    INTO v_hourly, v_teacher_name
    FROM public.teacher_profiles tp
    LEFT JOIN public.users u ON u.id = tp.user_id
   WHERE tp.user_id = v_session.teacher_id
   LIMIT 1;
  v_hourly := COALESCE(v_hourly, 0);
  v_pay := round(v_hourly * v_duration_h * v_pct / 100.0, 2);

  INSERT INTO public.classroom_resolutions
    (session_id, booking_id, teacher_id, student_id, resolution_type, teacher_pay_pct, teacher_pay_amount, credit_refunded, final_status, resolved_by, notes)
  VALUES
    (p_session_id, v_booking.id, v_session.teacher_id, v_student_id, p_resolution_type, v_pct, v_pay,
     (v_refund AND v_credits > 0 AND NOT v_already_refunded), v_final, v_uid, p_notes)
  RETURNING id INTO v_res_id;

  -- Update booking status
  IF v_booking.id IS NOT NULL THEN
    UPDATE public.class_bookings SET status = v_final, updated_at = now() WHERE id = v_booking.id;
  END IF;

  -- Refund exactly what the lesson cost, once.
  IF v_refund AND v_credits > 0 AND NOT v_already_refunded AND v_student_id IS NOT NULL THEN
    PERFORM public.refund_credits(v_student_id, v_credits);
  END IF;

  -- Payroll adjustment if teacher gets paid
  IF v_pay > 0 THEN
    INSERT INTO public.payroll_records
      (teacher_id, teacher_name, month, year, total_lessons, total_hours, hourly_rate, base_pay, bonus_amount, total_earned, payment_status, notes)
    VALUES
      (v_session.teacher_id, COALESCE(v_teacher_name, 'Teacher'),
       EXTRACT(MONTH FROM now())::int, EXTRACT(YEAR FROM now())::int,
       1, v_duration_h, v_hourly, v_pay, 0, v_pay, 'pending',
       'Resolution ' || p_resolution_type || ' for session ' || p_session_id::text);
  END IF;

  -- Mark session resolved
  UPDATE public.classroom_sessions
     SET session_status = 'resolved',
         disconnect_reason = COALESCE(disconnect_reason, p_resolution_type),
         fault_type = COALESCE(fault_type, p_resolution_type),
         updated_at = now()
   WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'resolution_id', v_res_id,
    'teacher_pay_eur', v_pay,
    'teacher_pay_pct', v_pct,
    'refunded', (v_refund AND v_credits > 0 AND NOT v_already_refunded),
    'credits_refunded', CASE WHEN v_refund AND NOT v_already_refunded THEN v_credits ELSE 0 END,
    'final_status', v_final
  );
END $function$;

REVOKE ALL ON FUNCTION public.apply_classroom_resolution(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_classroom_resolution(uuid, text, text) TO authenticated, service_role;
