DROP POLICY IF EXISTS "Admins write qa cache" ON public.qa_judge_cache;
CREATE POLICY "Admins and creators write qa cache"
  ON public.qa_judge_cache FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));
GRANT SELECT, INSERT, UPDATE ON public.qa_judge_cache TO authenticated;