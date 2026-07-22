
-- Beta Testing & Analytics tables

CREATE TABLE public.lesson_slide_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id UUID,
  slide_index INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  dwell_ms INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_lesson_slide_events_student ON public.lesson_slide_events(student_id, created_at DESC);
CREATE INDEX idx_lesson_slide_events_lesson ON public.lesson_slide_events(lesson_id, slide_index);
ALTER TABLE public.lesson_slide_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own slide events"
ON public.lesson_slide_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students read own slide events"
ON public.lesson_slide_events FOR SELECT TO authenticated
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage slide events"
ON public.lesson_slide_events FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.learner_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  hub TEXT,
  signal_type TEXT NOT NULL,
  severity NUMERIC NOT NULL DEFAULT 0.5,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_lesson_id UUID,
  decay_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_learner_signals_student ON public.learner_signals(student_id, decay_at DESC);
ALTER TABLE public.learner_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own signals"
ON public.learner_signals FOR SELECT TO authenticated
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System inserts learner signals"
ON public.learner_signals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage learner signals"
ON public.learner_signals FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.beta_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scope JSONB NOT NULL,
  metric TEXT NOT NULL,
  p50 NUMERIC,
  p90 NUMERIC,
  sample_size INTEGER NOT NULL DEFAULT 0,
  flag TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_beta_insights_metric ON public.beta_insights(metric, computed_at DESC);
ALTER TABLE public.beta_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage beta insights"
ON public.beta_insights FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.analytics_tuning_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id UUID,
  engine TEXT NOT NULL,
  delta JSONB NOT NULL DEFAULT '{}'::jsonb,
  before_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  after_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_tuning_log_student ON public.analytics_tuning_log(student_id, created_at DESC);
ALTER TABLE public.analytics_tuning_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own tuning log"
ON public.analytics_tuning_log FOR SELECT TO authenticated
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage tuning log"
ON public.analytics_tuning_log FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System inserts tuning log"
ON public.analytics_tuning_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
