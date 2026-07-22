
CREATE TABLE public.teacher_scenario_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engine TEXT NOT NULL CHECK (engine IN ('story_engine_slot','escape_room_slot','detective_mystery_slot','hidden_object_slot')),
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy','success')),
  cefr TEXT NOT NULL,
  vocab_hash TEXT NOT NULL,
  topic TEXT,
  scenario JSONB NOT NULL,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tso_lookup ON public.teacher_scenario_overrides (engine, hub, cefr, vocab_hash) WHERE active = true;
CREATE INDEX idx_tso_teacher ON public.teacher_scenario_overrides (teacher_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_scenario_overrides TO authenticated;
GRANT ALL ON public.teacher_scenario_overrides TO service_role;

ALTER TABLE public.teacher_scenario_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own overrides"
  ON public.teacher_scenario_overrides
  FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Admins full access overrides"
  ON public.teacher_scenario_overrides
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_tso_updated_at
  BEFORE UPDATE ON public.teacher_scenario_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
