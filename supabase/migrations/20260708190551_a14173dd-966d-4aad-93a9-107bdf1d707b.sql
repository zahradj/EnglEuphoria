
-- Authenticated users can read any object in lesson-videos
CREATE POLICY "lesson_videos_read_authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lesson-videos');

-- Content creators, admins, and service_role can write
CREATE POLICY "lesson_videos_write_creators"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'content_creator'::app_role)
    OR public.has_role(auth.uid(), 'teacher'::app_role)
  )
);

CREATE POLICY "lesson_videos_update_creators"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'lesson-videos'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'content_creator'::app_role)
    OR public.has_role(auth.uid(), 'teacher'::app_role)
  )
);
