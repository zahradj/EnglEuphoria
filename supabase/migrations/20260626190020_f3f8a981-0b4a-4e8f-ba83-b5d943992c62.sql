
CREATE TABLE public.lesson_incident_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reporter_role text NOT NULL CHECK (reporter_role IN ('teacher','student')),
  outcome text NOT NULL CHECK (outcome IN ('completed','not_completed')),
  flags text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, reporter_id)
);

CREATE INDEX idx_lesson_incident_reports_room ON public.lesson_incident_reports(room_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_incident_reports TO authenticated;
GRANT ALL ON public.lesson_incident_reports TO service_role;

ALTER TABLE public.lesson_incident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporter manages own report"
  ON public.lesson_incident_reports
  FOR ALL
  USING (reporter_id = auth.uid())
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "counterparts can read room reports"
  ON public.lesson_incident_reports
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.class_bookings b
      WHERE b.id = lesson_incident_reports.room_id
        AND (b.teacher_id = auth.uid() OR b.student_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.interviews i
      WHERE (i.id = lesson_incident_reports.room_id
             OR i.classroom_id = lesson_incident_reports.room_id
             OR i.classroom_session_id = lesson_incident_reports.room_id::text)
        AND (i.applicant_user_id = auth.uid()
             OR i.teacher_email = (auth.jwt() ->> 'email'))
    )
  );

CREATE TRIGGER trg_lesson_incident_reports_updated_at
  BEFORE UPDATE ON public.lesson_incident_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
