-- Family accounts, step 1: close the parent-link hole and make the parent role real.
--
-- 1. Anyone could INSERT a student_parent_relationships row linking themselves to ANY
--    student_id, and the parent-read policies / progress RPC then exposed that child's data.
--    Linking is now admin-only here; the parent-driven flow arrives as a SECURITY DEFINER RPC
--    in step 3. Every parent read path now requires an approved link (approved_at IS NOT NULL).
-- 2. handle_new_user() trusted `role` from user_metadata, which the browser controls, so a
--    signup with role='admin' became an admin. Privileged roles are now only honoured from
--    raw_app_meta_data (service-role only). Public signup may choose student | teacher | parent.
-- 3. A parent signup now gets its parent_profiles + notification-preferences rows.

-- ---------------------------------------------------------------------------
-- 1. Parent <-> student links
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents can create relationships" ON public.student_parent_relationships;

DROP POLICY IF EXISTS "Parents can view their student relationships" ON public.student_parent_relationships;
CREATE POLICY "Parents can view their approved student relationships"
  ON public.student_parent_relationships FOR SELECT
  USING (auth.uid() = parent_id AND approved_at IS NOT NULL);

-- Vocabulary: the live database merged the per-role SELECT policies into one
-- ("student_vocabulary_progress_select_consolidated"); older environments still have the
-- separate parent policy. Handle both, adding the approval requirement either way.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'student_vocabulary_progress'
      AND policyname = 'student_vocabulary_progress_select_consolidated'
  ) THEN
    DROP POLICY "student_vocabulary_progress_select_consolidated" ON public.student_vocabulary_progress;
    CREATE POLICY "student_vocabulary_progress_select_consolidated"
      ON public.student_vocabulary_progress FOR SELECT
      USING (
        student_id = (SELECT auth.uid())
        OR (SELECT public.has_role(auth.uid(), 'admin'::public.app_role))
        OR EXISTS (
          SELECT 1 FROM public.student_parent_relationships spr
          WHERE spr.parent_id = (SELECT auth.uid())
            AND spr.student_id = student_vocabulary_progress.student_id
            AND spr.can_view_progress = true
            AND spr.approved_at IS NOT NULL
        )
        OR EXISTS (
          SELECT 1 FROM public.class_bookings cb
          WHERE cb.teacher_id = (SELECT auth.uid())
            AND cb.student_id = student_vocabulary_progress.student_id
        )
      );
  ELSE
    DROP POLICY IF EXISTS "Parents can view child vocabulary" ON public.student_vocabulary_progress;
    CREATE POLICY "Parents can view child vocabulary"
      ON public.student_vocabulary_progress FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.student_parent_relationships spr
          WHERE spr.parent_id = auth.uid()
            AND spr.student_id = student_vocabulary_progress.student_id
            AND spr.can_view_progress = true
            AND spr.approved_at IS NOT NULL
        )
      );
  END IF;
END $$;

-- The RPC trusted a caller-supplied p_parent_id; bind it to the real caller and require approval.
CREATE OR REPLACE FUNCTION public.get_student_progress_for_parent(p_parent_id UUID, p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  is_authorized BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_parent_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.student_parent_relationships
    WHERE parent_id = p_parent_id
      AND student_id = p_student_id
      AND can_view_progress = true
      AND approved_at IS NOT NULL
  ) INTO is_authorized;

  IF NOT is_authorized THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT jsonb_build_object(
    'total_lessons', (
      SELECT COUNT(*) FROM public.lessons
      WHERE student_id = p_student_id AND status = 'completed'
    ),
    'upcoming_lessons', (
      SELECT COUNT(*) FROM public.lessons
      WHERE student_id = p_student_id
        AND status = 'scheduled'
        AND scheduled_at >= NOW()
    ),
    'total_xp', COALESCE((
      SELECT total_xp FROM public.student_xp WHERE student_id = p_student_id
    ), 0),
    'current_level', COALESCE((
      SELECT current_level FROM public.student_xp WHERE student_id = p_student_id
    ), 1),
    'achievements_count', (
      SELECT COUNT(*) FROM public.student_achievements WHERE student_id = p_student_id
    ),
    'cefr_level', (
      SELECT cefr_level FROM public.student_profiles WHERE user_id = p_student_id
    ),
    'last_lesson_date', (
      SELECT MAX(completed_at) FROM public.lessons
      WHERE student_id = p_student_id AND status = 'completed'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2 + 3. handle_new_user(): safe roles + parent profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role        TEXT;
  user_full_name   TEXT;
  hub_meta         TEXT;
  user_age         INTEGER;
  resolved_level   public.student_level;
BEGIN
  -- Privileged roles (admin, content_creator, ...) are only honoured from app_metadata, which
  -- only the service role can write. user_metadata is client-controlled, so it may only pick
  -- one of the self-service roles.
  user_role := COALESCE(
    NULLIF(NEW.raw_app_meta_data->>'role', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('student', 'teacher', 'parent')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'student'
    END
  );
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, user_full_name, user_role)
  ON CONFLICT (id) DO UPDATE SET
    email     = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role      = COALESCE(EXCLUDED.role, public.users.role);

  IF user_role IN ('student', 'teacher', 'admin', 'content_creator', 'parent') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  IF user_role = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id, profile_complete, can_teach, profile_approved_by_admin)
    VALUES (NEW.id, false, false, false)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF user_role = 'parent' THEN
    INSERT INTO public.parent_profiles (user_id, full_name)
    VALUES (NEW.id, user_full_name)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.parent_notification_preferences (parent_id)
    VALUES (NEW.id)
    ON CONFLICT (parent_id) DO NOTHING;
  END IF;

  IF user_role = 'student' THEN
    BEGIN
      user_age := NULLIF(NEW.raw_user_meta_data->>'age', '')::integer;
    EXCEPTION WHEN others THEN
      user_age := NULL;
    END;

    -- AGE-FIRST routing per Engleuphoria Age-Hub Logic
    IF user_age IS NOT NULL THEN
      IF user_age >= 17 THEN
        resolved_level := 'professional';   -- "success" hub maps to professional
      ELSIF user_age >= 10 THEN
        resolved_level := 'academy';
      ELSE
        resolved_level := 'playground';     -- includes <4 safety fallback
      END IF;
    ELSE
      hub_meta := NEW.raw_user_meta_data->>'hub_type';
      CASE hub_meta
        WHEN 'academy'                    THEN resolved_level := 'academy';
        WHEN 'professional', 'success'    THEN resolved_level := 'professional';
        ELSE                                   resolved_level := 'playground';
      END CASE;
    END IF;

    INSERT INTO public.student_profiles (user_id, student_level, age, onboarding_completed)
    VALUES (NEW.id, resolved_level, user_age, false)
    ON CONFLICT (user_id) DO UPDATE
      SET student_level = EXCLUDED.student_level,
          age           = COALESCE(EXCLUDED.age, public.student_profiles.age);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Existing parent accounts (admin-created) never got a parent_profiles row.
INSERT INTO public.parent_profiles (user_id, full_name)
SELECT ur.user_id, COALESCE(u.full_name, split_part(u.email, '@', 1), 'Parent')
FROM public.user_roles ur
JOIN public.users u ON u.id = ur.user_id
WHERE ur.role = 'parent'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.parent_notification_preferences (parent_id)
SELECT pp.user_id FROM public.parent_profiles pp
ON CONFLICT (parent_id) DO NOTHING;
