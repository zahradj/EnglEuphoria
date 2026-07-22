-- Drop the old overly-permissive policy that gave teachers write access
DROP POLICY IF EXISTS "Teachers and admins can manage curriculum lessons" ON public.curriculum_lessons;

-- Teachers can read all lessons (published and unpublished) for classroom presentation
CREATE POLICY "Teachers can read curriculum_lessons"
  ON public.curriculum_lessons
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

-- Students can read published lessons only (keep existing policy if present, add if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'curriculum_lessons' 
    AND policyname = 'Authenticated users can read published curriculum lessons'
  ) THEN
    CREATE POLICY "Authenticated users can read published curriculum lessons"
      ON public.curriculum_lessons
      FOR SELECT TO authenticated
      USING (is_published = true);
  END IF;
END $$;

-- Ensure DELETE is also restricted to admin/content_creator
CREATE POLICY "Admins and content creators can delete curriculum_lessons"
  ON public.curriculum_lessons
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));