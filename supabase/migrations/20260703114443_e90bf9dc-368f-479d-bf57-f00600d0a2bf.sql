
-- Track KPI history for sparklines + at-risk streak detection
CREATE TABLE IF NOT EXISTS public.teacher_kpi_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_kpi_score NUMERIC NOT NULL DEFAULT 0,
  lesson_quality_score NUMERIC NOT NULL DEFAULT 0,
  attendance_rate NUMERIC NOT NULL DEFAULT 0,
  student_progress_impact NUMERIC NOT NULL DEFAULT 0,
  response_time_score NUMERIC NOT NULL DEFAULT 0,
  feedback_completion_rate NUMERIC NOT NULL DEFAULT 0,
  curriculum_coverage NUMERIC NOT NULL DEFAULT 0,
  lessons_taught INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, snapshot_date)
);

GRANT SELECT ON public.teacher_kpi_snapshots TO authenticated;
GRANT ALL ON public.teacher_kpi_snapshots TO service_role;

ALTER TABLE public.teacher_kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers view own snapshots" ON public.teacher_kpi_snapshots
  FOR SELECT TO authenticated
  USING (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages snapshots" ON public.teacher_kpi_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_teacher_date
  ON public.teacher_kpi_snapshots(teacher_id, snapshot_date DESC);

-- At-risk alert tracker (idempotent weekly signals)
CREATE TABLE IF NOT EXISTS public.teacher_kpi_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  week_start DATE NOT NULL,
  kpi_score NUMERIC NOT NULL,
  consecutive_weeks INTEGER NOT NULL DEFAULT 1,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, week_start)
);

GRANT SELECT ON public.teacher_kpi_alerts TO authenticated;
GRANT ALL ON public.teacher_kpi_alerts TO service_role;

ALTER TABLE public.teacher_kpi_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all alerts" ON public.teacher_kpi_alerts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = teacher_id);

CREATE POLICY "Service role manages alerts" ON public.teacher_kpi_alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Recompute function: aggregates last 30d activity per teacher
CREATE OR REPLACE FUNCTION public.recompute_teacher_kpis()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  WITH activity AS (
    SELECT
      cb.teacher_id,
      COUNT(*) FILTER (WHERE cb.status = 'completed') AS completed,
      COUNT(*) FILTER (WHERE cb.status IN ('cancelled','no_show')) AS missed,
      COUNT(*) AS total_bookings
    FROM public.class_bookings cb
    WHERE cb.scheduled_at >= now() - interval '30 days'
      AND cb.teacher_id IS NOT NULL
    GROUP BY cb.teacher_id
  ),
  reviews AS (
    SELECT teacher_id, AVG(rating) AS avg_rating, COUNT(*) AS n
    FROM public.teacher_reviews
    WHERE created_at >= now() - interval '90 days'
    GROUP BY teacher_id
  ),
  feedback AS (
    SELECT teacher_id,
      COUNT(*) FILTER (WHERE feedback_text IS NOT NULL AND length(feedback_text) > 10)::numeric
        / NULLIF(COUNT(*),0) * 100 AS completion_rate
    FROM public.lesson_feedback_submissions
    WHERE created_at >= now() - interval '30 days'
    GROUP BY teacher_id
  ),
  speech AS (
    SELECT s.teacher_id, AVG(s.overall_score) AS progress_score
    FROM public.speech_attempts s
    WHERE s.created_at >= now() - interval '30 days'
      AND s.teacher_id IS NOT NULL
    GROUP BY s.teacher_id
  )
  INSERT INTO public.teacher_performance_metrics AS tpm (
    teacher_id, attendance_rate, lesson_quality_score,
    student_progress_impact, response_time_score,
    feedback_completion_rate, curriculum_coverage, overall_kpi_score,
    lessons_taught, updated_at
  )
  SELECT
    a.teacher_id,
    LEAST(100, COALESCE(a.completed::numeric / NULLIF(a.total_bookings,0) * 100, 0)) AS attendance_rate,
    LEAST(100, COALESCE(r.avg_rating * 20, 70)) AS lesson_quality_score,
    LEAST(100, COALESCE(sp.progress_score, 70)) AS student_progress_impact,
    COALESCE(tpm.response_time_score, 75) AS response_time_score,
    LEAST(100, COALESCE(f.completion_rate, 60)) AS feedback_completion_rate,
    COALESCE(tpm.curriculum_coverage, 75) AS curriculum_coverage,
    LEAST(100,
      (LEAST(100, COALESCE(a.completed::numeric / NULLIF(a.total_bookings,0) * 100, 0)) * 0.20) +
      (LEAST(100, COALESCE(r.avg_rating * 20, 70)) * 0.30) +
      (LEAST(100, COALESCE(sp.progress_score, 70)) * 0.25) +
      (LEAST(100, COALESCE(f.completion_rate, 60)) * 0.15) +
      (COALESCE(tpm.curriculum_coverage, 75) * 0.10)
    ) AS overall_kpi_score,
    COALESCE(a.completed, 0) AS lessons_taught,
    now()
  FROM activity a
  LEFT JOIN reviews r ON r.teacher_id = a.teacher_id
  LEFT JOIN feedback f ON f.teacher_id = a.teacher_id
  LEFT JOIN speech sp ON sp.teacher_id = a.teacher_id
  LEFT JOIN public.teacher_performance_metrics tpm ON tpm.teacher_id = a.teacher_id
  ON CONFLICT (teacher_id) DO UPDATE SET
    attendance_rate = EXCLUDED.attendance_rate,
    lesson_quality_score = EXCLUDED.lesson_quality_score,
    student_progress_impact = EXCLUDED.student_progress_impact,
    feedback_completion_rate = EXCLUDED.feedback_completion_rate,
    overall_kpi_score = EXCLUDED.overall_kpi_score,
    lessons_taught = EXCLUDED.lessons_taught,
    updated_at = now();

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Snapshot for sparklines
  INSERT INTO public.teacher_kpi_snapshots (
    teacher_id, snapshot_date, overall_kpi_score, lesson_quality_score,
    attendance_rate, student_progress_impact, response_time_score,
    feedback_completion_rate, curriculum_coverage, lessons_taught
  )
  SELECT teacher_id, CURRENT_DATE, overall_kpi_score, lesson_quality_score,
    attendance_rate, student_progress_impact, response_time_score,
    feedback_completion_rate, curriculum_coverage, lessons_taught
  FROM public.teacher_performance_metrics
  ON CONFLICT (teacher_id, snapshot_date) DO UPDATE SET
    overall_kpi_score = EXCLUDED.overall_kpi_score,
    lesson_quality_score = EXCLUDED.lesson_quality_score,
    attendance_rate = EXCLUDED.attendance_rate,
    student_progress_impact = EXCLUDED.student_progress_impact,
    feedback_completion_rate = EXCLUDED.feedback_completion_rate;

  RETURN updated_count;
END;
$$;

-- Unique constraint (if not already present) for upsert
DO $$ BEGIN
  ALTER TABLE public.teacher_performance_metrics ADD CONSTRAINT teacher_performance_metrics_teacher_id_key UNIQUE (teacher_id);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- Nightly recompute
SELECT cron.unschedule('teacher-kpi-recompute-nightly')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'teacher-kpi-recompute-nightly');

SELECT cron.schedule(
  'teacher-kpi-recompute-nightly',
  '0 2 * * *',
  $$SELECT public.recompute_teacher_kpis();$$
);

-- Weekly at-risk detection (Mondays 08:00 UTC)
SELECT cron.unschedule('teacher-kpi-atrisk-weekly')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'teacher-kpi-atrisk-weekly');

CREATE OR REPLACE FUNCTION public.flag_atrisk_teachers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flagged INTEGER := 0;
BEGIN
  WITH low AS (
    SELECT teacher_id, overall_kpi_score
    FROM public.teacher_performance_metrics
    WHERE overall_kpi_score < 55
  ),
  prev AS (
    SELECT teacher_id, consecutive_weeks
    FROM public.teacher_kpi_alerts
    WHERE week_start = date_trunc('week', CURRENT_DATE - interval '7 days')::date
  )
  INSERT INTO public.teacher_kpi_alerts (teacher_id, week_start, kpi_score, consecutive_weeks)
  SELECT l.teacher_id, date_trunc('week', CURRENT_DATE)::date, l.overall_kpi_score,
    COALESCE(p.consecutive_weeks, 0) + 1
  FROM low l
  LEFT JOIN prev p ON p.teacher_id = l.teacher_id
  ON CONFLICT (teacher_id, week_start) DO UPDATE SET
    kpi_score = EXCLUDED.kpi_score,
    consecutive_weeks = EXCLUDED.consecutive_weeks;

  GET DIAGNOSTICS flagged = ROW_COUNT;
  RETURN flagged;
END;
$$;

SELECT cron.schedule(
  'teacher-kpi-atrisk-weekly',
  '0 8 * * MON',
  $$SELECT public.flag_atrisk_teachers();$$
);
