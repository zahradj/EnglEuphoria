ALTER TABLE public.classroom_states
  ADD COLUMN IF NOT EXISTS supplemental_ref jsonb,
  ADD COLUMN IF NOT EXISTS correct_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0;