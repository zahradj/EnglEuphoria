
CREATE TABLE public.qa_judge_ttl_overrides (
  judge text PRIMARY KEY,
  ttl_days integer NOT NULL CHECK (ttl_days > 0 AND ttl_days <= 365),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_judge_ttl_overrides TO authenticated;
GRANT ALL ON public.qa_judge_ttl_overrides TO service_role;

ALTER TABLE public.qa_judge_ttl_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage TTL overrides"
ON public.qa_judge_ttl_overrides
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
