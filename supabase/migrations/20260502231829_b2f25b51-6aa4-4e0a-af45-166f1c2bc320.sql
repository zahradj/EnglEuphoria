DROP POLICY IF EXISTS "Students with bookings can view their classroom sessions" ON public.classroom_sessions;

CREATE POLICY "Students with bookings can view their classroom sessions"
ON public.classroom_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = auth.uid()
      AND (
        cb.id::text = classroom_sessions.room_id
        OR cb.classroom_id::text = classroom_sessions.room_id
        OR cb.session_id = classroom_sessions.id::text
      )
      AND cb.status <> ALL (ARRAY['cancelled'::text, 'refunded'::text])
  )
);