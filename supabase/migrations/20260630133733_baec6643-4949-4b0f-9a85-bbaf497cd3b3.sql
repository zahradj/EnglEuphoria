CREATE TABLE public.qa_judge_cache_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_name TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  hit BOOLEAN NOT NULL,
  hub TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.qa_judge_cache_events TO authenticated;
GRANT ALL ON public.qa_judge_cache_events TO service_role;
ALTER TABLE public.qa_judge_cache_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth can insert cache events" ON public.qa_judge_cache_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth can read cache events" ON public.qa_judge_cache_events FOR SELECT TO authenticated USING (true);
CREATE INDEX qa_judge_cache_events_created_idx ON public.qa_judge_cache_events (created_at DESC);