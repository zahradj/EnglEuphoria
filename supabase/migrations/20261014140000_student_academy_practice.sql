-- An Academy student's practice record, so the Daily 10 and the "Say it" tally follow the student across devices and teachers can see the gap report.
-- One row per student; `data` holds { items: Daily 10 item states, lessons: finished lessons with their "Say it" tally, daily10Days: dates }
-- (src/academy-deck/practiceStore.ts). The app keeps working from the browser until this table exists (everything fails soft).
-- NOT applied automatically: run it when the owner approves (supabase db push / SQL editor).

CREATE TABLE IF NOT EXISTS public.student_academy_practice (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_academy_practice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students manage their own practice record" ON public.student_academy_practice;
CREATE POLICY "Students manage their own practice record" ON public.student_academy_practice
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- A parent can see how their approved children are practising.
DROP POLICY IF EXISTS "Parents read their children's practice record" ON public.student_academy_practice;
CREATE POLICY "Parents read their children's practice record" ON public.student_academy_practice
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_parent_relationships r
    WHERE r.parent_id = auth.uid() AND r.student_id = student_academy_practice.user_id
  ));

-- Teachers (and admins) can read it for the gap report.
DROP POLICY IF EXISTS "Teachers read practice records" ON public.student_academy_practice;
CREATE POLICY "Teachers read practice records" ON public.student_academy_practice
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_student_academy_practice_updated ON public.student_academy_practice(updated_at DESC);
