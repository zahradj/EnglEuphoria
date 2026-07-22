CREATE POLICY "Teachers and admins update mistakes"
  ON public.mistake_repository FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
  );