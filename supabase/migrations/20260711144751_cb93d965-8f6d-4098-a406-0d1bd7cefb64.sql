GRANT SELECT ON public.curriculum_lessons TO anon;
CREATE POLICY "Anon can read published curriculum lessons"
ON public.curriculum_lessons
FOR SELECT
TO anon
USING (is_published = true);