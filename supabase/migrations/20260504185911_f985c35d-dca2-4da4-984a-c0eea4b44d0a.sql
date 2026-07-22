-- Lesson Template Marketplace
CREATE TABLE public.lesson_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hub TEXT NOT NULL CHECK (hub IN ('playground','academy')),
  title TEXT NOT NULL,
  description TEXT,
  level TEXT,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  slide_count INT NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  clone_count INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_templates_hub_level ON public.lesson_templates (hub, level) WHERE is_published;
CREATE INDEX idx_lesson_templates_tags ON public.lesson_templates USING GIN (tags);
CREATE INDEX idx_lesson_templates_created_by ON public.lesson_templates (created_by);

ALTER TABLE public.lesson_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published templates"
ON public.lesson_templates FOR SELECT
TO authenticated
USING (is_published OR created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users can publish their own templates"
ON public.lesson_templates FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners and admins can update templates"
ON public.lesson_templates FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Owners and admins can delete templates"
ON public.lesson_templates FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_lesson_templates_updated_at
BEFORE UPDATE ON public.lesson_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_template_clone(template_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.lesson_templates
  SET clone_count = clone_count + 1
  WHERE id = template_id AND is_published;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_template_clone(UUID) TO authenticated;