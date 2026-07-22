-- Fix search_path for new functions (security hardening)

CREATE OR REPLACE FUNCTION check_future_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scheduled_at < NOW() THEN
    RAISE EXCEPTION 'Cannot book lessons in the past';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp SECURITY DEFINER;

CREATE OR REPLACE FUNCTION release_cancelled_lesson_slot()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE teacher_availability
    SET is_booked = false,
        lesson_id = NULL
    WHERE lesson_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp SECURITY DEFINER;