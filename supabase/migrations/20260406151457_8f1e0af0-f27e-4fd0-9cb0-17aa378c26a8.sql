
DROP POLICY IF EXISTS "Admins can manage interviews" ON public.teacher_interviews;

CREATE POLICY "Admins can manage interviews"
ON public.teacher_interviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
