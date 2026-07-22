CREATE TABLE IF NOT EXISTS public.custom_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hub text NOT NULL CHECK (hub IN ('playground','academy','success')),
  personality_traits text NOT NULL DEFAULT '',
  visual_blueprint text NOT NULL DEFAULT '',
  avatar_url text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS custom_characters_hub_idx ON public.custom_characters (hub);
CREATE INDEX IF NOT EXISTS custom_characters_created_by_idx ON public.custom_characters (created_by);

ALTER TABLE public.custom_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read characters"
  ON public.custom_characters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners or admins can insert characters"
  ON public.custom_characters FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Owners or admins can update characters"
  ON public.custom_characters FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    auth.uid() = created_by
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Owners or admins can delete characters"
  ON public.custom_characters FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER custom_characters_updated_at
  BEFORE UPDATE ON public.custom_characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
