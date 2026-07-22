ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS slot_cefr_level    text
    GENERATED ALWAYS AS (ai_metadata->>'cefr_level')    STORED,
  ADD COLUMN IF NOT EXISTS slot_unit_number   text
    GENERATED ALWAYS AS (ai_metadata->>'unit_number')   STORED,
  ADD COLUMN IF NOT EXISTS slot_lesson_number text
    GENERATED ALWAYS AS (ai_metadata->>'lesson_number') STORED;

DROP INDEX IF EXISTS public.curriculum_lessons_unique_slot;

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_lessons_unique_slot
  ON public.curriculum_lessons
    (created_by, target_system, slot_cefr_level, slot_unit_number, slot_lesson_number)
  WHERE slot_cefr_level   IS NOT NULL
    AND slot_unit_number  IS NOT NULL
    AND slot_lesson_number IS NOT NULL;