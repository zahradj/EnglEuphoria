DROP POLICY IF EXISTS "applicants can read by email match" ON public.teacher_grammar_tests;

CREATE POLICY "applicants read own grammar test by email"
ON public.teacher_grammar_tests
FOR SELECT
TO authenticated
USING (lower(email) = lower(auth.jwt() ->> 'email'));