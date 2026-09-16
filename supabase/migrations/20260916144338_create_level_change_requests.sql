-- Teacher-initiated CEFR level change requests, reviewed/approved in the
-- admin dashboard. Mirrors the shape already deployed to production via the
-- Supabase MCP apply_migration tool — this file exists so a fresh
-- environment (supabase db reset / new project) reproduces the same schema.
CREATE TABLE public.level_change_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level text,
  requested_level text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_id uuid REFERENCES auth.users(id),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_level_change_requests_status ON public.level_change_requests (status);
CREATE INDEX idx_level_change_requests_student ON public.level_change_requests (student_id);
CREATE INDEX idx_level_change_requests_teacher ON public.level_change_requests (teacher_id);

ALTER TABLE public.level_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers create their own level requests"
  ON public.level_change_requests FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers view own, admins view all level requests"
  ON public.level_change_requests FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins resolve level requests"
  ON public.level_change_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
