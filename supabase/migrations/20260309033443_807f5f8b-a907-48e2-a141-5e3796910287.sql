
-- Extend curriculum_lessons with creator metadata columns
ALTER TABLE curriculum_lessons
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- RLS policy for content creators and admins
CREATE POLICY "Content creators can manage lessons"
ON curriculum_lessons FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'content_creator')
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'content_creator')
  OR public.has_role(auth.uid(), 'admin')
);
