
-- Pillar A: placement results + user placement metadata
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS placement_method text,
  ADD COLUMN IF NOT EXISTS cefr_level text;

CREATE TABLE IF NOT EXISTS public.placement_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  method text NOT NULL CHECK (method IN ('beginner_bypass','lean_cat')),
  cefr_level text NOT NULL,
  hub text,
  ability_theta numeric,
  standard_error numeric,
  items_answered integer NOT NULL DEFAULT 0,
  trail jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.placement_results TO authenticated;
GRANT ALL ON public.placement_results TO service_role;
ALTER TABLE public.placement_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own placement" ON public.placement_results
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students insert own placement" ON public.placement_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE INDEX IF NOT EXISTS idx_placement_results_student ON public.placement_results(student_id, created_at DESC);

-- Pillar B: FSRS state + source on memory_items
ALTER TABLE public.memory_items
  ADD COLUMN IF NOT EXISTS fsrs_state jsonb,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'lesson';

CREATE INDEX IF NOT EXISTS idx_memory_items_due_student ON public.memory_items(student_id, next_due_at);

-- Pillar C: substitution_tables library
CREATE TABLE IF NOT EXISTS public.substitution_tables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  hub text NOT NULL,
  cefr text NOT NULL,
  grammar_point text NOT NULL,
  payload jsonb NOT NULL,
  used_in_lesson_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.substitution_tables TO authenticated;
GRANT ALL ON public.substitution_tables TO service_role;
ALTER TABLE public.substitution_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages substitution tables" ON public.substitution_tables
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX IF NOT EXISTS idx_substitution_tables_owner ON public.substitution_tables(owner_id, created_at DESC);

-- Pillar D: WTC anxiety signal type is text already, no enum change needed.
-- Add helpful index on learner_signals for adaptive consumer.
CREATE INDEX IF NOT EXISTS idx_learner_signals_student_type ON public.learner_signals(student_id, signal_type, created_at DESC);
