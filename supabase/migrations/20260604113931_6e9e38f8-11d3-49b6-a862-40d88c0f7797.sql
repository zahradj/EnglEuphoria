ALTER TABLE public.interview_availability_rules
  ALTER COLUMN slot_minutes SET DEFAULT 25;

ALTER TABLE public.interviews
  ALTER COLUMN duration_minutes SET DEFAULT 25;

UPDATE public.interview_availability_rules
  SET slot_minutes = 25
  WHERE slot_minutes = 45;

UPDATE public.interviews
  SET duration_minutes = 25
  WHERE duration_minutes IN (15, 45, 60);