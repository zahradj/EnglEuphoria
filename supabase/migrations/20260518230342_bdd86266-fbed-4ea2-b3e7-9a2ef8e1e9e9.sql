CREATE TABLE IF NOT EXISTS public.memory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy','success')),
  cefr TEXT,
  skill_kind TEXT NOT NULL CHECK (skill_kind IN ('vocab','grammar','phonics','pronunciation','speaking_pattern','communication_function')),
  skill_key TEXT NOT NULL,
  memory_strength NUMERIC NOT NULL DEFAULT 0,
  active_mastery NUMERIC NOT NULL DEFAULT 0,
  passive_mastery NUMERIC NOT NULL DEFAULT 0,
  speaking_retention NUMERIC NOT NULL DEFAULT 0,
  pronunciation_retention NUMERIC NOT NULL DEFAULT 0,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  interval_days NUMERIC NOT NULL DEFAULT 1,
  repetitions INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  next_due_at TIMESTAMPTZ,
  predicted_decay_at TIMESTAMPTZ,
  forgetting_risk NUMERIC NOT NULL DEFAULT 0,
  recall_level INTEGER NOT NULL DEFAULT 1 CHECK (recall_level BETWEEN 1 AND 5),
  spiral_stage INTEGER NOT NULL DEFAULT 0,
  last_context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, hub, skill_kind, skill_key)
);
CREATE INDEX IF NOT EXISTS idx_memory_items_student_hub ON public.memory_items(student_id, hub);
CREATE INDEX IF NOT EXISTS idx_memory_items_due ON public.memory_items(next_due_at);
CREATE INDEX IF NOT EXISTS idx_memory_items_skill ON public.memory_items(student_id, skill_key);
ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memory_items student read own" ON public.memory_items FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "memory_items teacher read via bookings" ON public.memory_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.class_bookings b WHERE b.student_id = memory_items.student_id AND b.teacher_id = auth.uid()));
CREATE POLICY "memory_items admin all" ON public.memory_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "memory_items student write own" ON public.memory_items FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "memory_items student update own" ON public.memory_items FOR UPDATE USING (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.memory_review_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT NOT NULL,
  memory_item_id UUID REFERENCES public.memory_items(id) ON DELETE CASCADE,
  skill_kind TEXT NOT NULL,
  skill_key TEXT NOT NULL,
  mode TEXT NOT NULL,
  recall_level INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  latency_ms INTEGER,
  lesson_id TEXT,
  injection_slot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memory_review_history_student ON public.memory_review_history(student_id, created_at DESC);
ALTER TABLE public.memory_review_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_history student read own" ON public.memory_review_history FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "review_history teacher read via bookings" ON public.memory_review_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.class_bookings b WHERE b.student_id = memory_review_history.student_id AND b.teacher_id = auth.uid()));
CREATE POLICY "review_history admin all" ON public.memory_review_history FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "review_history student insert own" ON public.memory_review_history FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.memory_heatmap_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, hub)
);
ALTER TABLE public.memory_heatmap_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "heatmap student read own" ON public.memory_heatmap_snapshots FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "heatmap teacher read via bookings" ON public.memory_heatmap_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.class_bookings b WHERE b.student_id = memory_heatmap_snapshots.student_id AND b.teacher_id = auth.uid()));
CREATE POLICY "heatmap admin all" ON public.memory_heatmap_snapshots FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "heatmap student write own" ON public.memory_heatmap_snapshots FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "heatmap student update own" ON public.memory_heatmap_snapshots FOR UPDATE USING (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.spiral_progression_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT NOT NULL,
  skill_key TEXT NOT NULL,
  current_stage INTEGER NOT NULL DEFAULT 0,
  context_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_escalation JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, hub, skill_key)
);
ALTER TABLE public.spiral_progression_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spiral student read own" ON public.spiral_progression_state FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "spiral teacher read via bookings" ON public.spiral_progression_state FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.class_bookings b WHERE b.student_id = spiral_progression_state.student_id AND b.teacher_id = auth.uid()));
CREATE POLICY "spiral admin all" ON public.spiral_progression_state FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "spiral student write own" ON public.spiral_progression_state FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "spiral student update own" ON public.spiral_progression_state FOR UPDATE USING (auth.uid() = student_id);

CREATE TRIGGER memory_items_set_updated_at BEFORE UPDATE ON public.memory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER memory_heatmap_set_updated_at BEFORE UPDATE ON public.memory_heatmap_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER spiral_set_updated_at BEFORE UPDATE ON public.spiral_progression_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
