
CREATE TABLE public.system_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  error_message text NOT NULL,
  stack_trace text,
  component_name text,
  route text,
  user_id uuid,
  ai_analysis text,
  ai_model text,
  analyzed_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','analyzing','analyzed','resolved'))
);

CREATE INDEX idx_system_errors_status_created ON public.system_errors (status, created_at DESC);

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can insert errors from the global error boundary
CREATE POLICY "Anyone can log errors"
  ON public.system_errors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view all errors"
  ON public.system_errors
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update (mark resolved, etc.)
CREATE POLICY "Admins can update errors"
  ON public.system_errors
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete errors"
  ON public.system_errors
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
