CREATE TABLE public.architect_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_ref text NOT NULL,
  hub text NOT NULL,
  cefr text NOT NULL,
  student_id uuid,
  status text NOT NULL,
  passes int NOT NULL DEFAULT 1,
  tool_calls jsonb NOT NULL DEFAULT '[]'::jsonb,
  critic_findings jsonb,
  overrides jsonb,
  rationale text,
  model text,
  duration_ms int,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.architect_runs TO authenticated;
GRANT ALL ON public.architect_runs TO service_role;

ALTER TABLE public.architect_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and content_creators can read architect runs"
  ON public.architect_runs
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'content_creator'::app_role)
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can insert their own architect runs"
  ON public.architect_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE INDEX architect_runs_lesson_ref_idx ON public.architect_runs (lesson_ref);
CREATE INDEX architect_runs_created_at_idx ON public.architect_runs (created_at DESC);