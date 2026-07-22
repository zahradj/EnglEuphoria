
CREATE TABLE public.qa_sweep_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by text NOT NULL DEFAULT 'cron',
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cache_evicted int NOT NULL DEFAULT 0,
  events_evicted int NOT NULL DEFAULT 0,
  ttl_days int NOT NULL DEFAULT 30,
  cutoff timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.qa_sweep_audit TO authenticated;
GRANT ALL ON public.qa_sweep_audit TO service_role;

ALTER TABLE public.qa_sweep_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sweep audit"
ON public.qa_sweep_audit
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
