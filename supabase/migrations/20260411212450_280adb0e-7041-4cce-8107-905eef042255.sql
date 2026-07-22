
CREATE TABLE public.unit_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL UNIQUE REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
  mission_text TEXT NOT NULL,
  mission_tip TEXT,
  goal_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.unit_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read missions"
  ON public.unit_missions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and teachers can insert missions"
  ON public.unit_missions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update missions"
  ON public.unit_missions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'teacher')
    )
  );

CREATE TRIGGER update_unit_missions_updated_at
  BEFORE UPDATE ON public.unit_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
