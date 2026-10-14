-- Teacher checklists for the Academy: one row per teacher, student and checklist. kind 'lesson' = the checklist after a lesson (ref = lesson id),
-- kind 'unit' = the final assessment of a unit/Season (ref = season id). `data` holds the marks (src/curriculum/academy/checklist.ts).
-- The app keeps the checklists in the teacher's browser until this table exists (fails soft). NOT applied automatically: run it when the owner approves.

CREATE TABLE IF NOT EXISTS public.academy_teacher_checks (
  teacher_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind       text        NOT NULL CHECK (kind IN ('lesson', 'unit')),
  ref        text        NOT NULL,
  data       jsonb       NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (teacher_id, student_id, kind, ref)
);

ALTER TABLE public.academy_teacher_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers manage their own checklists" ON public.academy_teacher_checks;
CREATE POLICY "Teachers manage their own checklists" ON public.academy_teacher_checks
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Admins can read all of them.
DROP POLICY IF EXISTS "Admins read checklists" ON public.academy_teacher_checks;
CREATE POLICY "Admins read checklists" ON public.academy_teacher_checks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- A student can read the checklists written about them (so they see "nailed it" and what to practise).
DROP POLICY IF EXISTS "Students read their own checklists" ON public.academy_teacher_checks;
CREATE POLICY "Students read their own checklists" ON public.academy_teacher_checks
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- A parent can read their approved children's checklists.
DROP POLICY IF EXISTS "Parents read their children's checklists" ON public.academy_teacher_checks;
CREATE POLICY "Parents read their children's checklists" ON public.academy_teacher_checks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_parent_relationships r
    WHERE r.parent_id = auth.uid() AND r.student_id = academy_teacher_checks.student_id
  ));

CREATE INDEX IF NOT EXISTS idx_academy_teacher_checks_student ON public.academy_teacher_checks(student_id, kind, updated_at DESC);
