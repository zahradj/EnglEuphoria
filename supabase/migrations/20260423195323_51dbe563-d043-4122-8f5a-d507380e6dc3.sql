
-- 1. Fix notification_logs: Teachers should only see logs for their own students
DROP POLICY IF EXISTS "Teachers and admins can view all notification logs" ON public.notification_logs;

CREATE POLICY "Admins can view all notification logs"
ON public.notification_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view notification logs for their students"
ON public.notification_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher')
  AND EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.teacher_id = auth.uid()
      AND cb.student_id = notification_logs.student_id
  )
);

-- 2. Fix ai_lessons_ppp: Restrict public read to authenticated users only
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ai_lessons_ppp;

CREATE POLICY "Authenticated users can read PPP lessons"
ON public.ai_lessons_ppp
FOR SELECT
TO authenticated
USING (true);

-- 3. Storage: Restrict listing on public buckets - require authentication for LIST,
--    keep direct file access (by URL) public. We do this by removing broad SELECT
--    on lesson-images / lesson-slides / lesson-covers / lesson-assets / classroom-files /
--    curriculum-materials / teacher-applications / teacher-certificates and replacing
--    with authenticated-only SELECT. Public direct file access still works because the
--    buckets are marked public (objects are accessible by signed/public URL bypassing RLS list).

DROP POLICY IF EXISTS "Anyone can view classroom files" ON storage.objects;
CREATE POLICY "Authenticated can list classroom files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'classroom-files');

DROP POLICY IF EXISTS "Anyone can view curriculum files" ON storage.objects;
CREATE POLICY "Authenticated can list curriculum files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'curriculum-materials');

DROP POLICY IF EXISTS "Anyone can view lesson covers" ON storage.objects;
CREATE POLICY "Authenticated can list lesson covers"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lesson-covers');

DROP POLICY IF EXISTS "Anyone can view lesson images" ON storage.objects;
CREATE POLICY "Authenticated can list lesson images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lesson-images');

DROP POLICY IF EXISTS "Anyone can view teacher certificates" ON storage.objects;
CREATE POLICY "Authenticated can list teacher certificates"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'teacher-certificates');

DROP POLICY IF EXISTS "Anyone can read teacher application files" ON storage.objects;
CREATE POLICY "Admins can list teacher application files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'teacher-applications' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read access for lesson slides" ON storage.objects;
CREATE POLICY "Authenticated can list lesson slides"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lesson-slides');

DROP POLICY IF EXISTS "Public can read lesson assets" ON storage.objects;
CREATE POLICY "Authenticated can list lesson assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lesson-assets');
