-- Allow authenticated users to read all ai_lessons (for library browsing)
DROP POLICY IF EXISTS "ai_lessons_select_own" ON public.ai_lessons;

CREATE POLICY "ai_lessons_select_all_authenticated"
  ON public.ai_lessons
  FOR SELECT
  TO authenticated
  USING (true);
