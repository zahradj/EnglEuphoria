ALTER TABLE public.xp_events
  ADD COLUMN IF NOT EXISTS multiplier numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS multiplier_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS student_badges_unique_per_student
  ON public.student_badges (student_id, badge_name);