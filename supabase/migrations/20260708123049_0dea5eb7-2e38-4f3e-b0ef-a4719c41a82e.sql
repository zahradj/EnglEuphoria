
ALTER TABLE public.teacher_performance_metrics
  ADD COLUMN IF NOT EXISTS active_students INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retention_rate NUMERIC NOT NULL DEFAULT 0;

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
      COUNT(*) AS total_bookings,
      COUNT(DISTINCT cb.student_id) FILTER (WHERE cb.status = 'completed') AS active_students
    FROM public.class_bookings cb
    WHERE cb.scheduled_at >= now() - interval '30 days'
      AND cb.teacher_id IS NOT NULL
    GROUP BY cb.teacher_id
  ),
  retention AS (
    -- % of students in last 90d who booked ≥2 lessons with this teacher
    SELECT
      teacher_id,
      COUNT(*) FILTER (WHERE lesson_count >= 2)::numeric
        / NULLIF(COUNT(*), 0) * 100 AS retention_rate
    FROM (
      SELECT cb.teacher_id, cb.student_id, COUNT(*) AS lesson_count
      FROM public.class_bookings cb
      WHERE cb.scheduled_at >= now() - interval '90 days'
        AND cb.status = 'completed'
        AND cb.teacher_id IS NOT NULL
        AND cb.student_id IS NOT NULL
      GROUP BY cb.teacher_id, cb.student_id
    ) s
    GROUP BY teacher_id
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
  ),
  curriculum AS (
    -- % of assigned curriculum lessons completed in last 60d
    SELECT
      cb.teacher_id,
      COUNT(*) FILTER (WHERE lc.completed_at IS NOT NULL)::numeric
        / NULLIF(COUNT(*), 0) * 100 AS coverage
    FROM public.class_bookings cb
    LEFT JOIN public.lesson_completions lc
      ON lc.booking_id = cb.id
    WHERE cb.scheduled_at >= now() - interval '60 days'
      AND cb.status = 'completed'
      AND cb.teacher_id IS NOT NULL
    GROUP BY cb.teacher_id
  )
  INSERT INTO public.teacher_performance_metrics AS tpm (
    teacher_id, attendance_rate, lesson_quality_score,
    student_progress_impact, response_time_score,
    feedback_completion_rate, curriculum_coverage,
    active_students, retention_rate,
    overall_kpi_score, lessons_taught, updated_at
  )
  SELECT
    a.teacher_id,
    LEAST(100, COALESCE(a.completed::numeric / NULLIF(a.total_bookings,0) * 100, 0)) AS attendance_rate,
    LEAST(100, COALESCE(r.avg_rating * 20, 70)) AS lesson_quality_score,
    LEAST(100, COALESCE(sp.progress_score, 70)) AS student_progress_impact,
    COALESCE(tpm.response_time_score, 75) AS response_time_score,
    LEAST(100, COALESCE(f.completion_rate, 60)) AS feedback_completion_rate,
    LEAST(100, COALESCE(c.coverage, tpm.curriculum_coverage, 75)) AS curriculum_coverage,
    COALESCE(a.active_students, 0) AS active_students,
    LEAST(100, COALESCE(ret.retention_rate, 0)) AS retention_rate,
    LEAST(100,
      (LEAST(100, COALESCE(r.avg_rating * 20, 70)) * 0.25) +
      (LEAST(100, COALESCE(a.completed::numeric / NULLIF(a.total_bookings,0) * 100, 0)) * 0.15) +
      (LEAST(100, COALESCE(sp.progress_score, 70)) * 0.15) +
      (LEAST(100, COALESCE(f.completion_rate, 60)) * 0.10) +
      (LEAST(100, COALESCE(c.coverage, tpm.curriculum_coverage, 75)) * 0.10) +
      (LEAST(100, COALESCE(ret.retention_rate, 0)) * 0.15) +
      (COALESCE(tpm.response_time_score, 75) * 0.10)
    ) AS overall_kpi_score,
    COALESCE(a.completed, 0) AS lessons_taught,
    now()
  FROM activity a
  LEFT JOIN reviews r ON r.teacher_id = a.teacher_id
  LEFT JOIN feedback f ON f.teacher_id = a.teacher_id
  LEFT JOIN speech sp ON sp.teacher_id = a.teacher_id
  LEFT JOIN retention ret ON ret.teacher_id = a.teacher_id
  LEFT JOIN curriculum c ON c.teacher_id = a.teacher_id
  LEFT JOIN public.teacher_performance_metrics tpm ON tpm.teacher_id = a.teacher_id
  ON CONFLICT (teacher_id) DO UPDATE SET
    attendance_rate = EXCLUDED.attendance_rate,
    lesson_quality_score = EXCLUDED.lesson_quality_score,
    student_progress_impact = EXCLUDED.student_progress_impact,
    feedback_completion_rate = EXCLUDED.feedback_completion_rate,
    curriculum_coverage = EXCLUDED.curriculum_coverage,
    active_students = EXCLUDED.active_students,
    retention_rate = EXCLUDED.retention_rate,
    overall_kpi_score = EXCLUDED.overall_kpi_score,
    lessons_taught = EXCLUDED.lessons_taught,
    updated_at = now();

  GET DIAGNOSTICS updated_count = ROW_COUNT;

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
