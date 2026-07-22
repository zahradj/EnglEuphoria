
CREATE TABLE public.teacher_scenario_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID NOT NULL REFERENCES public.teacher_scenario_overrides(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, rater_id)
);
CREATE INDEX idx_tsr_scenario ON public.teacher_scenario_ratings(scenario_id);

GRANT SELECT ON public.teacher_scenario_ratings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.teacher_scenario_ratings TO authenticated;
GRANT ALL ON public.teacher_scenario_ratings TO service_role;

ALTER TABLE public.teacher_scenario_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings public read" ON public.teacher_scenario_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_scenario_overrides o
      WHERE o.id = scenario_id AND o.is_public = true
    )
  );
CREATE POLICY "Rater can insert own" ON public.teacher_scenario_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Rater can update own" ON public.teacher_scenario_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = rater_id) WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Rater can delete own" ON public.teacher_scenario_ratings
  FOR DELETE TO authenticated USING (auth.uid() = rater_id);
