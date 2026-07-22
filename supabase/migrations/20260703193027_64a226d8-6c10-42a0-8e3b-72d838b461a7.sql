
CREATE OR REPLACE FUNCTION public.enforce_trial_min_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_base timestamptz;
  v_elapsed_seconds numeric;
  v_min_seconds constant numeric := 25 * 60;
BEGIN
  IF NEW.ended_at IS NULL THEN RETURN NEW; END IF;
  IF OLD.ended_at IS NOT NULL THEN RETURN NEW; END IF;
  IF COALESCE(NEW.lesson_type, 'standard') <> 'trial' THEN RETURN NEW; END IF;
  IF NEW.student_joined_at IS NULL THEN RETURN NEW; END IF;

  v_base := COALESCE(NEW.started_at, NEW.teacher_joined_at, NEW.student_joined_at, NEW.scheduled_at);
  IF v_base IS NULL THEN RETURN NEW; END IF;

  v_elapsed_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - v_base));
  IF v_elapsed_seconds < v_min_seconds THEN
    RAISE EXCEPTION 'Trial lessons require a minimum of 25 minutes of core teaching time (elapsed: % seconds).', floor(v_elapsed_seconds)
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;
