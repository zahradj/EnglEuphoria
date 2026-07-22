
-- =========================
-- Learner Profiles
-- =========================
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  student_id UUID PRIMARY KEY,
  hub TEXT,
  cefr_level TEXT,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own profile"
  ON public.learner_profiles FOR SELECT
  USING (auth.uid() = student_id
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students upsert own profile"
  ON public.learner_profiles FOR INSERT
  WITH CHECK (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students update own profile"
  ON public.learner_profiles FOR UPDATE
  USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete profiles"
  ON public.learner_profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- Skill Mastery
-- =========================
CREATE TABLE IF NOT EXISTS public.skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  skill_domain TEXT NOT NULL,
  skill_key TEXT NOT NULL,
  mastery NUMERIC NOT NULL DEFAULT 0,
  confidence NUMERIC NOT NULL DEFAULT 0,
  trend TEXT NOT NULL DEFAULT 'stable',
  review_priority TEXT NOT NULL DEFAULT 'low',
  exposures INTEGER NOT NULL DEFAULT 0,
  communicative_uses INTEGER NOT NULL DEFAULT 0,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, skill_domain, skill_key)
);
CREATE INDEX IF NOT EXISTS idx_skill_mastery_student ON public.skill_mastery(student_id);
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own mastery"
  ON public.skill_mastery FOR SELECT
  USING (auth.uid() = student_id
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins write mastery"
  ON public.skill_mastery FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students insert own mastery"
  ON public.skill_mastery FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students update own mastery"
  ON public.skill_mastery FOR UPDATE
  USING (auth.uid() = student_id);

-- =========================
-- Review Queue
-- =========================
CREATE TABLE IF NOT EXISTS public.review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  priority INTEGER NOT NULL DEFAULT 0,
  interval_days NUMERIC NOT NULL DEFAULT 1,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  repetitions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_review_queue_due ON public.review_queue(student_id, due_at);
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own review queue"
  ON public.review_queue FOR SELECT
  USING (auth.uid() = student_id
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students insert own review items"
  ON public.review_queue FOR INSERT
  WITH CHECK (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students update own review items"
  ON public.review_queue FOR UPDATE
  USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete review items"
  ON public.review_queue FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- Engagement Signals
-- =========================
CREATE TABLE IF NOT EXISTS public.engagement_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  lesson_id UUID,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_engagement_student ON public.engagement_signals(student_id, recorded_at DESC);
ALTER TABLE public.engagement_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own engagement"
  ON public.engagement_signals FOR SELECT
  USING (auth.uid() = student_id
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students insert own engagement"
  ON public.engagement_signals FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins manage engagement"
  ON public.engagement_signals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- Extend mistake_repository
-- =========================
ALTER TABLE public.mistake_repository
  ADD COLUMN IF NOT EXISTS pattern_category TEXT,
  ADD COLUMN IF NOT EXISTS frequency_score NUMERIC NOT NULL DEFAULT 0;

-- =========================
-- updated_at triggers
-- =========================
CREATE TRIGGER trg_learner_profiles_updated
  BEFORE UPDATE ON public.learner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_skill_mastery_updated
  BEFORE UPDATE ON public.skill_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_review_queue_updated
  BEFORE UPDATE ON public.review_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Security fix: teacher_payouts self-write
-- =========================
DROP POLICY IF EXISTS teacher_payouts_insert ON public.teacher_payouts;
DROP POLICY IF EXISTS teacher_payouts_update ON public.teacher_payouts;

CREATE POLICY "Admins insert payouts"
  ON public.teacher_payouts FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update payouts"
  ON public.teacher_payouts FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
