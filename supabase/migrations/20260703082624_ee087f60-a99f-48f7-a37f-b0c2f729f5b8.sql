
ALTER TABLE public.unit_progress_reports
  ADD COLUMN IF NOT EXISTS engine_runs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS engine_accuracy numeric NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.engine_scenario_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine text NOT NULL,
  hub text NOT NULL,
  cefr text NOT NULL DEFAULT 'A1',
  vocab_hash text NOT NULL,
  topic text,
  scenario jsonb NOT NULL,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_hit_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (engine, hub, cefr, vocab_hash)
);

CREATE INDEX IF NOT EXISTS engine_scenario_cache_lookup_idx
  ON public.engine_scenario_cache (engine, hub, cefr, vocab_hash);

GRANT SELECT ON public.engine_scenario_cache TO authenticated;
GRANT ALL ON public.engine_scenario_cache TO service_role;

ALTER TABLE public.engine_scenario_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "engine_scenario_cache_read" ON public.engine_scenario_cache;
CREATE POLICY "engine_scenario_cache_read"
  ON public.engine_scenario_cache FOR SELECT TO authenticated
  USING (true);
