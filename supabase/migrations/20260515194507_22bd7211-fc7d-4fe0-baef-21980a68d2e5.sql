
ALTER TABLE public.lesson_feedback_submissions
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_lesson_feedback_student_submitted
  ON public.lesson_feedback_submissions(student_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS public.student_cefr_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE,
  level text NOT NULL DEFAULT 'A1' CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  percent_to_next integer NOT NULL DEFAULT 0 CHECK (percent_to_next BETWEEN 0 AND 100),
  last_updated timestamptz NOT NULL DEFAULT now(),
  updated_by_teacher_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_cefr_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cefr_select_own_or_staff" ON public.student_cefr_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher'));
CREATE POLICY "cefr_insert_self_or_staff" ON public.student_cefr_progress FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher'));
CREATE POLICY "cefr_update_staff_only" ON public.student_cefr_progress FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher'));

CREATE TABLE IF NOT EXISTS public.vocabulary_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  word text NOT NULL,
  ipa text,
  definition text NOT NULL,
  example text,
  cefr_level text DEFAULT 'A2' CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  hub_scope text[] DEFAULT ARRAY['playground','academy','success']::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(theme, word)
);
ALTER TABLE public.vocabulary_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vocab_bank_read_authenticated" ON public.vocabulary_bank FOR SELECT TO authenticated USING (true);
CREATE POLICY "vocab_bank_admin_write" ON public.vocabulary_bank FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_vocab_bank_theme ON public.vocabulary_bank(theme);

CREATE TABLE IF NOT EXISTS public.speaking_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  teacher_id uuid,
  theme text NOT NULL,
  prompt text NOT NULL,
  audio_path text NOT NULL,
  duration_sec integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','archived')),
  teacher_feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
ALTER TABLE public.speaking_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "speaking_select_own_or_assigned_teacher" ON public.speaking_submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR teacher_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "speaking_insert_self" ON public.speaking_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "speaking_update_teacher_or_admin" ON public.speaking_submissions FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_speaking_student_created ON public.speaking_submissions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speaking_teacher_status ON public.speaking_submissions(teacher_id, status);

CREATE TABLE IF NOT EXISTS public.library_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  completed boolean NOT NULL DEFAULT false,
  UNIQUE(student_id, asset_id)
);
ALTER TABLE public.library_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library_reads_own" ON public.library_reads FOR ALL TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  action text NOT NULL,
  xp integer NOT NULL,
  ref_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xp_events_select_own" ON public.xp_events FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "xp_events_insert_self" ON public.xp_events FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_xp_events_student_created ON public.xp_events(student_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public) VALUES ('phonics-audio','phonics-audio',true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('student-speaking','student-speaking',false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "phonics_audio_public_read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'phonics-audio');
CREATE POLICY "phonics_audio_admin_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'phonics-audio' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "student_speaking_own_read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-speaking' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'teacher')
    )
  );
CREATE POLICY "student_speaking_own_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-speaking'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SECURITY FIXES
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "secure_users_update" ON public.users;

CREATE POLICY "users_update_own_safe_columns" ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
    AND email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "users_update_admin_full" ON public.users FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "teacher_profiles_select_same_market" ON public.teacher_profiles;

CREATE POLICY "teacher_profiles_select_self_or_admin" ON public.teacher_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_user_admin());

DROP VIEW IF EXISTS public.teacher_profiles_public CASCADE;

CREATE VIEW public.teacher_profiles_public AS
SELECT
  id, user_id, bio, profile_image_url, intro_video_url, video_url,
  specializations, rating, total_reviews, hourly_rate_eur, hourly_rate_dzd,
  market_region, languages_spoken, accent, years_experience, hub_role,
  is_available, timezone, created_at
FROM public.teacher_profiles
WHERE COALESCE(profile_approved_by_admin, false) = true
  AND COALESCE(can_teach, false) = true;

GRANT SELECT ON public.teacher_profiles_public TO authenticated, anon;

DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;

CREATE POLICY "teacher_apps_own_folder_read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'teacher-applications' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
    )
  );
