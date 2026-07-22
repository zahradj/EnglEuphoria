
CREATE TABLE IF NOT EXISTS public.wtc_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  session_id uuid,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  wtc_score numeric(4,3) NOT NULL,
  anxiety_level text NOT NULL CHECK (anxiety_level IN ('low','medium','high')),
  volume text,
  gaze_ratio numeric(4,3),
  posture text,
  gesture_rate numeric(4,3),
  triggered_action text
);

GRANT SELECT, INSERT ON public.wtc_signals TO authenticated;
GRANT ALL ON public.wtc_signals TO service_role;

ALTER TABLE public.wtc_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own wtc"
  ON public.wtc_signals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students read own wtc"
  ON public.wtc_signals
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers and admins read all wtc"
  ON public.wtc_signals
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'teacher'::app_role)
  );

CREATE INDEX IF NOT EXISTS wtc_signals_student_recorded_idx
  ON public.wtc_signals (student_id, recorded_at DESC);

ALTER TABLE public.student_mastery
  ADD COLUMN IF NOT EXISTS srs_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS srs_strategy text NOT NULL DEFAULT 'flat'
    CHECK (srs_strategy IN ('flat','expanding','fsrs'));
