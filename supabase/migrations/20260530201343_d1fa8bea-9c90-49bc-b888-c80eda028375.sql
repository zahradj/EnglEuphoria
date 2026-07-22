
-- Migration A: extend classroom_sessions with telemetry
ALTER TABLE public.classroom_sessions
  ADD COLUMN IF NOT EXISTS student_id uuid,
  ADD COLUMN IF NOT EXISTS lesson_type text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS booking_id uuid,
  ADD COLUMN IF NOT EXISTS teacher_joined_at timestamptz,
  ADD COLUMN IF NOT EXISTS student_joined_at timestamptz,
  ADD COLUMN IF NOT EXISTS teacher_last_ping_at timestamptz,
  ADD COLUMN IF NOT EXISTS student_last_ping_at timestamptz,
  ADD COLUMN IF NOT EXISTS teacher_left_at timestamptz,
  ADD COLUMN IF NOT EXISTS student_left_at timestamptz,
  ADD COLUMN IF NOT EXISTS disconnect_reason text,
  ADD COLUMN IF NOT EXISTS fault_type text,
  ADD COLUMN IF NOT EXISTS ai_verdict text,
  ADD COLUMN IF NOT EXISTS ai_verdict_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration_minutes integer;

-- Migration B: heartbeat audit table
CREATE TABLE IF NOT EXISTS public.classroom_session_heartbeats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher','student')),
  pinged_at timestamptz NOT NULL DEFAULT now(),
  connection_quality text
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_session_role_time
  ON public.classroom_session_heartbeats (session_id, role, pinged_at DESC);

GRANT SELECT, INSERT ON public.classroom_session_heartbeats TO authenticated;
GRANT ALL ON public.classroom_session_heartbeats TO service_role;

ALTER TABLE public.classroom_session_heartbeats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert own heartbeats"
  ON public.classroom_session_heartbeats
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users read own heartbeats"
  ON public.classroom_session_heartbeats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Migration C: 5-tier resolution ledger
CREATE TABLE IF NOT EXISTS public.classroom_resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE,
  booking_id uuid,
  teacher_id uuid NOT NULL,
  student_id uuid,
  resolution_type text NOT NULL CHECK (resolution_type IN ('teacher_absent','student_absent','teacher_tech_fault','student_tech_fault','platform_fault')),
  teacher_pay_pct numeric NOT NULL DEFAULT 0,
  teacher_pay_amount numeric NOT NULL DEFAULT 0,
  credit_refunded boolean NOT NULL DEFAULT false,
  final_status text NOT NULL,
  resolved_by uuid NOT NULL,
  resolved_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

GRANT SELECT ON public.classroom_resolutions TO authenticated;
GRANT ALL ON public.classroom_resolutions TO service_role;

ALTER TABLE public.classroom_resolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage resolutions"
  ON public.classroom_resolutions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "teachers read own resolutions"
  ON public.classroom_resolutions
  FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());

-- RPC: server_now
CREATE OR REPLACE FUNCTION public.server_now()
RETURNS timestamptz
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT now() $$;

GRANT EXECUTE ON FUNCTION public.server_now() TO authenticated;

-- RPC: tick_heartbeat
CREATE OR REPLACE FUNCTION public.tick_heartbeat(p_session_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.classroom_sessions%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO v_session FROM public.classroom_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;

  IF p_role = 'teacher' THEN
    IF v_session.teacher_id <> v_uid THEN RAISE EXCEPTION 'not teacher of this session'; END IF;
    UPDATE public.classroom_sessions
       SET teacher_last_ping_at = now(),
           teacher_joined_at = COALESCE(teacher_joined_at, now())
     WHERE id = p_session_id;
  ELSIF p_role = 'student' THEN
    IF v_session.student_id IS NOT NULL AND v_session.student_id <> v_uid THEN
      RAISE EXCEPTION 'not student of this session';
    END IF;
    UPDATE public.classroom_sessions
       SET student_last_ping_at = now(),
           student_joined_at = COALESCE(student_joined_at, now()),
           student_id = COALESCE(student_id, v_uid)
     WHERE id = p_session_id;
  ELSE
    RAISE EXCEPTION 'invalid role';
  END IF;

  INSERT INTO public.classroom_session_heartbeats (session_id, user_id, role)
  VALUES (p_session_id, v_uid, p_role);
END $$;

GRANT EXECUTE ON FUNCTION public.tick_heartbeat(uuid, text) TO authenticated;

-- RPC: mark_student_absent
CREATE OR REPLACE FUNCTION public.mark_student_absent(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.classroom_sessions%ROWTYPE;
  v_safe_at timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO v_session FROM public.classroom_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;
  IF v_session.teacher_id <> v_uid THEN RAISE EXCEPTION 'only teacher can mark'; END IF;
  IF v_session.student_joined_at IS NOT NULL THEN
    RAISE EXCEPTION 'student already joined';
  END IF;

  IF v_session.lesson_type = 'trial' THEN
    v_safe_at := COALESCE(v_session.started_at, v_session.teacher_joined_at, v_session.created_at) + interval '10 minutes';
  ELSE
    v_safe_at := COALESCE(v_session.scheduled_at, v_session.started_at, v_session.created_at)
                 + (COALESCE(v_session.duration_minutes, 60) || ' minutes')::interval;
  END IF;

  IF now() < v_safe_at THEN
    RAISE EXCEPTION 'safe-to-leave window not reached yet';
  END IF;

  UPDATE public.classroom_sessions
     SET disconnect_reason = 'student_absent',
         fault_type = 'student_absent',
         ai_verdict = 'Teacher waited full window; student never joined',
         ai_verdict_at = now(),
         session_status = 'incomplete',
         teacher_left_at = now(),
         ended_at = now()
   WHERE id = p_session_id;

  RETURN jsonb_build_object('marked', true, 'safe_at', v_safe_at);
END $$;

GRANT EXECUTE ON FUNCTION public.mark_student_absent(uuid) TO authenticated;

-- RPC: apply_classroom_resolution
CREATE OR REPLACE FUNCTION public.apply_classroom_resolution(
  p_session_id uuid,
  p_resolution_type text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.classroom_sessions%ROWTYPE;
  v_booking public.class_bookings%ROWTYPE;
  v_pct numeric := 0;
  v_refund boolean := false;
  v_final text;
  v_hourly numeric := 0;
  v_pay numeric := 0;
  v_duration_h numeric;
  v_res_id uuid;
  v_teacher_name text;
BEGIN
  IF NOT public.has_role(v_uid, 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;

  SELECT * INTO v_session FROM public.classroom_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;

  IF v_session.booking_id IS NOT NULL THEN
    SELECT * INTO v_booking FROM public.class_bookings WHERE id = v_session.booking_id;
  END IF;

  CASE p_resolution_type
    WHEN 'teacher_absent'     THEN v_pct := 0;   v_refund := true;  v_final := 'teacher_no_show';
    WHEN 'student_absent'     THEN v_pct := 100; v_refund := false; v_final := 'student_no_show';
    WHEN 'teacher_tech_fault' THEN v_pct := 0;   v_refund := true;  v_final := 'redo';
    WHEN 'student_tech_fault' THEN v_pct := 50;  v_refund := false; v_final := 'incomplete';
    WHEN 'platform_fault'     THEN v_pct := 100; v_refund := true;  v_final := 'system_error_redo';
    ELSE RAISE EXCEPTION 'invalid resolution_type';
  END CASE;

  -- Compute teacher pay
  v_duration_h := COALESCE(v_session.duration_minutes, COALESCE(v_booking.duration, 60))::numeric / 60.0;
  SELECT hourly_rate_eur, COALESCE(full_name, email)
    INTO v_hourly, v_teacher_name
    FROM public.teacher_profiles tp
    LEFT JOIN public.users u ON u.id = tp.user_id
   WHERE tp.user_id = v_session.teacher_id
   LIMIT 1;
  v_hourly := COALESCE(v_hourly, 0);
  v_pay := round(v_hourly * v_duration_h * v_pct / 100.0, 2);

  INSERT INTO public.classroom_resolutions
    (session_id, booking_id, teacher_id, student_id, resolution_type, teacher_pay_pct, teacher_pay_amount, credit_refunded, final_status, resolved_by, notes)
  VALUES
    (p_session_id, v_session.booking_id, v_session.teacher_id, v_session.student_id, p_resolution_type, v_pct, v_pay, v_refund, v_final, v_uid, p_notes)
  RETURNING id INTO v_res_id;

  -- Update booking status
  IF v_session.booking_id IS NOT NULL THEN
    UPDATE public.class_bookings SET status = v_final, updated_at = now() WHERE id = v_session.booking_id;
  END IF;

  -- Refund credit if needed
  IF v_refund AND v_session.student_id IS NOT NULL THEN
    UPDATE public.student_credits
       SET used_credits = greatest(COALESCE(used_credits,0) - 1, 0),
           updated_at = now()
     WHERE student_id = v_session.student_id;
  END IF;

  -- Payroll adjustment if teacher gets paid
  IF v_pay > 0 THEN
    INSERT INTO public.payroll_records
      (teacher_id, teacher_name, month, year, total_lessons, total_hours, hourly_rate, base_pay, bonus_amount, total_earned, payment_status, notes)
    VALUES
      (v_session.teacher_id, COALESCE(v_teacher_name, 'Teacher'),
       EXTRACT(MONTH FROM now())::int, EXTRACT(YEAR FROM now())::int,
       1, v_duration_h, v_hourly, v_pay, 0, v_pay, 'pending',
       'Resolution ' || p_resolution_type || ' for session ' || p_session_id::text);
  END IF;

  -- Mark session resolved
  UPDATE public.classroom_sessions
     SET session_status = 'resolved',
         disconnect_reason = COALESCE(disconnect_reason, p_resolution_type),
         fault_type = COALESCE(fault_type, p_resolution_type),
         updated_at = now()
   WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'resolution_id', v_res_id,
    'teacher_pay_eur', v_pay,
    'teacher_pay_pct', v_pct,
    'refunded', v_refund,
    'final_status', v_final
  );
END $$;

GRANT EXECUTE ON FUNCTION public.apply_classroom_resolution(uuid, text, text) TO authenticated;
