
DROP POLICY IF EXISTS "anyone can insert their grammar test attempt" ON public.teacher_grammar_tests;
CREATE POLICY "applicants insert own grammar test"
ON public.teacher_grammar_tests
FOR INSERT TO authenticated
WITH CHECK (lower(email) = lower((auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Anonymous users can submit applications without user_id" ON public.teacher_applications;
CREATE POLICY "Anonymous users can submit applications without user_id"
ON public.teacher_applications
FOR INSERT TO anon
WITH CHECK (
  user_id IS NULL
  AND admin_notes IS NULL
  AND email IS NOT NULL AND length(btrim(email)) > 3
  AND first_name IS NOT NULL AND length(btrim(first_name)) > 0
  AND last_name IS NOT NULL AND length(btrim(last_name)) > 0
);

DROP POLICY IF EXISTS "Teachers can upload lesson images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update lesson images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their lesson images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all application files" ON storage.objects;

CREATE POLICY "Teachers can upload lesson images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'lesson-images'
  AND ((storage.foldername(name))[1] IN ('vocabulary','intro'))
  AND (public.has_role(auth.uid(), 'teacher'::app_role)
       OR public.has_role(auth.uid(), 'content_creator'::app_role)
       OR public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers can update lesson images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'lesson-images'
  AND (public.has_role(auth.uid(), 'teacher'::app_role)
       OR public.has_role(auth.uid(), 'content_creator'::app_role)
       OR public.has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
  bucket_id = 'lesson-images'
  AND (public.has_role(auth.uid(), 'teacher'::app_role)
       OR public.has_role(auth.uid(), 'content_creator'::app_role)
       OR public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers can delete their lesson images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'lesson-images'
  AND (public.has_role(auth.uid(), 'teacher'::app_role)
       OR public.has_role(auth.uid(), 'content_creator'::app_role)
       OR public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can view all application files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'teacher-applications'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
