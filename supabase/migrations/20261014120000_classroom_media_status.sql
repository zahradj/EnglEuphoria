-- Live class: each side's camera / connection status travels with the heartbeat, so the other side is told
-- ("the student's camera isn't working: another app is using it", "weak connection") instead of staring at an empty tile.
--
-- * classroom_sessions.student_media_status / teacher_media_status: latest status string ('ok' | 'good' | 'fair' | 'poor' | 'cam:<reason>').
--   The peer already listens to this row over realtime (it carries the last-ping times), so the status arrives with no new channel.
-- * classroom_session_heartbeats.connection_quality (already there, was always empty) now records it for each ping: a history for support.
-- * tick_heartbeat gets an optional third argument. The app falls back to the 2-argument call until this is installed.

ALTER TABLE public.classroom_sessions
  ADD COLUMN IF NOT EXISTS student_media_status text,
  ADD COLUMN IF NOT EXISTS teacher_media_status text;

DROP FUNCTION IF EXISTS public.tick_heartbeat(uuid, text);

CREATE OR REPLACE FUNCTION public.tick_heartbeat(p_session_id uuid, p_role text, p_media_status text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.classroom_sessions%ROWTYPE;
  v_status text := left(NULLIF(btrim(COALESCE(p_media_status, '')), ''), 40);
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO v_session FROM public.classroom_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;

  IF p_role = 'teacher' THEN
    IF v_session.teacher_id <> v_uid THEN RAISE EXCEPTION 'not teacher of this session'; END IF;
    UPDATE public.classroom_sessions
       SET teacher_last_ping_at = now(),
           teacher_joined_at = COALESCE(teacher_joined_at, now()),
           teacher_media_status = COALESCE(v_status, teacher_media_status)
     WHERE id = p_session_id;
  ELSIF p_role = 'student' THEN
    IF v_session.student_id IS NOT NULL AND v_session.student_id <> v_uid THEN
      RAISE EXCEPTION 'not student of this session';
    END IF;
    UPDATE public.classroom_sessions
       SET student_last_ping_at = now(),
           student_joined_at = COALESCE(student_joined_at, now()),
           student_id = COALESCE(student_id, v_uid),
           student_media_status = COALESCE(v_status, student_media_status)
     WHERE id = p_session_id;
  ELSE
    RAISE EXCEPTION 'invalid role';
  END IF;

  INSERT INTO public.classroom_session_heartbeats (session_id, user_id, role, connection_quality)
  VALUES (p_session_id, v_uid, p_role, v_status);
END $$;

REVOKE ALL ON FUNCTION public.tick_heartbeat(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tick_heartbeat(uuid, text, text) TO authenticated;
