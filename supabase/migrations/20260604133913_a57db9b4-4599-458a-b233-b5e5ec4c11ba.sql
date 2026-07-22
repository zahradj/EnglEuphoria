ALTER TABLE public.teacher_applications DROP CONSTRAINT IF EXISTS teacher_applications_status_check;
ALTER TABLE public.teacher_applications ADD CONSTRAINT teacher_applications_status_check
CHECK (status::text = ANY (ARRAY['pending','under_review','invited','interview_scheduled','accepted','rejected']::text[]));