
-- #1 Dedup trial placement_results at the DB level
CREATE UNIQUE INDEX IF NOT EXISTS placement_results_trial_unique_per_student
  ON public.placement_results (student_id)
  WHERE method = 'trial_lesson';

-- #2 Persist teacher's Master Library switch on the booking itself
ALTER TABLE public.class_bookings
  ADD COLUMN IF NOT EXISTS curriculum_lesson_id UUID NULL
    REFERENCES public.curriculum_lessons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_class_bookings_curriculum_lesson_id
  ON public.class_bookings (curriculum_lesson_id);
