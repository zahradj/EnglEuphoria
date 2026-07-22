CREATE TABLE IF NOT EXISTS public.qa_repair_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT,
  hub TEXT,
  cefr TEXT,
  attempt_index INTEGER NOT NULL DEFAULT 0,
  next_action TEXT NOT NULL,
  repair_codes TEXT[] NOT NULL DEFAULT '{}',
  blocking_engines TEXT[] NOT NULL DEFAULT '{}',
  overall_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.qa_repair_telemetry TO authenticated;
GRANT ALL ON public.qa_repair_telemetry TO service_role;

ALTER TABLE public.qa_repair_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert repair telemetry"
  ON public.qa_repair_telemetry FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read repair telemetry"
  ON public.qa_repair_telemetry FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_qa_repair_telemetry_created ON public.qa_repair_telemetry (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_repair_telemetry_lesson ON public.qa_repair_telemetry (lesson_id);