-- The teacher schedule grid already joins public.users to show a booked
-- student's real name/email (useAvailabilityManager.ts), but the only
-- existing SELECT policies on users are "auth.uid() = id" (self) and
-- admin-only — so that join has always silently returned zero rows for a
-- teacher looking up their student, and the UI falls back to "Booked".
-- This adds the missing case: a teacher may view the profile of a student
-- who currently has (or has ever had) a lesson slot with them.
CREATE POLICY "Teachers can view profiles of their booked students"
ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = users.id AND cb.teacher_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.teacher_availability ta
    WHERE ta.student_id = users.id AND ta.teacher_id = auth.uid()
  )
);
