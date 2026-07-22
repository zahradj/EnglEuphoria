
CREATE TABLE IF NOT EXISTS public.student_motivation_profile (
  student_id UUID PRIMARY KEY,
  profile_type TEXT NOT NULL DEFAULT 'balanced',
  encouragement_style TEXT NOT NULL DEFAULT 'supportive',
  reward_density TEXT NOT NULL DEFAULT 'medium',
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_recomputed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_motivation_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "motivation_self_select" ON public.student_motivation_profile FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "motivation_self_insert" ON public.student_motivation_profile FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "motivation_self_update" ON public.student_motivation_profile FOR UPDATE USING (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.student_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  lesson_id UUID,
  narrative JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_missions_student ON public.student_missions(student_id, status);
ALTER TABLE public.student_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "missions_self_select" ON public.student_missions FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "missions_self_insert" ON public.student_missions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "missions_self_update" ON public.student_missions FOR UPDATE USING (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.student_skill_tree (
  student_id UUID NOT NULL,
  hub TEXT NOT NULL,
  tree JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, hub)
);
ALTER TABLE public.student_skill_tree ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skilltree_self_select" ON public.student_skill_tree FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "skilltree_self_insert" ON public.student_skill_tree FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "skilltree_self_update" ON public.student_skill_tree FOR UPDATE USING (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS public.celebration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  trigger_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  shown_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_celebration_events_student ON public.celebration_events(student_id, created_at DESC);
ALTER TABLE public.celebration_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "celebration_self_select" ON public.celebration_events FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "celebration_self_update" ON public.celebration_events FOR UPDATE USING (auth.uid() = student_id);

ALTER TABLE public.student_xp
  ADD COLUMN IF NOT EXISTS streak_freezes_remaining INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS motivation_last_signal TIMESTAMPTZ;
