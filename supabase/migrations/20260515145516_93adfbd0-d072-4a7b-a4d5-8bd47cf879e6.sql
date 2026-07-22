
-- 1. Prevent role escalation on public.users
CREATE OR REPLACE FUNCTION public.prevent_users_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Changing role is not permitted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_prevent_role_change ON public.users;
CREATE TRIGGER users_prevent_role_change
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_users_role_change();

-- 2. Rewrite role helper functions to consult user_roles
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_teacher()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'teacher'
  );
$$;

-- 3. ai_lessons: drop overly broad SELECT policy, add owner-scoped one
DROP POLICY IF EXISTS ai_lessons_select_all_authenticated ON public.ai_lessons;
DROP POLICY IF EXISTS ai_lessons_select_own ON public.ai_lessons;
CREATE POLICY ai_lessons_select_own ON public.ai_lessons
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. teacher_reviews: drop unconditionally permissive public SELECT
DROP POLICY IF EXISTS teacher_reviews_public_read ON public.teacher_reviews;

-- 5. classroom_timeline_events: restrict to room participants
DROP POLICY IF EXISTS timeline_events_select_authenticated ON public.classroom_timeline_events;
DROP POLICY IF EXISTS timeline_events_insert_authenticated ON public.classroom_timeline_events;

CREATE POLICY timeline_events_select_participants ON public.classroom_timeline_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_sessions cs
      WHERE cs.room_id = classroom_timeline_events.room_id
        AND cs.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.classroom_id::text = classroom_timeline_events.room_id
        AND (cb.student_id = auth.uid() OR cb.teacher_id = auth.uid())
    )
    OR public.is_user_admin()
  );

CREATE POLICY timeline_events_insert_participants ON public.classroom_timeline_events
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.classroom_sessions cs
        WHERE cs.room_id = classroom_timeline_events.room_id
          AND cs.teacher_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.class_bookings cb
        WHERE cb.classroom_id::text = classroom_timeline_events.room_id
          AND (cb.student_id = auth.uid() OR cb.teacher_id = auth.uid())
      )
    )
  );

-- 6. Storage: ownership-aware UPDATE/DELETE for lesson-assets and lesson-slides
DROP POLICY IF EXISTS "Authenticated users can delete lesson assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update lesson assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete lesson slides" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update lesson slides" ON storage.objects;

CREATE POLICY "Owners or admins can delete lesson assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'lesson-assets'
    AND (owner = auth.uid() OR public.is_user_admin())
  );

CREATE POLICY "Owners or admins can update lesson assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lesson-assets'
    AND (owner = auth.uid() OR public.is_user_admin())
  );

CREATE POLICY "Owners or admins can delete lesson slides" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'lesson-slides'
    AND (owner = auth.uid() OR public.is_user_admin())
  );

CREATE POLICY "Owners or admins can update lesson slides" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lesson-slides'
    AND (owner = auth.uid() OR public.is_user_admin())
  );

-- 7. Storage: restrict playground asset UPDATE to admins/owners
DROP POLICY IF EXISTS "Service can update playground assets" ON storage.objects;
CREATE POLICY "Owners or admins can update playground assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'playground_assets'
    AND (owner = auth.uid() OR public.is_user_admin())
  );
