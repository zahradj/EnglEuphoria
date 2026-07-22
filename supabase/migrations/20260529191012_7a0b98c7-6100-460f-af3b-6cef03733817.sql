
-- 1. scheduled_lessons
CREATE TABLE IF NOT EXISTS public.scheduled_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  student_id UUID NULL,
  class_id UUID NULL,
  scheduled_for TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_teacher ON public.scheduled_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_student ON public.scheduled_lessons(student_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_lessons TO authenticated;
GRANT ALL ON public.scheduled_lessons TO service_role;

ALTER TABLE public.scheduled_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage their assignments"
ON public.scheduled_lessons FOR ALL
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Students read their assignments"
ON public.scheduled_lessons FOR SELECT
USING (auth.uid() = student_id);

-- 2. daily_discovery_pool
CREATE TABLE IF NOT EXISTS public.daily_discovery_pool (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  hub TEXT NOT NULL,
  game_type TEXT NOT NULL,
  game_payload JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discovery_active ON public.daily_discovery_pool(active, hub);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_discovery_pool TO authenticated;
GRANT ALL ON public.daily_discovery_pool TO service_role;

ALTER TABLE public.daily_discovery_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage their discovery games"
ON public.daily_discovery_pool FOR ALL
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Anyone authenticated reads active discovery games"
ON public.daily_discovery_pool FOR SELECT
USING (active = true);

-- 3. scaffold_strike_events
CREATE TABLE IF NOT EXISTS public.scaffold_strike_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id UUID NULL REFERENCES public.curriculum_lessons(id) ON DELETE SET NULL,
  block_id TEXT NULL,
  target_label TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'vocab',
  strike_level SMALLINT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_strike_lesson ON public.scaffold_strike_events(lesson_id);
CREATE INDEX IF NOT EXISTS idx_strike_target ON public.scaffold_strike_events(target_type, target_label);
CREATE INDEX IF NOT EXISTS idx_strike_occurred ON public.scaffold_strike_events(occurred_at);

GRANT SELECT, INSERT ON public.scaffold_strike_events TO authenticated;
GRANT ALL ON public.scaffold_strike_events TO service_role;

ALTER TABLE public.scaffold_strike_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert their own strikes"
ON public.scaffold_strike_events FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students read their own strikes"
ON public.scaffold_strike_events FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers read all strikes (analytics)"
ON public.scaffold_strike_events FOR SELECT
USING (public.has_role(auth.uid(), 'teacher'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
