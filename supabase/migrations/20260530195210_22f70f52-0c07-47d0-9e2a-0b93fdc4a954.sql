-- Sentinel-1 reliability incidents
CREATE TABLE public.sentinel_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  user_id uuid,
  component_name text NOT NULL,
  route text,
  error_message text NOT NULL,
  error_stack text,
  current_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  target_table text,
  target_row_id text,
  proposed_data_patch jsonb,
  confidence_score int NOT NULL DEFAULT 0,
  root_cause_analysis text,
  cto_explanation text,
  requires_human_intervention boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','applied','failed','needs_human')),
  reviewed_by uuid,
  apply_error text
);

CREATE INDEX idx_sentinel_incidents_status ON public.sentinel_incidents(status, created_at DESC);

GRANT SELECT ON public.sentinel_incidents TO authenticated;
GRANT INSERT ON public.sentinel_incidents TO authenticated, anon;
GRANT UPDATE ON public.sentinel_incidents TO authenticated;
GRANT ALL ON public.sentinel_incidents TO service_role;

ALTER TABLE public.sentinel_incidents ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can report a crash
CREATE POLICY "Anyone can insert incidents"
ON public.sentinel_incidents FOR INSERT
WITH CHECK (true);

-- Only admins can read incidents
CREATE POLICY "Admins can read incidents"
ON public.sentinel_incidents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update incidents (approve/reject)
CREATE POLICY "Admins can update incidents"
ON public.sentinel_incidents FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.sentinel_incidents;