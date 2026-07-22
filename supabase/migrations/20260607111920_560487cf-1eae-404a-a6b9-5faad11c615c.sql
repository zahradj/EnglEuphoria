
CREATE TABLE IF NOT EXISTS public.placement_content (
  hub text PRIMARY KEY CHECK (hub IN ('playground','academy','success')),
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.placement_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.placement_content TO authenticated;
GRANT ALL ON public.placement_content TO service_role;

ALTER TABLE public.placement_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read placement content"
  ON public.placement_content FOR SELECT
  USING (true);

CREATE POLICY "Admins and content creators can write placement content"
  ON public.placement_content FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_creator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_creator')
  );

CREATE OR REPLACE FUNCTION public._placement_content_touch()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS placement_content_touch ON public.placement_content;
CREATE TRIGGER placement_content_touch
  BEFORE UPDATE ON public.placement_content
  FOR EACH ROW EXECUTE FUNCTION public._placement_content_touch();
