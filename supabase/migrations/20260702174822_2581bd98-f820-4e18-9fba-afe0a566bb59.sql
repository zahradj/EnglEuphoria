
CREATE TABLE public.unit_progress_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  unit_title TEXT,
  hub TEXT NOT NULL,
  cefr TEXT NOT NULL,
  student_name TEXT,
  accuracy NUMERIC(4,3) NOT NULL,
  quiz_accuracy NUMERIC(4,3),
  total_attempts INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_duration_ms BIGINT NOT NULL DEFAULT 0,
  lessons_completed INTEGER,
  lessons_total INTEGER,
  mastered_words TEXT[] NOT NULL DEFAULT '{}',
  weak_words TEXT[] NOT NULL DEFAULT '{}',
  stars SMALLINT NOT NULL,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX unit_progress_reports_user_idx ON public.unit_progress_reports (user_id, created_at DESC);
CREATE INDEX unit_progress_reports_share_idx ON public.unit_progress_reports (share_token);

GRANT SELECT, INSERT ON public.unit_progress_reports TO authenticated;
GRANT ALL ON public.unit_progress_reports TO service_role;

ALTER TABLE public.unit_progress_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert their own reports"
  ON public.unit_progress_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students view their own reports"
  ON public.unit_progress_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Public share-token lookup (anonymous, single-row via token filter)
GRANT SELECT ON public.unit_progress_reports TO anon;
CREATE POLICY "Anyone with the share token can view"
  ON public.unit_progress_reports FOR SELECT TO anon
  USING (share_token IS NOT NULL);
