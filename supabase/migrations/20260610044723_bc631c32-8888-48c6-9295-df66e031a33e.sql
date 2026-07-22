
-- 1. Extend teacher_earnings
ALTER TABLE public.teacher_earnings
  ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.class_bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS amount numeric;

-- Backfill amount from teacher_amount if amount is null
UPDATE public.teacher_earnings SET amount = COALESCE(amount, teacher_amount, gross_amount, 0);

-- Allow new status values (status is text, no constraint to drop)
CREATE UNIQUE INDEX IF NOT EXISTS teacher_earnings_booking_unique
  ON public.teacher_earnings(booking_id) WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS teacher_earnings_status_created_idx
  ON public.teacher_earnings(status, created_at);

-- 2. Auto-accrual trigger: when a booking flips to 'completed', insert pending earnings
CREATE OR REPLACE FUNCTION public.accrue_teacher_earnings_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate numeric;
BEGIN
  IF NEW.status = 'completed'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN

    -- Look up teacher per_class_rate
    SELECT COALESCE(per_class_rate, hourly_rate_eur, 0)
      INTO v_rate
      FROM public.teacher_profiles
     WHERE user_id = NEW.teacher_id
     LIMIT 1;

    IF v_rate IS NULL OR v_rate <= 0 THEN
      v_rate := COALESCE(NEW.price_paid, 0);
    END IF;

    INSERT INTO public.teacher_earnings (
      teacher_id, lesson_id, booking_id, amount,
      gross_amount, teacher_amount, status, earned_at
    )
    VALUES (
      NEW.teacher_id, NEW.lesson_id, NEW.id, v_rate,
      v_rate, v_rate, 'pending_clearance', now()
    )
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_accrue_teacher_earnings ON public.class_bookings;
CREATE TRIGGER trg_accrue_teacher_earnings
  AFTER INSERT OR UPDATE OF status ON public.class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.accrue_teacher_earnings_on_completion();

-- 3. Clearance function (24h dispute window)
CREATE OR REPLACE FUNCTION public.clear_pending_earnings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.teacher_earnings
     SET status = 'payable',
         updated_at = now()
   WHERE status = 'pending_clearance'
     AND created_at < now() - interval '24 hours';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 4. Hourly cron job
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('clear-pending-teacher-earnings')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'clear-pending-teacher-earnings');
    PERFORM cron.schedule(
      'clear-pending-teacher-earnings',
      '0 * * * *',
      $cron$ SELECT public.clear_pending_earnings(); $cron$
    );
  END IF;
END $$;
