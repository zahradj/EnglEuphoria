
CREATE OR REPLACE FUNCTION public.backfill_trial_placement_on_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cefr text;
BEGIN
  -- Only act when ended_at newly set for a trial session with a student
  IF NEW.ended_at IS NULL THEN RETURN NEW; END IF;
  IF OLD.ended_at IS NOT NULL THEN RETURN NEW; END IF;
  IF COALESCE(NEW.lesson_type, 'standard') <> 'trial' THEN RETURN NEW; END IF;
  IF NEW.student_id IS NULL THEN RETURN NEW; END IF;

  -- Best-effort CEFR from the student's profile
  SELECT COALESCE(final_cefr_level, cefr_level)
    INTO v_cefr
  FROM public.student_profiles
  WHERE user_id = NEW.student_id
  LIMIT 1;

  -- Unique partial index on (student_id) WHERE method='trial_lesson' dedupes
  INSERT INTO public.placement_results (student_id, method, cefr_level)
  VALUES (NEW.student_id, 'trial_lesson', v_cefr)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block session end on a safety-net write
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_backfill_trial_placement_on_end ON public.classroom_sessions;
CREATE TRIGGER trg_backfill_trial_placement_on_end
AFTER UPDATE OF ended_at ON public.classroom_sessions
FOR EACH ROW
EXECUTE FUNCTION public.backfill_trial_placement_on_end();
