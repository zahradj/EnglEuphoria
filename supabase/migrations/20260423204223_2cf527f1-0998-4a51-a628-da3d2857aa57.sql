DROP POLICY IF EXISTS "Room participants can view session data" ON public.classroom_sessions;

CREATE POLICY "Room participants can view session data"
ON public.classroom_sessions
FOR SELECT
USING (
  (auth.role() = 'authenticated'::text)
  AND (
    (teacher_id = auth.uid())
    OR is_user_admin()
    OR EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.room_id = classroom_sessions.room_id
        AND lessons.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM class_bookings cb
      WHERE (cb.id::text = classroom_sessions.room_id
             OR cb.classroom_id::text = classroom_sessions.room_id)
        AND cb.student_id = auth.uid()
    )
  )
);