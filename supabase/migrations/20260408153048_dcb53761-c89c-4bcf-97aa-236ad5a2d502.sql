
-- Fix the trigger to use correct column name
CREATE OR REPLACE FUNCTION public.update_vocabulary_on_lesson_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_vocab_list JSONB;
  v_unit_id UUID;
  v_word TEXT;
BEGIN
  IF NEW.lesson_status <> 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT vocabulary_list, unit_id
  INTO v_vocab_list, v_unit_id
  FROM curriculum_lessons
  WHERE id = NEW.lesson_id;

  IF v_vocab_list IS NULL OR jsonb_typeof(v_vocab_list) <> 'array' THEN
    RETURN NEW;
  END IF;

  FOR v_word IN SELECT jsonb_array_elements_text(v_vocab_list) LOOP
    INSERT INTO student_vocabulary_progress (student_id, word, unit_id)
    VALUES (NEW.student_id, v_word, v_unit_id)
    ON CONFLICT (student_id, word)
    DO UPDATE SET
      times_reviewed = student_vocabulary_progress.times_reviewed + 1,
      last_reviewed_at = now();
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vocab_on_lesson_complete
  AFTER UPDATE ON public.interactive_lesson_progress
  FOR EACH ROW
  WHEN (NEW.lesson_status = 'completed' AND OLD.lesson_status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION public.update_vocabulary_on_lesson_complete();
