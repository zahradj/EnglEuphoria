-- Replace the partial unique index on curriculum_lessons slot columns with a real
-- (non-partial) UNIQUE CONSTRAINT so PostgREST upserts can target it via on_conflict.

-- 1. Drop old partial unique index (cannot be used as ON CONFLICT target via PostgREST)
DROP INDEX IF EXISTS public.curriculum_lessons_unique_slot;

-- 2. Make sure the generated slot columns exist (idempotent)
ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS slot_cefr_level    text
    GENERATED ALWAYS AS (ai_metadata->>'cefr_level')    STORED,
  ADD COLUMN IF NOT EXISTS slot_unit_number   text
    GENERATED ALWAYS AS (ai_metadata->>'unit_number')   STORED,
  ADD COLUMN IF NOT EXISTS slot_lesson_number text
    GENERATED ALWAYS AS (ai_metadata->>'lesson_number') STORED;

-- 3. Pre-emptively dedupe any existing complete blueprint slots (safety net)
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY created_by, target_system, slot_cefr_level, slot_unit_number, slot_lesson_number
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.curriculum_lessons
  WHERE created_by IS NOT NULL
    AND slot_cefr_level    IS NOT NULL
    AND slot_unit_number   IS NOT NULL
    AND slot_lesson_number IS NOT NULL
)
DELETE FROM public.curriculum_lessons cl
USING ranked r
WHERE cl.id = r.id AND r.rn > 1;

-- 4. Add a real UNIQUE CONSTRAINT (non-partial). NULLs are allowed in any column,
--    so non-blueprint lessons (which have NULL slot_* values) can still coexist —
--    Postgres treats NULLs as distinct in unique constraints by default.
ALTER TABLE public.curriculum_lessons
  ADD CONSTRAINT curriculum_lessons_unique_slot
  UNIQUE (created_by, target_system, slot_cefr_level, slot_unit_number, slot_lesson_number);
