
-- Extend curriculum_lessons with QA columns
ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS qa_report JSONB,
  ADD COLUMN IF NOT EXISTS qa_verdict TEXT,
  ADD COLUMN IF NOT EXISTS qa_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qa_content_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_qa_verdict
  ON public.curriculum_lessons(qa_verdict);

-- AI judge cache
CREATE TABLE IF NOT EXISTS public.qa_judge_cache (
  content_hash TEXT NOT NULL,
  judge_name TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (content_hash, judge_name)
);
ALTER TABLE public.qa_judge_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and creators read qa cache"
  ON public.qa_judge_cache FOR SELECT
  USING (public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'content_creator'));

CREATE POLICY "Admins write qa cache"
  ON public.qa_judge_cache FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
