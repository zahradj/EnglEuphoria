-- Lesson revision history for the slide creators
CREATE TABLE public.lesson_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  created_by UUID,
  title TEXT,
  content JSONB NOT NULL,
  kind TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'publish' | 'auto'
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_revisions_lesson_id_created_at
  ON public.lesson_revisions (lesson_id, created_at DESC);

ALTER TABLE public.lesson_revisions ENABLE ROW LEVEL SECURITY;

-- Creators (and admins/content_creators) can view revisions of lessons they created
CREATE POLICY "Creators can view their lesson revisions"
ON public.lesson_revisions
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.curriculum_lessons cl
    WHERE cl.id = lesson_revisions.lesson_id
      AND cl.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'content_creator')
);

CREATE POLICY "Creators can insert their lesson revisions"
ON public.lesson_revisions
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM public.curriculum_lessons cl
      WHERE cl.id = lesson_revisions.lesson_id
        AND cl.created_by = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_creator')
  )
);

CREATE POLICY "Admins can manage lesson revisions"
ON public.lesson_revisions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));