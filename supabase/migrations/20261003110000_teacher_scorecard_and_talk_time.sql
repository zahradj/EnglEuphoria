-- Teacher scorecard + student/teacher talking time.
--
-- ADDITIVE ONLY: a new table and two new functions. Nothing here touches existing KPI scores, bonuses,
-- bookings, sessions or the classroom runtime, so it is safe to apply at any time.
--
-- 1. classroom_talk_time: seconds each side spent speaking in a lesson. Only COUNTS are stored - no audio is
--    recorded or sent. Each browser measures its own microphone level locally and reports "N seconds of speech"
--    every ~15s through record_talk_time(); the server works out whether the caller is the teacher or the student.
-- 2. get_teacher_scorecard(): the handful of plain numbers a teacher sees (on time, lessons delivered, student
--    talking time, reports sent, student feedback). It is FAIR by design: platform crashes, student-caused
--    cancellations and student no-shows are excluded, and every figure carries its sample size `n` so the page can
--    say "building your baseline" instead of showing a misleading score.
--    A teacher can only read their own scorecard; admins can read anyone's.

-- ---------------------------------------------------------------------------
-- 1. Talking-time counters
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classroom_talk_time (
  room_id          text PRIMARY KEY,                -- = class_bookings.id (text), same key classroom_sessions.room_id uses
  teacher_id       uuid,
  student_id       uuid,
  teacher_seconds  integer NOT NULL DEFAULT 0 CHECK (teacher_seconds >= 0),
  student_seconds  integer NOT NULL DEFAULT 0 CHECK (student_seconds >= 0),
  teacher_last_at  timestamptz,
  student_last_at  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classroom_talk_time_teacher ON public.classroom_talk_time (teacher_id, created_at DESC);

ALTER TABLE public.classroom_talk_time ENABLE ROW LEVEL SECURITY;

-- Teachers read their own lessons' counters; admins read all. Nobody writes directly: record_talk_time() does.
DROP POLICY IF EXISTS "Teachers read own talk time" ON public.classroom_talk_time;
CREATE POLICY "Teachers read own talk time"
  ON public.classroom_talk_time FOR SELECT
  TO authenticated
  USING (teacher_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role));

REVOKE INSERT, UPDATE, DELETE ON public.classroom_talk_time FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_talk_time(p_room_id text, p_speaking_seconds integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  b record;
  v_is_teacher boolean;
  v_last timestamptz;
  v_inc integer;
BEGIN
  IF v_uid IS NULL OR p_room_id IS NULL THEN RETURN; END IF;

  -- Only the booked teacher or student of this lesson may report for it.
  SELECT id, teacher_id, student_id INTO b
  FROM public.class_bookings
  WHERE id::text = p_room_id AND (teacher_id = v_uid OR student_id = v_uid);
  IF NOT FOUND THEN RETURN; END IF;
  v_is_teacher := (b.teacher_id = v_uid);

  INSERT INTO public.classroom_talk_time (room_id, teacher_id, student_id)
  VALUES (p_room_id, b.teacher_id, b.student_id)
  ON CONFLICT (room_id) DO NOTHING;

  SELECT CASE WHEN v_is_teacher THEN teacher_last_at ELSE student_last_at END
    INTO v_last
  FROM public.classroom_talk_time WHERE room_id = p_room_id FOR UPDATE;

  -- A client can never claim more speech than real time has passed since its previous report (+1s tolerance),
  -- and never more than 30s in one call, so a buggy or tampered client can't inflate its own numbers.
  v_inc := LEAST(
    GREATEST(COALESCE(p_speaking_seconds, 0), 0),
    30,
    CEIL(EXTRACT(EPOCH FROM (now() - COALESCE(v_last, now() - interval '30 seconds'))))::integer + 1
  );
  IF v_inc <= 0 THEN RETURN; END IF;

  IF v_is_teacher THEN
    UPDATE public.classroom_talk_time
       SET teacher_seconds = teacher_seconds + v_inc, teacher_last_at = now(), updated_at = now()
     WHERE room_id = p_room_id;
  ELSE
    UPDATE public.classroom_talk_time
       SET student_seconds = student_seconds + v_inc, student_last_at = now(), updated_at = now()
     WHERE room_id = p_room_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.record_talk_time(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_talk_time(text, integer) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Scorecard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_scorecard(p_teacher_id uuid DEFAULT NULL, p_days integer DEFAULT 90)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t uuid := COALESCE(p_teacher_id, auth.uid());
  v_days integer := LEAST(GREATEST(COALESCE(p_days, 90), 7), 365);
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;
  IF v_t IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  WITH bk AS (
    SELECT b.id, b.status, b.cancelled_by, b.cancelled_at, b.scheduled_at, b.duration, b.technical_fault_party,
           cs.teacher_joined_at, cs.teacher_left_at, cs.teacher_last_ping_at, cs.fault_type
    FROM public.class_bookings b
    LEFT JOIN LATERAL (
      SELECT s.teacher_joined_at, s.teacher_left_at, s.teacher_last_ping_at, s.fault_type
      FROM public.classroom_sessions s
      WHERE s.room_id = b.id::text
      ORDER BY s.created_at DESC
      LIMIT 1
    ) cs ON true
    WHERE b.teacher_id = v_t
      AND b.scheduled_at >= now() - make_interval(days => v_days)
      AND b.scheduled_at < now()
  ),
  -- Lessons the teacher could fairly be held to: not student cancellations / absences, not platform or student faults.
  elig AS (
    SELECT * FROM bk
    WHERE status IN ('completed', 'cancelled', 'failed_technical', 'no_show')
      AND NOT (status = 'cancelled' AND COALESCE(cancelled_by, '') <> 'teacher')
      AND NOT (status = 'failed_technical' AND COALESCE(technical_fault_party, '') <> 'teacher')
      AND COALESCE(fault_type, '') NOT IN ('platform_crash', 'student_absent', 'student_tech_drop')
  ),
  fb AS (
    SELECT teacher_energy_rating, material_relevance_rating, feels_more_confident
    FROM public.post_class_feedback
    WHERE teacher_id = v_t AND created_at >= now() - make_interval(days => v_days)
  ),
  talk AS (
    SELECT t.room_id, b.scheduled_at, t.teacher_seconds, t.student_seconds
    FROM public.classroom_talk_time t
    JOIN public.class_bookings b ON b.id::text = t.room_id
    WHERE t.teacher_id = v_t
      AND b.scheduled_at >= now() - make_interval(days => v_days)
      AND (t.teacher_seconds + t.student_seconds) >= 120      -- ignore lessons with almost no speech captured
  )
  SELECT jsonb_build_object(
    'window_days', v_days,
    'on_time', jsonb_build_object(
      'n',   (SELECT count(*) FROM bk WHERE teacher_joined_at IS NOT NULL),
      'pct', (SELECT round(100.0 * count(*) FILTER (WHERE teacher_joined_at <= scheduled_at + interval '2 minutes')
                                  / NULLIF(count(*), 0))
              FROM bk WHERE teacher_joined_at IS NOT NULL)),
    'delivered', jsonb_build_object(
      'n',   (SELECT count(*) FROM elig),
      'pct', (SELECT round(100.0 * count(*) FILTER (WHERE status = 'completed') / NULLIF(count(*), 0)) FROM elig)),
    'full_length', jsonb_build_object(
      'n',   (SELECT count(*) FROM bk WHERE status = 'completed' AND teacher_joined_at IS NOT NULL
                AND COALESCE(teacher_left_at, teacher_last_ping_at) IS NOT NULL),
      'pct', (SELECT round(100.0 * count(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (COALESCE(teacher_left_at, teacher_last_ping_at) - teacher_joined_at)) / 60
                      >= 0.85 * COALESCE(duration, 30)) / NULLIF(count(*), 0))
              FROM bk WHERE status = 'completed' AND teacher_joined_at IS NOT NULL
                AND COALESCE(teacher_left_at, teacher_last_ping_at) IS NOT NULL)),
    'reports', jsonb_build_object(
      'n',   (SELECT count(*) FROM bk WHERE status = 'completed'),
      'pct', (SELECT round(100.0 * count(*) FILTER (WHERE EXISTS (
                SELECT 1 FROM public.lesson_feedback_submissions l
                WHERE l.lesson_id = bk.id
                  AND l.submitted_at <= bk.scheduled_at + make_interval(mins => COALESCE(bk.duration, 30)) + interval '24 hours'))
                / NULLIF(count(*), 0))
              FROM bk WHERE status = 'completed')),
    'cancellations', jsonb_build_object(
      'by_you',      (SELECT count(*) FROM bk WHERE status = 'cancelled' AND cancelled_by = 'teacher'),
      'short_notice',(SELECT count(*) FROM bk WHERE status = 'cancelled' AND cancelled_by = 'teacher'
                        AND scheduled_at - cancelled_at < interval '48 hours')),
    'feedback', jsonb_build_object(
      'n',            (SELECT count(*) FROM fb),
      'energy',       (SELECT round(avg(teacher_energy_rating)::numeric, 1) FROM fb),
      'relevance',    (SELECT round(avg(material_relevance_rating)::numeric, 1) FROM fb),
      'confident_pct',(SELECT round(100.0 * count(*) FILTER (WHERE feels_more_confident) / NULLIF(count(feels_more_confident), 0)) FROM fb)),
    'talk', jsonb_build_object(
      'n',           (SELECT count(*) FROM talk),
      'student_pct', (SELECT round(100.0 * sum(student_seconds) / NULLIF(sum(student_seconds + teacher_seconds), 0)) FROM talk),
      'recent',      COALESCE((SELECT jsonb_agg(jsonb_build_object(
                          'date', scheduled_at, 'student_seconds', student_seconds, 'teacher_seconds', teacher_seconds)
                        ORDER BY scheduled_at)
                      FROM (SELECT * FROM talk ORDER BY scheduled_at DESC LIMIT 10) r), '[]'::jsonb)),
    'excluded', jsonb_build_object(
      'platform_faults', (SELECT count(*) FROM bk WHERE fault_type = 'platform_crash'),
      'student_side',    (SELECT count(*) FROM bk WHERE (status = 'cancelled' AND COALESCE(cancelled_by, '') <> 'teacher')
                            OR status = 'student_absent'))
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_teacher_scorecard(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_teacher_scorecard(uuid, integer) TO authenticated, service_role;
