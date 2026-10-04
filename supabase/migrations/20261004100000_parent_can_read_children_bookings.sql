-- Family accounts: a parent could see their children's progress but not their lessons.
-- class_bookings was only readable by the student, the teacher and admins, so the family
-- calendar / "upcoming lessons" came back empty for every parent.
--
-- Read-only, and only for children the parent is APPROVED for (is_approved_parent_of binds to
-- auth.uid() and requires approved_at). Parents still can't create, change or cancel bookings
-- through this policy.

DROP POLICY IF EXISTS "Parents can view their approved children's bookings" ON public.class_bookings;
CREATE POLICY "Parents can view their approved children's bookings"
  ON public.class_bookings FOR SELECT
  TO authenticated
  USING (public.is_approved_parent_of(student_id));
