
-- Extend certificate_templates for per-hub / per-CEFR designs
ALTER TABLE public.certificate_templates
  ADD COLUMN IF NOT EXISTS hub TEXT,
  ADD COLUMN IF NOT EXISTS cefr_level TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS accent_color TEXT,
  ADD COLUMN IF NOT EXISTS text_color TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS background_url TEXT,
  ADD COLUMN IF NOT EXISTS heading TEXT,
  ADD COLUMN IF NOT EXISTS subheading TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- Relax existing template_type CHECK to include engine_mastery
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.certificate_templates'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%template_type%';
  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.certificate_templates DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

ALTER TABLE public.certificate_templates
  ADD CONSTRAINT certificate_templates_template_type_check
  CHECK (template_type IN ('completion','achievement','mastery','cefr_level','engine_mastery'));

CREATE UNIQUE INDEX IF NOT EXISTS certificate_templates_hub_cefr_type_key
  ON public.certificate_templates (COALESCE(hub,''), COALESCE(cefr_level,''), template_type);

-- Public read so public shared certs can render with the right template
DROP POLICY IF EXISTS "Anyone can read templates" ON public.certificate_templates;
CREATE POLICY "Anyone can read templates"
  ON public.certificate_templates FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins and creators manage templates" ON public.certificate_templates;
CREATE POLICY "Admins and creators manage templates"
  ON public.certificate_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_creator'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_creator'));

GRANT SELECT ON public.certificate_templates TO anon;

-- Remember which CEFR level was awarded for an engine mastery cert
ALTER TABLE public.engine_mastery_certificates
  ADD COLUMN IF NOT EXISTS cefr_level TEXT;
