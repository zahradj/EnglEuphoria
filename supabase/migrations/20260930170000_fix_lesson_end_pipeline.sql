-- Fix the end-of-lesson pipeline. Before this, NOT ONE booking ever reached
-- 'completed': end_lesson() rolled back every time, so the teacher dashboard
-- (Past / No Feedback), earnings and the student's lesson history never
-- updated. Verified by dry-running end_lesson as the teacher. Causes:
--
--  1. trg_accrue_teacher_earnings (fires when a booking flips to 'completed')
--     inserted teacher_earnings without platform_amount / split_percentage,
--     both NOT NULL -> the whole end_lesson transaction aborted.
--  2. teacher_earnings.lesson_id is NOT NULL but class_bookings.lesson_id is
--     null on most bookings.
--  3. lesson_completions requires curriculum_id / week_number /
--     lesson_number, which end_lesson never has.
--  4. lesson_feedback_submissions.lesson_id has an FK to the legacy
--     `lessons` table, but every reader (teacher dashboard, student history,
--     parent card, FeedbackReportDialog) keys it by class_bookings.id — so
--     the wrap-up report insert always failed the FK.
--  5. end_lesson paid 40% of price_paid (0 for package/credit bookings) and
--     then overwrote the trigger's per-class-rate row with that 0.

-- 2, 3, 4: relax constraints the app can't satisfy.
ALTER TABLE public.teacher_earnings ALTER COLUMN lesson_id DROP NOT NULL;
ALTER TABLE public.lesson_completions ALTER COLUMN curriculum_id DROP NOT NULL;
ALTER TABLE public.lesson_completions ALTER COLUMN week_number DROP NOT NULL;
ALTER TABLE public.lesson_completions ALTER COLUMN lesson_number DROP NOT NULL;
ALTER TABLE public.lesson_feedback_submissions
  DROP CONSTRAINT IF EXISTS lesson_feedback_submissions_lesson_id_fkey;

-- One pay rule for both writers: the teacher's per-class rate (set by admin
-- in Teacher Management); fall back to 40% of what the student paid.
CREATE OR REPLACE FUNCTION public.teacher_pay_for_booking(p_booking public.class_bookings)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT NULLIF(tp.per_class_rate, 0) FROM public.teacher_profiles tp
      WHERE tp.user_id = p_booking.teacher_id LIMIT 1),
    round(COALESCE(p_booking.price_paid, 0)::numeric
          * COALESCE((SELECT tp.payout_rate_override FROM public.teacher_profiles tp
                       WHERE tp.user_id = p_booking.teacher_id LIMIT 1), 0.40), 2)
  );
$$;

-- 1: the trigger now writes a valid row. It stays as the safety net for any
-- path that flips a booking to 'completed' (admin tools, end_lesson), but
-- never pays a report filed more than 24h after the lesson ended (the
-- "report within 24h or it isn't paid" rule the wrap-up dialog enforces).
CREATE OR REPLACE FUNCTION public.accrue_teacher_earnings_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pay   numeric;
  v_gross numeric;
BEGIN
  IF NEW.status = 'completed'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed')
     AND (NEW.ended_at IS NULL OR NEW.ended_at > now() - interval '24 hours') THEN

    v_pay := public.teacher_pay_for_booking(NEW);
    v_gross := GREATEST(COALESCE(NEW.price_paid, 0)::numeric, v_pay);

    INSERT INTO public.teacher_earnings (
      teacher_id, lesson_id, booking_id, amount,
      gross_amount, teacher_amount, platform_amount, split_percentage,
      status, earned_at
    )
    VALUES (
      NEW.teacher_id, NEW.lesson_id, NEW.id, v_pay,
      v_gross, v_pay, v_gross - v_pay,
      CASE WHEN v_gross > 0 THEN round(v_pay / v_gross * 100, 2) ELSE 100 END,
      'pending_clearance', now()
    )
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- 5: end_lesson uses the same pay rule.
CREATE OR REPLACE FUNCTION public.end_lesson(p_booking_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller        uuid := auth.uid();
  v_is_admin      boolean := public.has_role(v_caller, 'admin');
  v_booking       public.class_bookings%ROWTYPE;
  v_gross         numeric;
  v_teacher_amt   numeric;
  v_platform_amt  numeric;
  v_split         numeric;
  v_currency      text;
  v_earning_id    uuid;
  v_completion_id uuid;
  v_existing      public.teacher_earnings%ROWTYPE;
  v_session_id    uuid;
  v_teacher_dc    integer;
  v_student_dc    integer;
  v_status        text := 'completed';
  v_fault         text := NULL;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_booking FROM public.class_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  IF NOT v_is_admin AND v_booking.teacher_id <> v_caller THEN
    RAISE EXCEPTION 'Not authorized to end this lesson';
  END IF;

  IF v_booking.status IN ('completed', 'failed_technical') THEN
    SELECT * INTO v_existing FROM public.teacher_earnings WHERE booking_id = p_booking_id LIMIT 1;
    RETURN jsonb_build_object(
      'already_completed', true,
      'booking_id', p_booking_id,
      'earning_id', v_existing.id,
      'teacher_amount', v_existing.teacher_amount,
      'status', v_booking.status,
      'technical_fault_party', v_booking.technical_fault_party
    );
  END IF;

  SELECT id INTO v_session_id
    FROM public.classroom_sessions
   WHERE classroom_sessions.lesson_id::text = p_booking_id::text
      OR classroom_sessions.room_id = p_booking_id::text
   ORDER BY updated_at DESC NULLS LAST
   LIMIT 1;

  IF v_session_id IS NOT NULL THEN
    SELECT teacher_disconnects, student_disconnects
      INTO v_teacher_dc, v_student_dc
      FROM public.compute_session_disconnects(v_session_id);

    IF COALESCE(v_teacher_dc, 0) >= 3 OR COALESCE(v_student_dc, 0) >= 3 THEN
      v_status := 'failed_technical';
      IF COALESCE(v_teacher_dc, 0) >= 3 AND COALESCE(v_student_dc, 0) >= 3 THEN
        v_fault := 'both';
      ELSIF COALESCE(v_teacher_dc, 0) >= 3 THEN
        v_fault := 'teacher';
      ELSE
        v_fault := 'student';
      END IF;
    END IF;
  END IF;

  UPDATE public.class_bookings
     SET status = v_status,
         technical_fault_party = v_fault,
         ended_at = COALESCE(ended_at, now()),
         updated_at = now()
   WHERE id = p_booking_id;

  UPDATE public.classroom_sessions
     SET session_status = 'ended',
         ended_at = COALESCE(ended_at, now()),
         updated_at = now()
   WHERE classroom_sessions.lesson_id::text = p_booking_id::text
      OR classroom_sessions.room_id = p_booking_id::text;

  INSERT INTO public.lesson_completions (
    student_id, teacher_id, booking_id, lesson_id, completed_at
  )
  VALUES (
    v_booking.student_id,
    v_booking.teacher_id,
    p_booking_id,
    COALESCE(v_booking.lesson_id::text, p_booking_id::text),
    now()
  )
  RETURNING id INTO v_completion_id;

  -- Pay the teacher unless it was a confirmed teacher-side technical failure.
  IF NOT (v_status = 'failed_technical' AND v_fault = 'teacher') THEN
    v_teacher_amt := public.teacher_pay_for_booking(v_booking);
    v_gross := GREATEST(COALESCE(v_booking.price_paid, 0)::numeric, v_teacher_amt);
    v_platform_amt := v_gross - v_teacher_amt;
    v_split := CASE WHEN v_gross > 0 THEN round(v_teacher_amt / v_gross * 100, 2) ELSE 100 END;
    v_currency := COALESCE(v_booking.currency, 'EUR');

    INSERT INTO public.teacher_earnings (
      teacher_id, booking_id, lesson_id,
      gross_amount, teacher_amount, platform_amount, amount,
      split_percentage, status, earned_at
    )
    VALUES (
      v_booking.teacher_id, p_booking_id, v_booking.lesson_id,
      v_gross, v_teacher_amt, v_platform_amt, v_teacher_amt,
      v_split, 'pending_clearance', now()
    )
    ON CONFLICT (booking_id) DO UPDATE SET
      gross_amount = EXCLUDED.gross_amount,
      teacher_amount = EXCLUDED.teacher_amount,
      platform_amount = EXCLUDED.platform_amount,
      amount = EXCLUDED.amount,
      split_percentage = EXCLUDED.split_percentage,
      status = EXCLUDED.status,
      earned_at = EXCLUDED.earned_at
    RETURNING id INTO v_earning_id;

    INSERT INTO public.teacher_payouts_ledger (
      teacher_user_id, period_start, period_end, classes_count,
      rate_applied, amount, currency, status
    )
    VALUES (
      v_booking.teacher_id,
      (now() AT TIME ZONE 'UTC')::date,
      (now() AT TIME ZONE 'UTC')::date,
      1, v_teacher_amt, v_teacher_amt, v_currency, 'pending_clearance'
    );

    INSERT INTO public.teacher_performance_metrics (
      teacher_id, lessons_taught, total_minutes_taught, last_lesson_at
    )
    VALUES (
      v_booking.teacher_id, 1, COALESCE(v_booking.duration, 0), now()
    )
    ON CONFLICT (teacher_id) DO UPDATE
      SET lessons_taught = public.teacher_performance_metrics.lessons_taught + 1,
          total_minutes_taught = public.teacher_performance_metrics.total_minutes_taught + COALESCE(v_booking.duration, 0),
          last_lesson_at = now(),
          updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'already_completed', false,
    'booking_id', p_booking_id,
    'earning_id', v_earning_id,
    'completion_id', v_completion_id,
    'teacher_amount', v_teacher_amt,
    'platform_amount', v_platform_amt,
    'currency', v_currency,
    'rate', v_teacher_amt,
    'status', v_status,
    'technical_fault_party', v_fault,
    'paid', v_earning_id IS NOT NULL
  );
END;
$function$;
