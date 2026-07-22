
-- Step 1: Add curriculum cycle columns to curriculum_lessons
ALTER TABLE curriculum_lessons
  ADD COLUMN IF NOT EXISTS cycle_type TEXT CHECK (cycle_type IN ('discovery', 'ladder', 'bridge')),
  ADD COLUMN IF NOT EXISTS phonics_focus TEXT,
  ADD COLUMN IF NOT EXISTS vocabulary_list JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS grammar_pattern TEXT,
  ADD COLUMN IF NOT EXISTS skills_focus TEXT[] DEFAULT '{}';

-- Step 2: Create student phonics progress table
CREATE TABLE IF NOT EXISTS student_phonics_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phoneme TEXT NOT NULL,
  mastered_at TIMESTAMPTZ,
  lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE SET NULL,
  mastery_level TEXT DEFAULT 'unseen' CHECK (mastery_level IN ('unseen','introduced','practiced','mastered')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, phoneme)
);

ALTER TABLE student_phonics_progress ENABLE ROW LEVEL SECURITY;

-- RLS: Students can read their own progress
CREATE POLICY "students_read_own_phonics" ON student_phonics_progress
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- RLS: Students can insert their own progress
CREATE POLICY "students_insert_own_phonics" ON student_phonics_progress
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

-- RLS: Students can update their own progress
CREATE POLICY "students_update_own_phonics" ON student_phonics_progress
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

-- Step 3: Create trigger to auto-update phonics progress when lesson is completed
CREATE OR REPLACE FUNCTION public.update_phonics_on_lesson_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phonics TEXT;
  v_lesson_id UUID;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get the phonics_focus from the lesson
    SELECT phonics_focus, id INTO v_phonics, v_lesson_id
    FROM curriculum_lessons
    WHERE id = NEW.lesson_id;

    IF v_phonics IS NOT NULL THEN
      INSERT INTO student_phonics_progress (student_id, phoneme, lesson_id, mastery_level, mastered_at)
      VALUES (NEW.student_id, v_phonics, v_lesson_id, 'practiced', now())
      ON CONFLICT (student_id, phoneme) DO UPDATE
      SET mastery_level = CASE
        WHEN student_phonics_progress.mastery_level = 'unseen' THEN 'introduced'
        WHEN student_phonics_progress.mastery_level = 'introduced' THEN 'practiced'
        WHEN student_phonics_progress.mastery_level = 'practiced' THEN 'mastered'
        ELSE student_phonics_progress.mastery_level
      END,
      mastered_at = CASE
        WHEN student_phonics_progress.mastery_level = 'practiced' THEN now()
        ELSE student_phonics_progress.mastered_at
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to interactive_lesson_progress
DROP TRIGGER IF EXISTS trg_phonics_on_lesson_complete ON interactive_lesson_progress;
CREATE TRIGGER trg_phonics_on_lesson_complete
  AFTER INSERT OR UPDATE ON interactive_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_phonics_on_lesson_complete();
