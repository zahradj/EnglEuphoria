
CREATE TABLE public.classroom_incident_verdicts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL UNIQUE,
  status text NOT NULL,
  fault_party text NOT NULL,
  confidence numeric,
  summary text,
  recommended_action text,
  reports_considered jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_classroom_incident_verdicts_room ON public.classroom_incident_verdicts(room_id);

GRANT SELECT ON public.classroom_incident_verdicts TO authenticated;
GRANT ALL ON public.classroom_incident_verdicts TO service_role;

ALTER TABLE public.classroom_incident_verdicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read all verdicts"
  ON public.classroom_incident_verdicts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "participants read their room verdict"
  ON public.classroom_incident_verdicts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_bookings b
      WHERE b.id = classroom_incident_verdicts.room_id
        AND (b.teacher_id = auth.uid() OR b.student_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.interviews i
      WHERE (i.id = classroom_incident_verdicts.room_id
             OR i.classroom_id = classroom_incident_verdicts.room_id
             OR i.classroom_session_id = classroom_incident_verdicts.room_id::text)
        AND (i.applicant_user_id = auth.uid()
             OR i.teacher_email = (auth.jwt() ->> 'email'))
    )
  );

CREATE TRIGGER trg_classroom_incident_verdicts_updated_at
  BEFORE UPDATE ON public.classroom_incident_verdicts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
