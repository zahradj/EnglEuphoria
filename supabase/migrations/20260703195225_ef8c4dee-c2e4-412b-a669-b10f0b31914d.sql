
-- 1) Default value for future inserts (no-op when the app sends a value)
ALTER TABLE public.class_bookings
  ALTER COLUMN booking_type SET DEFAULT 'standard';

-- 2) BEFORE INSERT trigger: promote the student's very first booking to 'trial'
CREATE OR REPLACE FUNCTION public.stamp_booking_type_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.booking_type IS NOT NULL AND NEW.booking_type <> '' THEN
    RETURN NEW;
  END IF;

  IF NEW.student_id IS NULL THEN
    NEW.booking_type := 'standard';
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.class_bookings
    WHERE student_id = NEW.student_id
      AND (status IS NULL OR status NOT IN ('cancelled','failed'))
  ) THEN
    NEW.booking_type := 'standard';
  ELSE
    NEW.booking_type := 'trial';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stamp_booking_type_on_insert ON public.class_bookings;
CREATE TRIGGER trg_stamp_booking_type_on_insert
BEFORE INSERT ON public.class_bookings
FOR EACH ROW
EXECUTE FUNCTION public.stamp_booking_type_on_insert();

-- 3) At most one 'trial' booking per student
CREATE UNIQUE INDEX IF NOT EXISTS uq_class_bookings_one_trial_per_student
  ON public.class_bookings (student_id)
  WHERE booking_type = 'trial';

-- 4) Speed up filters by booking_type
CREATE INDEX IF NOT EXISTS idx_class_bookings_booking_type
  ON public.class_bookings (booking_type);
