
-- ============================================================
-- GAME & HOMEWORK COHERENCE ENGINE
-- ============================================================

-- 1) HOMEWORK PACKS
CREATE TABLE public.homework_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id UUID,
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy','success')),
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','in_progress','completed','expired')),
  coherence_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_homework_packs_student ON public.homework_packs(student_id, hub);
CREATE INDEX idx_homework_packs_lesson ON public.homework_packs(lesson_id);

-- 2) HOMEWORK ATTEMPTS
CREATE TABLE public.homework_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  pack_id UUID NOT NULL REFERENCES public.homework_packs(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  reinforcement_target_id TEXT,
  transcript TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  time_spent_ms INTEGER NOT NULL DEFAULT 0,
  bravery_bonus BOOLEAN NOT NULL DEFAULT false,
  speech_attempt_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_homework_attempts_student ON public.homework_attempts(student_id);
CREATE INDEX idx_homework_attempts_pack ON public.homework_attempts(pack_id);

-- 3) GAME PACKS
CREATE TABLE public.game_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id UUID,
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy','success')),
  rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  educational_value_avg NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_game_packs_student ON public.game_packs(student_id, hub);
CREATE INDEX idx_game_packs_lesson ON public.game_packs(lesson_id);

-- 4) GAME ATTEMPTS
CREATE TABLE public.game_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  pack_id UUID NOT NULL REFERENCES public.game_packs(id) ON DELETE CASCADE,
  round_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  reinforcement_target_id TEXT,
  score NUMERIC NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_game_attempts_student ON public.game_attempts(student_id);
CREATE INDEX idx_game_attempts_pack ON public.game_attempts(pack_id);

-- 5) HOMEWORK HISTORY (dedup ledger)
CREATE TABLE public.homework_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy','success')),
  task_template_key TEXT NOT NULL,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  use_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, task_template_key)
);

-- 6) GAME HISTORY (dedup ledger)
CREATE TABLE public.game_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy','success')),
  game_type TEXT NOT NULL,
  scenario_key TEXT NOT NULL,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  use_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, game_type, scenario_key)
);

-- 7) COHERENCE SIGNALS (longitudinal)
CREATE TABLE public.coherence_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy','success')),
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  homework_completion_rate NUMERIC NOT NULL DEFAULT 0,
  game_engagement NUMERIC NOT NULL DEFAULT 0,
  reinforcement_coverage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, hub)
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.homework_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coherence_signals ENABLE ROW LEVEL SECURITY;

-- Helper note: assumes has_role(uuid, app_role) and class_bookings(student_id, teacher_id) exist.

-- HOMEWORK PACKS
CREATE POLICY "students own homework_packs"
ON public.homework_packs FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teachers view homework_packs"
ON public.homework_packs FOR SELECT
USING (EXISTS (SELECT 1 FROM public.class_bookings cb WHERE cb.student_id = homework_packs.student_id AND cb.teacher_id = auth.uid()));
CREATE POLICY "admins manage homework_packs"
ON public.homework_packs FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- HOMEWORK ATTEMPTS
CREATE POLICY "students own homework_attempts"
ON public.homework_attempts FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teachers view homework_attempts"
ON public.homework_attempts FOR SELECT
USING (EXISTS (SELECT 1 FROM public.class_bookings cb WHERE cb.student_id = homework_attempts.student_id AND cb.teacher_id = auth.uid()));
CREATE POLICY "admins manage homework_attempts"
ON public.homework_attempts FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GAME PACKS
CREATE POLICY "students own game_packs"
ON public.game_packs FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teachers view game_packs"
ON public.game_packs FOR SELECT
USING (EXISTS (SELECT 1 FROM public.class_bookings cb WHERE cb.student_id = game_packs.student_id AND cb.teacher_id = auth.uid()));
CREATE POLICY "admins manage game_packs"
ON public.game_packs FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GAME ATTEMPTS
CREATE POLICY "students own game_attempts"
ON public.game_attempts FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teachers view game_attempts"
ON public.game_attempts FOR SELECT
USING (EXISTS (SELECT 1 FROM public.class_bookings cb WHERE cb.student_id = game_attempts.student_id AND cb.teacher_id = auth.uid()));
CREATE POLICY "admins manage game_attempts"
ON public.game_attempts FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- HOMEWORK HISTORY
CREATE POLICY "students own homework_history"
ON public.homework_history FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
CREATE POLICY "admins manage homework_history"
ON public.homework_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GAME HISTORY
CREATE POLICY "students own game_history"
ON public.game_history FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
CREATE POLICY "admins manage game_history"
ON public.game_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- COHERENCE SIGNALS
CREATE POLICY "students own coherence_signals"
ON public.coherence_signals FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teachers view coherence_signals"
ON public.coherence_signals FOR SELECT
USING (EXISTS (SELECT 1 FROM public.class_bookings cb WHERE cb.student_id = coherence_signals.student_id AND cb.teacher_id = auth.uid()));
CREATE POLICY "admins manage coherence_signals"
ON public.coherence_signals FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER trg_homework_packs_updated BEFORE UPDATE ON public.homework_packs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_homework_attempts_updated BEFORE UPDATE ON public.homework_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_game_packs_updated BEFORE UPDATE ON public.game_packs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_game_attempts_updated BEFORE UPDATE ON public.game_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_homework_history_updated BEFORE UPDATE ON public.homework_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_game_history_updated BEFORE UPDATE ON public.game_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_coherence_signals_updated BEFORE UPDATE ON public.coherence_signals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
