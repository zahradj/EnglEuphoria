
-- =====================================================================
-- SECURITY HARDENING – Critical findings from security review
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. REALTIME: stop broadcasting sensitive financial rows
-- ---------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['lesson_payments','student_credits','learning_currency'] LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 2. CERTIFICATES: remove public-read, expose only verification function
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can verify certificates" ON public.certificates;

CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE (
  certificate_number text,
  verification_code text,
  cefr_level text,
  score_achieved numeric,
  hours_completed numeric,
  skills_demonstrated text[],
  issue_date timestamptz,
  student_name text,
  teacher_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.certificate_number,
    c.verification_code,
    c.cefr_level,
    c.score_achieved,
    c.hours_completed,
    c.skills_demonstrated,
    c.issue_date,
    s.full_name AS student_name,
    t.full_name AS teacher_name
  FROM public.certificates c
  LEFT JOIN public.users s ON s.id = c.student_id
  LEFT JOIN public.users t ON t.id = c.teacher_id
  WHERE c.verification_code = _code
     OR c.certificate_number = _code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. LEADERBOARD: require authentication
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view leaderboard entries" ON public.leaderboard_entries;

CREATE POLICY "Authenticated users can view leaderboard"
  ON public.leaderboard_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------
-- 4. NOTIFICATION LOGS: restrict inserts to admins only
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can insert notification logs" ON public.notification_logs;

CREATE POLICY "Only admins can insert notification logs"
  ON public.notification_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------------------------------------------------------
-- 5. TEACHER AVAILABILITY: require sign-in to browse slots
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view available teacher slots" ON public.teacher_availability;
DROP POLICY IF EXISTS "secure_availability_student" ON public.teacher_availability;
DROP POLICY IF EXISTS "Students can view available slots only" ON public.teacher_availability;
DROP POLICY IF EXISTS "Authenticated users can view available slots" ON public.teacher_availability;

CREATE POLICY "Authenticated users can view available slots"
  ON public.teacher_availability
  FOR SELECT
  TO authenticated
  USING (
    is_available = true
    AND is_booked = false
    AND start_time > now()
  );
