
-- 1. Security definer views -> security_invoker
ALTER VIEW public.academy_coin_balances SET (security_invoker = true);
ALTER VIEW public.world_engagement_summary SET (security_invoker = true);

-- 2. sentinel_incidents: require auth for inserts
DROP POLICY IF EXISTS "Anyone can insert incidents" ON public.sentinel_incidents;
CREATE POLICY "Authenticated users can insert incidents"
  ON public.sentinel_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. storybook-images bucket: restrict writes to content_creator/admin
DROP POLICY IF EXISTS "Storybook images authed write" ON storage.objects;
DROP POLICY IF EXISTS "Storybook images authed update" ON storage.objects;

CREATE POLICY "Storybook images staff insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'storybook-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
    )
  );

CREATE POLICY "Storybook images staff update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'storybook-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
    )
  )
  WITH CHECK (
    bucket_id = 'storybook-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
    )
  );

-- 4. teacher-applications: drop wildcard insert, enforce applications/ folder
DROP POLICY IF EXISTS "Anyone can upload teacher application CVs" ON storage.objects;
CREATE POLICY "Public can upload teacher application CVs to applications folder"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'teacher-applications'
    AND (storage.foldername(name))[1] = 'applications'
  );

-- 5. user_roles: remove self-assign (handle_new_user trigger still assigns it on signup)
DROP POLICY IF EXISTS "Users can insert their own student role" ON public.user_roles;

-- 6. adaptive_content: use user_roles via has_role()
DROP POLICY IF EXISTS "Teachers can create content" ON public.adaptive_content;
CREATE POLICY "Teachers can create content"
  ON public.adaptive_content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'content_creator'::public.app_role)
  );
