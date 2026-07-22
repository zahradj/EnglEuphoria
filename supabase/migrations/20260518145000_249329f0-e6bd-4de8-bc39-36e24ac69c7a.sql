
-- Orchestrator telemetry
CREATE TABLE public.orchestrator_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT,
  student_id UUID,
  state_hash TEXT NOT NULL,
  prompt_chain_hash TEXT NOT NULL,
  qa_verdict TEXT NOT NULL,
  stage_timings JSONB NOT NULL DEFAULT '[]'::jsonb,
  conflicts JSONB NOT NULL DEFAULT '[]'::jsonb,
  orchestrator_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orchestrator_runs_lesson ON public.orchestrator_runs (lesson_id, created_at DESC);
CREATE INDEX idx_orchestrator_runs_student ON public.orchestrator_runs (student_id, created_at DESC);

ALTER TABLE public.orchestrator_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and content creators view orchestrator runs"
ON public.orchestrator_runs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));

-- Curriculum feedback signals (post-lesson)
CREATE TABLE public.curriculum_feedback_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id TEXT,
  signal_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_curriculum_feedback_student ON public.curriculum_feedback_signals (student_id, created_at DESC);

ALTER TABLE public.curriculum_feedback_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own feedback signals"
ON public.curriculum_feedback_signals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students view own feedback signals"
ON public.curriculum_feedback_signals FOR SELECT TO authenticated
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
