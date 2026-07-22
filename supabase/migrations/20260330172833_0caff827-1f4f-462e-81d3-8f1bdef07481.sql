-- Fix last always-true INSERT policy on lessons_content
DROP POLICY IF EXISTS "Authenticated users can create lesson content" ON public.lessons_content;
CREATE POLICY "Authenticated users can create own lesson content"
ON public.lessons_content FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());
