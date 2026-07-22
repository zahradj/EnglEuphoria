
-- ============================================================
-- PHASE 1: WIPE TEST DATA
-- ============================================================
TRUNCATE TABLE
  public.classroom_timeline_events,
  public.classroom_session_heartbeats,
  public.classroom_states,
  public.classroom_sessions,
  public.post_class_feedback,
  public.teacher_reviews,
  public.lesson_completions,
  public.lesson_payments,
  public.lesson_reminders,
  public.teacher_earnings,
  public.teacher_payouts_ledger,
  public.teacher_payouts,
  public.teacher_performance_metrics,
  public.payroll_records,
  public.revenue_splits,
  public.scheduled_lessons,
  public.appointments,
  public.class_bookings
RESTART IDENTITY CASCADE;

-- ============================================================
-- PHASE 2: SCHEMA ADDITIONS
-- ============================================================

-- Booking completion timestamp
ALTER TABLE public.class_bookings
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

-- Lesson completion traceability
ALTER TABLE public.lesson_completions
  ADD COLUMN IF NOT EXISTS booking_id uuid,
  ADD COLUMN IF NOT EXISTS teacher_id uuid;

-- Per-teacher payout override (super-admin sets this; null = platform default)
ALTER TABLE public.teacher_profiles
  ADD COLUMN IF NOT EXISTS payout_rate_override numeric CHECK (payout_rate_override IS NULL OR (payout_rate_override >= 0 AND payout_rate_override <= 1));

COMMENT ON COLUMN public.teacher_profiles.payout_rate_override IS
  'Teacher revenue share as a decimal (e.g. 0.50 = 50%). NULL means use platform default (0.40).';

-- Performance metric counters
ALTER TABLE public.teacher_performance_metrics
  ADD COLUMN IF NOT EXISTS lessons_taught integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_minutes_taught integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_lesson_at timestamptz;

-- Unique link from earnings to booking (prevents double-credit)
CREATE UNIQUE INDEX IF NOT EXISTS teacher_earnings_booking_id_unique
  ON public.teacher_earnings (booking_id)
  WHERE booking_id IS NOT NULL;

-- Helpful dashboard indexes
CREATE INDEX IF NOT EXISTS class_bookings_teacher_status_ended_idx
  ON public.class_bookings (teacher_id, status, ended_at DESC);

CREATE INDEX IF NOT EXISTS teacher_earnings_teacher_earned_idx
  ON public.teacher_earnings (teacher_id, earned_at DESC);

-- ============================================================
-- PHASE 3: end_lesson RPC
-- ============================================================
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

  -- Idempotent: already completed → return existing earning
  IF v_booking.status = 'completed' THEN
    SELECT * INTO v_existing FROM public.teacher_earnings WHERE booking_id = p_booking_id LIMIT 1;
    RETURN jsonb_build_object(
      'already_completed', true,
      'booking_id', p_booking_id,
      'earning_id', v_existing.id,
      'teacher_amount', v_existing.teacher_amount
    );
  END IF;

  -- Resolve payout rate: per-teacher override → platform default 0.40
  SELECT COALESCE(tp.payout_rate_override, 0.40)
    INTO v_rate
  FROM public.teacher_profiles tp
  WHERE tp.user_id = v_booking.teacher_id
  LIMIT 1;

  v_rate := COALESCE(v_rate, 0.40);

  -- Gross = price_paid (integer minor units assumed at booking layer; treat as currency units)
  v_gross := COALESCE(v_booking.price_paid, 0)::numeric;
  v_teacher_amt := round(v_gross * v_rate, 2);
  v_platform_amt := v_gross - v_teacher_amt;
  v_currency := COALESCE(v_booking.currency, 'EUR');

  -- 1. Mark booking complete
  UPDATE public.class_bookings
     SET status = 'completed',
         ended_at = now(),
         updated_at = now()
   WHERE id = p_booking_id;

  -- 2. Close classroom session(s)
  UPDATE public.classroom_sessions
     SET session_status = 'ended',
         ended_at = COALESCE(ended_at, now()),
         updated_at = now()
   WHERE classroom_sessions.lesson_id::text = p_booking_id::text
      OR classroom_sessions.room_id = p_booking_id::text;

  -- 3. Insert lesson completion (one per booking)
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

  -- 4. Credit teacher earnings
  INSERT INTO public.teacher_earnings (
    teacher_id, booking_id, lesson_id,
    gross_amount, teacher_amount, platform_amount, amount,
    split_percentage, status, earned_at
  )
  VALUES (
    v_booking.teacher_id, p_booking_id, v_booking.lesson_id,
    v_gross, v_teacher_amt, v_platform_amt, v_teacher_amt,
    v_rate * 100, 'available', now()
  )
  RETURNING id INTO v_earning_id;

  -- 5. Ledger entry (auto-available)
  INSERT INTO public.teacher_payouts_ledger (
    teacher_user_id, period_start, period_end, classes_count,
    rate_applied, amount, currency, status
  )
  VALUES (
    v_booking.teacher_id,
    (now() AT TIME ZONE 'UTC')::date,
    (now() AT TIME ZONE 'UTC')::date,
    1, v_rate, v_teacher_amt, v_currency, 'available'
  );

  -- 6. Bump performance metrics
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

-- Unique constraint to make ON CONFLICT work for performance metrics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teacher_performance_metrics_teacher_id_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.teacher_performance_metrics
        ADD CONSTRAINT teacher_performance_metrics_teacher_id_unique UNIQUE (teacher_id);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.end_lesson(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.end_lesson(uuid) TO authenticated;

-- Realtime: make sure dashboard subscriptions work
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_earnings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_payouts_ledger;
