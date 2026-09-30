-- Two kinds of teachers: LOCAL teachers are paid in DZD, INTERNATIONAL
-- teachers in EUR. Until now every earning was implicitly euros (and the
-- ledger even stamped the booking's DZD on a euro amount).
--
-- teacher_profiles.payout_currency is the single source of truth, set by
-- admin in Teacher Management > Compensation. per_class_rate is in that
-- currency. Backfill: a teacher who can teach the international market is
-- international (EUR); a DZ-only teacher is local (DZD).

ALTER TABLE public.teacher_profiles
  ADD COLUMN IF NOT EXISTS payout_currency text NOT NULL DEFAULT 'EUR'
    CHECK (payout_currency IN ('DZD', 'EUR'));

UPDATE public.teacher_profiles
   SET payout_currency = CASE WHEN 'INTL' = ANY (COALESCE(market_access, ARRAY[]::text[])) THEN 'EUR' ELSE 'DZD' END;

ALTER TABLE public.teacher_earnings
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR'
    CHECK (currency IN ('DZD', 'EUR'));

UPDATE public.teacher_earnings e
   SET currency = tp.payout_currency
  FROM public.teacher_profiles tp
 WHERE tp.user_id = e.teacher_id;

CREATE OR REPLACE FUNCTION public.teacher_payout_currency(p_teacher_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT payout_currency FROM public.teacher_profiles WHERE user_id = p_teacher_id LIMIT 1),
    'EUR');
$$;

-- Pay for one lesson, in the teacher's payout currency:
--   per_class_rate if the admin set one, else the teacher's hourly rate in
--   that currency (hourly_rate_dzd / hourly_rate_eur) pro-rated to the
--   booking's duration. The old "40% of price_paid" fallback is gone: the
--   student's price is in the STUDENT's currency, which needn't match.
CREATE OR REPLACE FUNCTION public.teacher_pay_for_booking(p_booking public.class_bookings)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE((
    SELECT COALESCE(
      NULLIF(tp.per_class_rate, 0),
      round(
        (CASE WHEN tp.payout_currency = 'DZD' THEN tp.hourly_rate_dzd ELSE tp.hourly_rate_eur END)::numeric
        * COALESCE(NULLIF(p_booking.duration, 0), 30) / 60.0, 2))
    FROM public.teacher_profiles tp
    WHERE tp.user_id = p_booking.teacher_id
    LIMIT 1
  ), 0);
$$;

CREATE OR REPLACE FUNCTION public.accrue_teacher_earnings_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pay numeric;
BEGIN
  IF NEW.status = 'completed'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed')
     AND (NEW.ended_at IS NULL OR NEW.ended_at > now() - interval '24 hours') THEN

    v_pay := public.teacher_pay_for_booking(NEW);

    -- gross = teacher pay: the student's price is in a different currency
    -- space, so no platform split is recorded on this row.
    INSERT INTO public.teacher_earnings (
      teacher_id, lesson_id, booking_id, amount,
      gross_amount, teacher_amount, platform_amount, split_percentage,
      currency, status, earned_at
    )
    VALUES (
      NEW.teacher_id, NEW.lesson_id, NEW.id, v_pay,
      v_pay, v_pay, 0, 100,
      public.teacher_payout_currency(NEW.teacher_id), 'pending_clearance', now()
    )
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

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
  v_teacher_amt   numeric;
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
      'currency', v_existing.currency,
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
    v_currency := public.teacher_payout_currency(v_booking.teacher_id);

    INSERT INTO public.teacher_earnings (
      teacher_id, booking_id, lesson_id,
      gross_amount, teacher_amount, platform_amount, amount,
      split_percentage, currency, status, earned_at
    )
    VALUES (
      v_booking.teacher_id, p_booking_id, v_booking.lesson_id,
      v_teacher_amt, v_teacher_amt, 0, v_teacher_amt,
      100, v_currency, 'pending_clearance', now()
    )
    ON CONFLICT (booking_id) DO UPDATE SET
      gross_amount = EXCLUDED.gross_amount,
      teacher_amount = EXCLUDED.teacher_amount,
      platform_amount = EXCLUDED.platform_amount,
      amount = EXCLUDED.amount,
      split_percentage = EXCLUDED.split_percentage,
      currency = EXCLUDED.currency,
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
    'platform_amount', 0,
    'currency', v_currency,
    'rate', v_teacher_amt,
    'status', v_status,
    'technical_fault_party', v_fault,
    'paid', v_earning_id IS NOT NULL
  );
END;
$function$;

-- Owed this month now also reports the currency it is in.
DROP FUNCTION IF EXISTS public.get_teacher_monthly_owed(uuid);
CREATE FUNCTION public.get_teacher_monthly_owed(p_teacher_user_id uuid)
 RETURNS TABLE(classes_count integer, rate_applied numeric, amount numeric, period_start date, period_end date, currency text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_teacher_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH bounds AS (
    SELECT
      date_trunc('month', now())::date AS p_start,
      (date_trunc('month', now()) + interval '1 month - 1 day')::date AS p_end
  ),
  owed AS (
    SELECT count(*)::integer AS n, COALESCE(sum(e.teacher_amount), 0)::numeric AS total
    FROM public.teacher_earnings e, bounds b
    WHERE e.teacher_id = p_teacher_user_id
      AND e.status IS DISTINCT FROM 'paid'
      AND e.earned_at >= b.p_start
      AND e.earned_at < (b.p_end + interval '1 day')
  )
  SELECT owed.n,
         COALESCE((SELECT per_class_rate FROM public.teacher_profiles WHERE user_id = p_teacher_user_id LIMIT 1), 0)::numeric,
         owed.total, bounds.p_start, bounds.p_end,
         public.teacher_payout_currency(p_teacher_user_id)
  FROM owed, bounds;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_teacher_monthly_owed(uuid) TO authenticated;

-- Teachers must not be able to switch their own pay currency either.
CREATE OR REPLACE FUNCTION public.guard_teacher_profile_privileged_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.can_teach                 := OLD.can_teach;
    NEW.profile_approved_by_admin := OLD.profile_approved_by_admin;
    NEW.hourly_rate_eur           := OLD.hourly_rate_eur;
    NEW.hourly_rate_dzd           := OLD.hourly_rate_dzd;
    NEW.per_class_rate            := OLD.per_class_rate;
    NEW.payout_rate_override      := OLD.payout_rate_override;
    NEW.payout_currency           := OLD.payout_currency;
  END IF;
  RETURN NEW;
END;
$function$;
