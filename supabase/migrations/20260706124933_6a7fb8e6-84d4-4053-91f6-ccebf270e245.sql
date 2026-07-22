CREATE TABLE IF NOT EXISTS public.qa_repair_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL,
  hub text,
  cefr text,
  lesson_kind text,
  pass_no integer NOT NULL DEFAULT 1,
  target text NOT NULL,
  issue_codes text[] NOT NULL DEFAULT '{}',
  verdict text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qa_repair_events_lesson_idx
  ON public.qa_repair_events (lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS qa_repair_events_created_idx
  ON public.qa_repair_events (created_at DESC);

GRANT SELECT ON public.qa_repair_events TO authenticated;
GRANT ALL ON public.qa_repair_events TO service_role;

ALTER TABLE public.qa_repair_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read qa_repair_events"
  ON public.qa_repair_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));