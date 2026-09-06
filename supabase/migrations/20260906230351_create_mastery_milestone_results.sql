-- mastery_milestone_results: per-unit "Mastery Milestone" quiz outcomes.
--
-- This table is READ by 9 call sites (student MasteryMilestone card & UnitRoadmap,
-- teacher MasteryOverview / UnitMasteryReport / CommandCenter / StudentSuccessHub /
-- StudentEntityDashboard / DiagnosticReportGenerator, and utils/sendMasteryReport)
-- but was never created by any migration and is absent from the generated
-- Database types -> every one of those queries has been failing silently
-- (PostgREST 42P01) and the surfaces have been rendering permanent empty states.
-- Same silent-failure class as the 'profiles'-table and market_region fixes.
--
-- The quiz *runner* that produces these rows is still to be built (the "Take Quiz"
-- affordance in UnitRoadmap is currently a non-interactive <span>). Creating the
-- table with the shape all 9 readers already expect makes those surfaces correct
-- now (honest empty state) and gives the future quiz/grader a real insert target.
--
-- Column shape is the intersection of what the readers select:
--   student_id, unit_id, score (0-100 %), passed, skill_scores (jsonb map of
--   listening/speaking/reading/writing/grammar/phonics -> number), weakest_skill,
--   completed_at.

CREATE TABLE public.mastery_milestone_results (
  id             uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id     uuid NOT NULL,
  unit_id        uuid NOT NULL REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
  score          numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  passed         boolean NOT NULL DEFAULT false,
  skill_scores   jsonb NOT NULL DEFAULT '{}'::jsonb,
  weakest_skill  text,
  completed_at   timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Readers order by completed_at DESC and filter by student_id; UnitRoadmap and
-- MasteryOverview also group by unit_id. Retakes are allowed (feedbackLoop routes
-- a failing score into a reinforcement lesson, after which the student re-sits),
-- so no unique (student_id, unit_id) constraint -- callers already take the most
-- recent row per unit.
CREATE INDEX idx_mastery_milestone_results_student
  ON public.mastery_milestone_results (student_id, completed_at DESC);
CREATE INDEX idx_mastery_milestone_results_unit
  ON public.mastery_milestone_results (unit_id);

ALTER TABLE public.mastery_milestone_results ENABLE ROW LEVEL SECURITY;

-- Students own their own milestone rows (mirrors student_phonics_progress).
CREATE POLICY "students_read_own_milestones"
ON public.mastery_milestone_results FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "students_insert_own_milestones"
ON public.mastery_milestone_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "students_update_own_milestones"
ON public.mastery_milestone_results FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Teachers see milestone rows for their own students only; admins see all
-- (mirrors the student_vocabulary_progress / student_lesson_progress policy).
CREATE POLICY "teachers_read_students_milestones"
ON public.mastery_milestone_results FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.teacher_id = auth.uid()
      AND cb.student_id = mastery_milestone_results.student_id
  )
);
