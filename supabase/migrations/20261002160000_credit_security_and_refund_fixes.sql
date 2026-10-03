-- Credits hardening + refund correctness (prerequisite for the shared family wallet).
--
-- Found on the live database:
--   1. consume_credits / refund_credits / complete_referral / refund_lesson_credit /
--      auto_finalize_stale_bookings were executable by anon AND authenticated. Anyone could drain a
--      student's credits or restore their used credits. refund_lesson_credit's own check also passes
--      for a logged-out caller (auth.uid() is NULL, so the comparison is NULL, not true).
--   2. student_credits had an INSERT policy (auth.uid() = student_id) and 44 of 47 students have no
--      row, so a student could insert their own row with any total_credits.
--   3. The teacher left-early trigger and apply_classroom_resolution refunded a flat 1 credit: too
--      little for a 2-credit Playground hour, and the trigger also refunded free trials (minting a
--      credit). Both now refund exactly lessons.credits_used and refund nothing for trials.
--
-- Nothing in src/ calls these credit functions directly; they are only invoked from other
-- SECURITY DEFINER functions (which run as the owner and are unaffected), the hourly cron job
-- (postgres) and service-role edge functions. Booking, cancelling and rescheduling keep working.
--
-- Safe to apply any time (a handful of metadata changes, no table rewrites, no data changes), but
-- prefer a quiet moment: it replaces two functions that classroom flows use.

-- ---------------------------------------------------------------------------
-- 1. Lock down the credit primitives
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.consume_credits(uuid, integer)        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer)         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_referral(uuid)               FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_lesson_credit(uuid)            FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_finalize_stale_bookings()        FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credits(uuid, integer)     TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, integer)      TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_referral(uuid)            TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_lesson_credit(uuid)         TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_finalize_stale_bookings()     TO service_role;

-- Client-facing RPCs stay for logged-in users only (they check auth.uid() themselves).
REVOKE ALL ON FUNCTION public.book_class_slot(uuid[], uuid, timestamptz, integer, text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.student_cancel_lesson(uuid, text)                                        FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.book_class_slot(uuid[], uuid, timestamptz, integer, text, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.student_cancel_lesson(uuid, text)                                        TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. A student must never create their own credit balance
--    (rows are created by the purchase trigger, referral/admin code and SECURITY DEFINER functions;
--     admins keep "Admins can manage all credits").
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can insert credits" ON public.student_credits;

-- ---------------------------------------------------------------------------
-- 3a. Left-early refund: refund what the lesson actually cost, never for trials
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refund_credit_on_left_early()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_booking_id uuid;
  v_student_id uuid;
  v_teacher_id uuid;
  v_lesson_id uuid;
  v_hub text;
  v_credits integer;
  v_already_refunded boolean;
BEGIN
  -- Only react to teacher-initiated left-early class/trial ends.
  IF NEW.action NOT IN ('class_ended', 'trial_ended') THEN
    RETURN NEW;
  END IF;
  IF COALESCE((NEW.new_values ->> 'left_early')::boolean, false) IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  v_booking_id := NEW.resource_id;
  IF v_booking_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Idempotency: skip if this booking already has a refund audit row.
  SELECT EXISTS (
    SELECT 1 FROM public.audit_logs
    WHERE action = 'class_credit_refunded'
      AND resource_id = v_booking_id
  ) INTO v_already_refunded;
  IF v_already_refunded THEN
    RETURN NEW;
  END IF;

  SELECT student_id, teacher_id, hub_type, lesson_id
    INTO v_student_id, v_teacher_id, v_hub, v_lesson_id
  FROM public.class_bookings
  WHERE id = v_booking_id;

  IF v_student_id IS NULL OR v_lesson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- credits_used is what the booking really consumed: 0 for trials / free lessons, 2 for a Playground hour.
  SELECT COALESCE(credits_used, 0) INTO v_credits FROM public.lessons WHERE id = v_lesson_id;
  IF COALESCE(v_credits, 0) < 1 THEN
    RETURN NEW;
  END IF;

  PERFORM public.refund_credits(v_student_id, v_credits);

  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, new_values)
  VALUES (
    NEW.user_id, -- teacher who ended the class
    'class_credit_refunded',
    'class_booking',
    v_booking_id,
    jsonb_build_object(
      'student_id', v_student_id,
      'teacher_id', v_teacher_id,
      'hub_type', COALESCE(v_hub, NEW.new_values ->> 'hub_type'),
      'credits_refunded', v_credits,
      'reason', 'left_early',
      'source_action', NEW.action,
      'ended_at_minutes',
        COALESCE(
          NEW.new_values ->> 'ended_at_minutes',
          NEW.new_values ->> 'trial_ended_at_minutes'
        )
    )
  );

  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 3b. Admin classroom resolution: same correction, plus a double-refund guard
-- ---------------------------------------------------------------------------
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

  IF v_session.booking_id IS NOT NULL THEN
    SELECT * INTO v_booking FROM public.class_bookings WHERE id = v_session.booking_id;
  END IF;

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
  IF v_refund AND v_session.booking_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.classroom_resolutions
      WHERE booking_id = v_session.booking_id AND credit_refunded = true
    ) OR EXISTS (
      SELECT 1 FROM public.audit_logs
      WHERE action = 'class_credit_refunded' AND resource_id = v_session.booking_id
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
    (p_session_id, v_session.booking_id, v_session.teacher_id, v_session.student_id, p_resolution_type, v_pct, v_pay,
     (v_refund AND v_credits > 0 AND NOT v_already_refunded), v_final, v_uid, p_notes)
  RETURNING id INTO v_res_id;

  -- Update booking status
  IF v_session.booking_id IS NOT NULL THEN
    UPDATE public.class_bookings SET status = v_final, updated_at = now() WHERE id = v_session.booking_id;
  END IF;

  -- Refund exactly what the lesson cost, once.
  IF v_refund AND v_credits > 0 AND NOT v_already_refunded AND v_session.student_id IS NOT NULL THEN
    PERFORM public.refund_credits(v_session.student_id, v_credits);
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

-- Keep the admin RPC logged-in only (it checks has_role(auth.uid(), 'admin') itself).
REVOKE ALL ON FUNCTION public.apply_classroom_resolution(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_classroom_resolution(uuid, text, text) TO authenticated, service_role;
