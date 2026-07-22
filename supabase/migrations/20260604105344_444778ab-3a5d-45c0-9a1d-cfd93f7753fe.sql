CREATE TABLE IF NOT EXISTS public.interview_availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL CHECK (end_time > start_time),
  slot_minutes integer NOT NULL DEFAULT 45 CHECK (slot_minutes BETWEEN 15 AND 180),
  hub_type text NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_availability_rules TO authenticated;
GRANT ALL ON public.interview_availability_rules TO service_role;

ALTER TABLE public.interview_availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage availability rules"
  ON public.interview_availability_rules
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.interview_availability_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NULL,
  interview_id uuid NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  kind text NOT NULL CHECK (kind IN ('add','block')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iao_application ON public.interview_availability_overrides(application_id);
CREATE INDEX IF NOT EXISTS idx_iao_interview ON public.interview_availability_overrides(interview_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_availability_overrides TO authenticated;
GRANT ALL ON public.interview_availability_overrides TO service_role;

ALTER TABLE public.interview_availability_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage availability overrides"
  ON public.interview_availability_overrides
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_iar_updated_at ON public.interview_availability_rules;
CREATE TRIGGER trg_iar_updated_at BEFORE UPDATE ON public.interview_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Allow 'awaiting_booking' status on interviews
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interviews_status_check'
  ) THEN
    ALTER TABLE public.interviews DROP CONSTRAINT interviews_status_check;
  END IF;
END $$;

ALTER TABLE public.interviews
  ADD CONSTRAINT interviews_status_check
  CHECK (status IN ('awaiting_booking','scheduled','in_progress','completed','passed','failed','cancelled'));

-- Make scheduled_at nullable so a row can exist before the applicant books
ALTER TABLE public.interviews ALTER COLUMN scheduled_at DROP NOT NULL;