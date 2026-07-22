CREATE POLICY "Teachers and creators can insert library assets"
ON public.library_assets
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_user_teacher()
  OR public.is_admin()
  OR public.has_role(auth.uid(), 'content_creator')
);

CREATE POLICY "Creators can update their own library assets"
ON public.library_assets
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin())
WITH CHECK (created_by = auth.uid() OR public.is_admin());

CREATE POLICY "Creators can delete their own library assets"
ON public.library_assets
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin());