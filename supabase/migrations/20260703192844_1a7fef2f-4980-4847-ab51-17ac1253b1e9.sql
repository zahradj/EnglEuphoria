
CREATE OR REPLACE FUNCTION public.enforce_trial_min_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_base timestamptz;
  v_elapsed_seconds numeric;
  v_min_seconds constant numeric := 25 * 60;
BEGIN
  -- Only guard the transition NULL -> non-NULL on ended_at
  IF NEW.ended_at IS NULL THEN RETURN NEW; END IF;
  IF OLD.ended_at IS NOT NULL THEN RETURN NEW; END IF;

  -- Trials only
  IF COALESCE(NEW.lesson_type, 'standard') <> 'trial' THEN RETURN NEW; END IF;

  -- No-show is always allowed to end early
  IF NEW.student_joined_at IS NULL THEN RETURN NEW; END IF;

  -- Compute elapsed from the earliest available anchor
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

DROP TRIGGER IF EXISTS trg_enforce_trial_min_duration ON public.classroom_sessions;
CREATE TRIGGER trg_enforce_trial_min_duration
BEFORE UPDATE OF ended_at ON public.classroom_sessions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_trial_min_duration();
