
CREATE TABLE public.student_engine_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  unit_id text NOT NULL,
  engine text NOT NULL,
  accuracy numeric NOT NULL,
  duration_ms integer NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  hub text,
  cefr text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_engine_runs_user_created
  ON public.student_engine_runs (user_id, created_at DESC);
CREATE INDEX idx_student_engine_runs_unit
  ON public.student_engine_runs (user_id, unit_id);

GRANT SELECT, INSERT ON public.student_engine_runs TO authenticated;
GRANT ALL ON public.student_engine_runs TO service_role;

ALTER TABLE public.student_engine_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own engine runs"
  ON public.student_engine_runs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students read own engine runs"
  ON public.student_engine_runs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON public.student_engine_runs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
