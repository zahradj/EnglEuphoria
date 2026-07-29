-- Fix: get_teacher_available_balance only ever counted status='paid', but nothing
-- in the codebase ever sets that status — the real accrual pipeline produces
-- 'pending_clearance' then 'payable' (via the existing hourly clearance cron).
-- Teacher balances have been structurally stuck at 0 regardless of earnings.
CREATE OR REPLACE FUNCTION public.get_teacher_available_balance(teacher_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_earned DECIMAL(10,2);
  pending_withdrawals DECIMAL(10,2);
  completed_withdrawals DECIMAL(10,2);
  available_balance DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(teacher_amount), 0.00)
  INTO total_earned
  FROM public.teacher_earnings
  WHERE teacher_id = teacher_uuid AND status IN ('paid', 'payable');

  SELECT COALESCE(SUM(amount), 0.00)
  INTO pending_withdrawals
  FROM public.teacher_withdrawals
  WHERE teacher_id = teacher_uuid AND status IN ('pending', 'approved');

  SELECT COALESCE(SUM(amount), 0.00)
  INTO completed_withdrawals
  FROM public.teacher_withdrawals
  WHERE teacher_id = teacher_uuid AND status = 'completed';

  available_balance := total_earned - pending_withdrawals - completed_withdrawals;

  RETURN GREATEST(available_balance, 0.00);
END;
$function$;

-- Fix: end_lesson (the correct, atomic close-out RPC) inserted teacher_earnings
-- with status='available' — a status the balance function never recognized, and
-- different from what the auto-accrual trigger on class_bookings produces
-- ('pending_clearance'). Align end_lesson onto the same lifecycle the existing
-- 24h clearance cron already promotes to 'payable', and make its insert
-- idempotent against that trigger firing first in the same transaction (both
-- write to the same booking_id, unique-constrained) — end_lesson's own
-- (accurate, per-teacher-rate) numbers now win via ON CONFLICT DO UPDATE.
CREATE OR REPLACE FUNCTION public.end_lesson(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller        uuid := auth.uid();
  v_is_admin      boolean := public.has_role(v_caller, 'admin');
  v_booking       public.class_bookings%ROWTYPE;
  v_rate          numeric;
  v_gross         numeric;
  v_teacher_amt   numeric;
  v_platform_amt  numeric;
  v_currency      text;
  v_earning_id    uuid;
  v_completion_id uuid;
  v_existing      public.teacher_earnings%ROWTYPE;
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

  IF v_booking.status = 'completed' THEN
    SELECT * INTO v_existing FROM public.teacher_earnings WHERE booking_id = p_booking_id LIMIT 1;
    RETURN jsonb_build_object(
      'already_completed', true,
      'booking_id', p_booking_id,
      'earning_id', v_existing.id,
      'teacher_amount', v_existing.teacher_amount
    );
  END IF;

  SELECT COALESCE(tp.payout_rate_override, 0.40)
    INTO v_rate
  FROM public.teacher_profiles tp
  WHERE tp.user_id = v_booking.teacher_id
  LIMIT 1;

  v_rate := COALESCE(v_rate, 0.40);

  v_gross := COALESCE(v_booking.price_paid, 0)::numeric;
  v_teacher_amt := round(v_gross * v_rate, 2);
  v_platform_amt := v_gross - v_teacher_amt;
  v_currency := COALESCE(v_booking.currency, 'EUR');

  UPDATE public.class_bookings
     SET status = 'completed',
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

  INSERT INTO public.teacher_earnings (
    teacher_id, booking_id, lesson_id,
    gross_amount, teacher_amount, platform_amount, amount,
    split_percentage, status, earned_at
  )
  VALUES (
    v_booking.teacher_id, p_booking_id, v_booking.lesson_id,
    v_gross, v_teacher_amt, v_platform_amt, v_teacher_amt,
    v_rate * 100, 'pending_clearance', now()
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
    1, v_rate, v_teacher_amt, v_currency, 'pending_clearance'
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

  RETURN jsonb_build_object(
    'already_completed', false,
    'booking_id', p_booking_id,
    'earning_id', v_earning_id,
    'completion_id', v_completion_id,
    'teacher_amount', v_teacher_amt,
    'platform_amount', v_platform_amt,
    'currency', v_currency,
    'rate', v_rate
  );
END;
$$;

-- One rating per student per booking, so the new post-lesson rating card can upsert cleanly.
CREATE UNIQUE INDEX IF NOT EXISTS teacher_reviews_booking_student_unique
  ON public.teacher_reviews(booking_id, student_id) WHERE booking_id IS NOT NULL;
