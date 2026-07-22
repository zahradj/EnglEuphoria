
-- Grammar test gate
CREATE TABLE IF NOT EXISTS public.teacher_grammar_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  email TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.teacher_grammar_tests TO anon, authenticated;
GRANT ALL ON public.teacher_grammar_tests TO service_role;

ALTER TABLE public.teacher_grammar_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert their grammar test attempt"
  ON public.teacher_grammar_tests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "applicants can read by email match"
  ON public.teacher_grammar_tests FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "admins manage grammar tests"
  ON public.teacher_grammar_tests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Extend teacher_applications
ALTER TABLE public.teacher_applications
  ADD COLUMN IF NOT EXISTS grammar_test_status TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS grammar_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS interview_invite_token TEXT,
  ADD COLUMN IF NOT EXISTS interview_invite_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_applications_invite_token
  ON public.teacher_applications(interview_invite_token)
  WHERE interview_invite_token IS NOT NULL;

-- Extend interviews for hub-specific interview classroom
ALTER TABLE public.interviews
  ADD COLUMN IF NOT EXISTS hub TEXT,
  ADD COLUMN IF NOT EXISTS classroom_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS invite_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_interviews_invite_token
  ON public.interviews(invite_token)
  WHERE invite_token IS NOT NULL;
