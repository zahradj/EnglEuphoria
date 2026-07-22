ALTER TABLE public.teacher_applications
  DROP CONSTRAINT IF EXISTS teacher_applications_status_check;

ALTER TABLE public.teacher_applications
  ADD CONSTRAINT teacher_applications_status_check
  CHECK (status::text = ANY (ARRAY[
    'pending','under_review','invited','interview_scheduled',
    'accepted','rejected','grammar_passed','rejected_grammar'
  ]));

ALTER TABLE public.teacher_applications
  DROP CONSTRAINT IF EXISTS valid_current_stage;

ALTER TABLE public.teacher_applications
  ADD CONSTRAINT valid_current_stage
  CHECK (current_stage::text = ANY (ARRAY[
    'application_submitted','documents_review','equipment_test',
    'interview_scheduled','interview_completed','final_review',
    'approved','rejected','grammar_passed','rejected_grammar'
  ]));