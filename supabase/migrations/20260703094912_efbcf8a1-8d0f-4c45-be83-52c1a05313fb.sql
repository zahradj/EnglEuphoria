
-- Marketplace: add sharing to teacher_scenario_overrides
ALTER TABLE public.teacher_scenario_overrides
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clone_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cloned_from uuid REFERENCES public.teacher_scenario_overrides(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text;

DROP POLICY IF EXISTS "Anyone can read public overrides" ON public.teacher_scenario_overrides;
CREATE POLICY "Anyone can read public overrides"
ON public.teacher_scenario_overrides FOR SELECT
TO authenticated
USING (is_public = true);

-- Engine mastery certificates
CREATE TABLE IF NOT EXISTS public.engine_mastery_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  engine text NOT NULL,
  hub text NOT NULL,
  runs_count integer NOT NULL,
  avg_accuracy numeric NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  UNIQUE (user_id, engine)
);
GRANT SELECT, INSERT ON public.engine_mastery_certificates TO authenticated;
GRANT ALL ON public.engine_mastery_certificates TO service_role;
ALTER TABLE public.engine_mastery_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own certs" ON public.engine_mastery_certificates
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read by token" ON public.engine_mastery_certificates
  FOR SELECT TO anon USING (share_token IS NOT NULL);
GRANT SELECT ON public.engine_mastery_certificates TO anon;
