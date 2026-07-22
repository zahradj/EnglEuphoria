-- Create classroom_timeline_events table to record key session events
CREATE TABLE public.classroom_timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_payload JSONB DEFAULT '{}'::jsonb,
  actor_id UUID,
  actor_role TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classroom_timeline_events_room_id ON public.classroom_timeline_events(room_id, occurred_at DESC);

ALTER TABLE public.classroom_timeline_events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated who has access to the matching classroom session can read
CREATE POLICY "timeline_events_select_authenticated"
ON public.classroom_timeline_events
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert their own events
CREATE POLICY "timeline_events_insert_authenticated"
ON public.classroom_timeline_events
FOR INSERT
TO authenticated
WITH CHECK (true);
