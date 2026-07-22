
-- speech_attempts: every sentence a student tries to say
CREATE TABLE public.speech_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID,
  slide_id TEXT,
  hub TEXT NOT NULL DEFAULT 'academy',
  target_sentence TEXT NOT NULL,
  transcript TEXT,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  accuracy_score INTEGER CHECK (accuracy_score BETWEEN 0 AND 100),
  fluency_score INTEGER CHECK (fluency_score BETWEEN 0 AND 100),
  pronunciation_score INTEGER CHECK (pronunciation_score BETWEEN 0 AND 100),
  tier TEXT NOT NULL CHECK (tier IN ('gold','soft','revert')),
  feedback TEXT,
  word_breakdown JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_speech_attempts_user ON public.speech_attempts(user_id, created_at DESC);
CREATE INDEX idx_speech_attempts_lesson ON public.speech_attempts(lesson_id);

ALTER TABLE public.speech_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own speech attempts"
  ON public.speech_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students insert own speech attempts"
  ON public.speech_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers and admins view all speech attempts"
  ON public.speech_attempts FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
  );

-- mistake_repository: low-tier attempts and other errors for spaced review
CREATE TABLE public.mistake_repository (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mistake_type TEXT NOT NULL,
  target_content TEXT NOT NULL,
  attempted_content TEXT,
  context TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  source_lesson_id UUID,
  source_slide_id TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  attempts_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mistake_repo_user_unresolved
  ON public.mistake_repository(user_id, resolved, created_at DESC);

ALTER TABLE public.mistake_repository ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own mistakes"
  ON public.mistake_repository FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students insert own mistakes"
  ON public.mistake_repository FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students update own mistakes"
  ON public.mistake_repository FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins view all mistakes"
  ON public.mistake_repository FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER set_mistake_repo_updated_at
  BEFORE UPDATE ON public.mistake_repository
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
