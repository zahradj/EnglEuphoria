-- Classroom waiting room: the student waits until the teacher presses "Start classroom".
-- One row per booking = "this class has been started". Rows are never deleted by the app,
-- so a reload (teacher or student) doesn't send anyone back to the waiting room.

CREATE TABLE IF NOT EXISTS public.classroom_lobby (
  booking_id uuid PRIMARY KEY REFERENCES public.class_bookings(id) ON DELETE CASCADE,
  started_by uuid NOT NULL DEFAULT auth.uid(),
  started_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classroom_lobby ENABLE ROW LEVEL SECURITY;

-- The teacher and the student of the booking (and admins) can see whether it has started.
DROP POLICY IF EXISTS "Participants can read the lobby" ON public.classroom_lobby;
CREATE POLICY "Participants can read the lobby"
  ON public.classroom_lobby FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_bookings b
      WHERE b.id = classroom_lobby.booking_id
        AND (b.teacher_id = (SELECT auth.uid()) OR b.student_id = (SELECT auth.uid()))
    )
    OR public.has_role((SELECT auth.uid()), 'admin')
  );

-- Only the booking's teacher (or an admin) can start the class.
DROP POLICY IF EXISTS "Teacher can start the class" ON public.classroom_lobby;
CREATE POLICY "Teacher can start the class"
  ON public.classroom_lobby FOR INSERT TO authenticated
  WITH CHECK (
    started_by = (SELECT auth.uid())
    AND (
      EXISTS (
        SELECT 1 FROM public.class_bookings b
        WHERE b.id = classroom_lobby.booking_id AND b.teacher_id = (SELECT auth.uid())
      )
      OR public.has_role((SELECT auth.uid()), 'admin')
    )
  );

GRANT SELECT, INSERT ON public.classroom_lobby TO authenticated;

-- Lets the student's waiting screen open the instant the teacher presses Start.
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_lobby;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
