-- Placement-test redesign (docs/placement-test-research.md), step 0: keep the evidence a school needs to check
-- that placement is accurate.
--  * summary:         how the adaptive test ended (ability, precision, borderline?, not-sure / fast-answer counts,
--                     and the writing / speaking samples) - for teachers and for later validation.
--  * provisional:     every placement is provisional until a teacher confirms it in the first lessons.
--  * teacher_verdict: the headline accuracy number. After lessons 1-3 the teacher records agree / up one / down one;
--                     the share of 'up_one' / 'down_one' is the teacher-override rate.
-- Additive and nullable: nothing existing is touched.

ALTER TABLE public.placement_results
  ADD COLUMN IF NOT EXISTS summary jsonb,
  ADD COLUMN IF NOT EXISTS provisional boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS teacher_verdict text,
  ADD COLUMN IF NOT EXISTS teacher_level text,
  ADD COLUMN IF NOT EXISTS verdict_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verdict_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'placement_results_teacher_verdict_check'
  ) THEN
    ALTER TABLE public.placement_results
      ADD CONSTRAINT placement_results_teacher_verdict_check
      CHECK (teacher_verdict IS NULL OR teacher_verdict IN ('agree', 'up_one', 'down_one', 'up_two_plus', 'down_two_plus'));
  END IF;
END $$;
