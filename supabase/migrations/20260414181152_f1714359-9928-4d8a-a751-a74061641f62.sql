
-- Disable only the past-booking check trigger
ALTER TABLE public.lessons DISABLE TRIGGER prevent_past_bookings;

-- Fix orphaned bookings
DO $$
DECLARE
  new_lesson_id UUID;
  booking RECORD;
  student_name TEXT;
BEGIN
  FOR booking IN
    SELECT cb.* FROM public.class_bookings cb
    WHERE cb.lesson_id IS NULL
  LOOP
    SELECT full_name INTO student_name FROM public.users WHERE id = booking.student_id;

    INSERT INTO public.lessons (
      teacher_id, student_id, title, scheduled_at, duration, status, cost
    ) VALUES (
      booking.teacher_id,
      booking.student_id,
      CASE 
        WHEN booking.booking_type = 'trial' THEN 'Trial Lesson with ' || COALESCE(student_name, 'Student')
        ELSE 'Lesson with ' || COALESCE(student_name, 'Student')
      END,
      booking.scheduled_at,
      booking.duration,
      CASE WHEN booking.status = 'confirmed' THEN 'scheduled' ELSE booking.status END,
      booking.price_paid
    ) RETURNING id INTO new_lesson_id;

    UPDATE public.class_bookings SET lesson_id = new_lesson_id WHERE id = booking.id;
  END LOOP;
END;
$$;

-- Re-enable the trigger
ALTER TABLE public.lessons ENABLE TRIGGER prevent_past_bookings;

-- Update check_future_booking to allow sync from existing bookings
CREATE OR REPLACE FUNCTION public.check_future_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.scheduled_at < NOW() THEN
    -- Allow if a matching class_booking already exists (retroactive sync)
    IF EXISTS (
      SELECT 1 FROM public.class_bookings 
      WHERE teacher_id = NEW.teacher_id 
        AND student_id = NEW.student_id 
        AND scheduled_at = NEW.scheduled_at
    ) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Cannot book lessons in the past';
  END IF;
  RETURN NEW;
END;
$$;
