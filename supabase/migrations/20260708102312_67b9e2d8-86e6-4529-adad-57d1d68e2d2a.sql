
-- 1. ai_lessons_ppp: restrict writes to teachers / content_creators / admins
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ai_lessons_ppp;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ai_lessons_ppp;

CREATE POLICY "Staff can insert PPP lessons"
  ON public.ai_lessons_ppp
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher'::public.app_role)
    OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Staff can update PPP lessons"
  ON public.ai_lessons_ppp
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher'::public.app_role)
    OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher'::public.app_role)
    OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 2. interactive_lessons: same role gate
DROP POLICY IF EXISTS "Teachers can create lessons" ON public.interactive_lessons;
DROP POLICY IF EXISTS "Teachers can update own lessons" ON public.interactive_lessons;

CREATE POLICY "Staff can create interactive lessons"
  ON public.interactive_lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.has_role(auth.uid(), 'teacher'::public.app_role)
      OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Staff can update own interactive lessons"
  ON public.interactive_lessons
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND (
      public.has_role(auth.uid(), 'teacher'::public.app_role)
      OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.has_role(auth.uid(), 'teacher'::public.app_role)
      OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- 3. certificate-assets bucket: drop anon read
DROP POLICY IF EXISTS "cert_assets_read" ON storage.objects;

CREATE POLICY "cert_assets_read_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'certificate-assets');

-- 4. sentinel_incidents: bind inserts to the reporting user
DROP POLICY IF EXISTS "Authenticated users can insert incidents" ON public.sentinel_incidents;

CREATE POLICY "Users can report own incidents"
  ON public.sentinel_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
