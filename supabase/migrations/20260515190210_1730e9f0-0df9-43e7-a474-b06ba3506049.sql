
-- 1) classroom_states.status (waiting | live | ended)
ALTER TABLE public.classroom_states
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'waiting'
  CHECK (status IN ('waiting','live','ended'));

ALTER TABLE public.classroom_states
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

-- 2) live_class_activities — AI-generated mini-games pushed during a live session
CREATE TABLE IF NOT EXISTS public.live_class_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  classroom_session_id text NOT NULL,
  booking_id uuid,
  teacher_id uuid NOT NULL,
  prompt text NOT NULL,
  format text NOT NULL CHECK (format IN ('mcq','roleplay','fill_blank')),
  payload jsonb NOT NULL,
  dismissed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_live_class_activities_session
  ON public.live_class_activities (classroom_session_id, created_at DESC);

ALTER TABLE public.live_class_activities ENABLE ROW LEVEL SECURITY;

-- Teacher of the booking can insert
CREATE POLICY "Teacher can insert live activities"
  ON public.live_class_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

-- Teacher and booked student of the session can read
CREATE POLICY "Participants can view live activities"
  ON public.live_class_activities
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = teacher_id
    OR EXISTS (
      SELECT 1 FROM public.class_bookings b
      WHERE b.id = live_class_activities.booking_id
        AND b.student_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Teacher can dismiss / update their own activities
CREATE POLICY "Teacher can update own live activities"
  ON public.live_class_activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Enable realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_activities;

-- 3) purge_stale_data — daily janitor (called by pg_cron, scheduled separately)
CREATE OR REPLACE FUNCTION public.purge_stale_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.post_class_feedback           WHERE created_at < now() - interval '90 days';
  DELETE FROM public.lesson_feedback_submissions   WHERE created_at < now() - interval '90 days';
  DELETE FROM public.classroom_timeline_events     WHERE created_at < now() - interval '90 days';
  DELETE FROM public.classroom_sessions            WHERE created_at < now() - interval '90 days';
  DELETE FROM public.classroom_states              WHERE updated_at < now() - interval '90 days';
  DELETE FROM public.live_class_activities         WHERE created_at < now() - interval '90 days';
  DELETE FROM public.system_errors
    WHERE status = 'resolved' AND created_at < now() - interval '90 days';
END;
$$;

REVOKE ALL ON FUNCTION public.purge_stale_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_stale_data() TO postgres, service_role;
