ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS lesson_state JSONB,
  ADD COLUMN IF NOT EXISTS governance_report JSONB,
  ADD COLUMN IF NOT EXISTS governance_status TEXT NOT NULL DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'curriculum_lessons_governance_status_check'
  ) THEN
    ALTER TABLE public.curriculum_lessons
      ADD CONSTRAINT curriculum_lessons_governance_status_check
      CHECK (governance_status IN ('pending','passed','failed','published'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_governance_status
  ON public.curriculum_lessons (governance_status);
