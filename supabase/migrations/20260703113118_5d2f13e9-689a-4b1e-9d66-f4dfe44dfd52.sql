
ALTER TABLE public.teacher_scenario_ratings
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'visible',
  ADD COLUMN IF NOT EXISTS moderated_by uuid,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
  ADD COLUMN IF NOT EXISTS moderation_reason text;

ALTER TABLE public.teacher_scenario_ratings
  DROP CONSTRAINT IF EXISTS tsr_moderation_status_check;
ALTER TABLE public.teacher_scenario_ratings
  ADD CONSTRAINT tsr_moderation_status_check
  CHECK (moderation_status IN ('visible','flagged','hidden'));

CREATE INDEX IF NOT EXISTS idx_tsr_moderation_status
  ON public.teacher_scenario_ratings(moderation_status)
  WHERE moderation_status <> 'visible';

DROP POLICY IF EXISTS "Ratings public read" ON public.teacher_scenario_ratings;
CREATE POLICY "Ratings public read visible"
  ON public.teacher_scenario_ratings
  FOR SELECT
  USING (moderation_status = 'visible' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can moderate ratings"
  ON public.teacher_scenario_ratings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
