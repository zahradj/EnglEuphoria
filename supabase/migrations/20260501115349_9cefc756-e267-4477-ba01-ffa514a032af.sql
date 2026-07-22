-- 1. One-time dedupe: keep the OLDEST row for each (creator, hub, cefr, unit, lesson) tuple
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY created_by, target_system,
        ai_metadata->>'cefr_level',
        ai_metadata->>'unit_number',
        ai_metadata->>'lesson_number'
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.curriculum_lessons
  WHERE ai_metadata ? 'cefr_level'
    AND ai_metadata ? 'unit_number'
    AND ai_metadata ? 'lesson_number'
)
DELETE FROM public.curriculum_lessons cl
USING ranked r
WHERE cl.id = r.id AND r.rn > 1;

-- 2. Prevent future duplicates with a partial unique index on the metadata slot.
CREATE UNIQUE INDEX IF NOT EXISTS curriculum_lessons_unique_slot
ON public.curriculum_lessons (
  created_by,
  target_system,
  ((ai_metadata->>'cefr_level')),
  ((ai_metadata->>'unit_number')),
  ((ai_metadata->>'lesson_number'))
)
WHERE ai_metadata ? 'cefr_level'
  AND ai_metadata ? 'unit_number'
  AND ai_metadata ? 'lesson_number';