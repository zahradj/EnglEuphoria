
DROP POLICY IF EXISTS "Teachers can view own interviews" ON public.interviews;

CREATE POLICY "Teachers can view own interviews"
ON public.interviews
FOR SELECT
TO authenticated
USING (teacher_email = (auth.jwt() ->> 'email'));
