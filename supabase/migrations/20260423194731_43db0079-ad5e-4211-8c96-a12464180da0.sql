-- 1. Add age column to student_profiles (the project's profile table; there is no public.profiles)
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS age integer;

-- 2. Rewrite handle_new_user so the AGE in signup metadata is the source of truth
--    for the student's hub. hub_type metadata is kept as a secondary fallback.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role        TEXT;
  user_full_name   TEXT;
  hub_meta         TEXT;
  user_age         INTEGER;
  resolved_level   public.student_level;
BEGIN
  user_role      := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
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

  IF user_role = 'student' THEN
    -- Parse age safely (NULL if missing or non-numeric)
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
      -- Fallback: honor hub_type metadata if age is absent
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