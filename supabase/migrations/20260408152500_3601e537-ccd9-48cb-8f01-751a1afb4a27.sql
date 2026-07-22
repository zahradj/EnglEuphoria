
-- Add mastery_check_passed to interactive_lesson_progress
ALTER TABLE public.interactive_lesson_progress
ADD COLUMN IF NOT EXISTS mastery_check_passed boolean NOT NULL DEFAULT false;

-- Add is_review flag to curriculum_lessons
ALTER TABLE public.curriculum_lessons
ADD COLUMN IF NOT EXISTS is_review boolean NOT NULL DEFAULT false;

-- Update the phonics trigger to gate mastered behind mastery_check_passed
CREATE OR REPLACE FUNCTION public.update_phonics_on_lesson_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phonics_focus text;
  v_cycle_type text;
  v_mastery_passed boolean;
  v_new_level text;
BEGIN
  -- Only run on completion
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get lesson metadata
  SELECT phonics_focus, cycle_type
  INTO v_phonics_focus, v_cycle_type
  FROM curriculum_lessons
  WHERE id = NEW.lesson_id;

  -- If no phonics focus, nothing to do
  IF v_phonics_focus IS NULL OR v_phonics_focus = '' THEN
    RETURN NEW;
  END IF;

  -- Determine mastery level based on cycle type
  IF v_cycle_type = 'discovery' THEN
    v_new_level := 'introduced';
  ELSIF v_cycle_type = 'ladder' THEN
    v_new_level := 'practiced';
  ELSIF v_cycle_type = 'bridge' THEN
    -- Only set mastered if mastery check passed
    v_mastery_passed := COALESCE(NEW.mastery_check_passed, false);
    IF v_mastery_passed THEN
      v_new_level := 'mastered';
    ELSE
      v_new_level := 'practiced';
    END IF;
  ELSE
    v_new_level := 'introduced';
  END IF;

  -- Upsert into student_phonics_progress
  INSERT INTO student_phonics_progress (student_id, phoneme, mastery_level, lesson_id, mastered_at)
  VALUES (
    NEW.student_id,
    v_phonics_focus,
    v_new_level,
    NEW.lesson_id,
    CASE WHEN v_new_level = 'mastered' THEN now() ELSE NULL END
  )
  ON CONFLICT (student_id, phoneme)
  DO UPDATE SET
    mastery_level = CASE
      -- Only advance forward, never go back
      WHEN CASE student_phonics_progress.mastery_level
        WHEN 'unseen' THEN 0
        WHEN 'introduced' THEN 1
        WHEN 'practiced' THEN 2
        WHEN 'mastered' THEN 3
        ELSE 0
      END < CASE EXCLUDED.mastery_level
        WHEN 'unseen' THEN 0
        WHEN 'introduced' THEN 1
        WHEN 'practiced' THEN 2
        WHEN 'mastered' THEN 3
        ELSE 0
      END
      THEN EXCLUDED.mastery_level
      ELSE student_phonics_progress.mastery_level
    END,
    lesson_id = EXCLUDED.lesson_id,
    mastered_at = CASE
      WHEN EXCLUDED.mastery_level = 'mastered' AND student_phonics_progress.mastered_at IS NULL
      THEN now()
      ELSE student_phonics_progress.mastered_at
    END;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on interactive_lesson_progress
DROP TRIGGER IF EXISTS trg_update_phonics_on_lesson_complete ON interactive_lesson_progress;
CREATE TRIGGER trg_update_phonics_on_lesson_complete
  AFTER INSERT OR UPDATE ON interactive_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_phonics_on_lesson_complete();
