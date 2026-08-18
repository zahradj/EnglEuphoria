-- Storage for the unified PPP + activity lesson engine (Academy + Success).
-- One row per lesson; `moments` holds the full UnifiedMoment[] tree
-- (src/unified-lessons/types.ts) as jsonb — the same shape the solo player
-- and creator both read/write, so no separate normalized schema is needed
-- for this pilot-to-real transition.
--
-- RLS mirrors the existing storybooks table's read/write pattern
-- (public.storybooks in 20260520090620_...), which already establishes the
-- "published OR own OR staff role" convention for hub content in this repo.

CREATE TABLE IF NOT EXISTS public.unified_lessons (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub                      text NOT NULL CHECK (hub IN ('academy', 'success')),
  title                    text NOT NULL,
  cefr                     text NOT NULL,
  default_host_character_id uuid REFERENCES public.cast_vault_characters(id) ON DELETE SET NULL,
  moments                  jsonb NOT NULL DEFAULT '[]'::jsonb,
  status                   text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by               uuid NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_unified_lessons_hub ON public.unified_lessons(hub);
CREATE INDEX IF NOT EXISTS idx_unified_lessons_status ON public.unified_lessons(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_unified_lessons_created_by ON public.unified_lessons(created_by);

DO $$ BEGIN
  CREATE TRIGGER tg_unified_lessons_updated BEFORE UPDATE ON public.unified_lessons
    FOR EACH ROW EXECUTE FUNCTION public.tg_storybook_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.unified_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unified_lessons_read_published_or_staff"
  ON public.unified_lessons FOR SELECT
  USING (
    status = 'published'
    OR created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_creator')
    OR public.has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "unified_lessons_insert_creator_or_admin"
  ON public.unified_lessons FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "unified_lessons_update_owner_or_admin"
  ON public.unified_lessons FOR UPDATE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "unified_lessons_delete_owner_or_admin"
  ON public.unified_lessons FOR DELETE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
