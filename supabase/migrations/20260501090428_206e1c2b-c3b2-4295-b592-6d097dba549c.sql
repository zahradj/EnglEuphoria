CREATE POLICY "Content creators can create curriculum levels"
ON public.curriculum_levels
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'content_creator'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);