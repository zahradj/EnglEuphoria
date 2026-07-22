
-- Speaking & Fluency Optimization Engine tables

CREATE TABLE public.speaking_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  hub text NOT NULL CHECK (hub IN ('playground','academy','success')),
  fluency_score numeric NOT NULL DEFAULT 0,
  confidence_score numeric NOT NULL DEFAULT 0,
  current_rung text NOT NULL DEFAULT 'repetition' CHECK (current_rung IN ('repetition','cued','guided','free','spontaneous')),
  mean_length_utterance numeric NOT NULL DEFAULT 0,
  hesitation_ratio numeric NOT NULL DEFAULT 0,
  connected_speech_score numeric NOT NULL DEFAULT 0,
  bravery_count integer NOT NULL DEFAULT 0,
  last_assessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, hub)
);
CREATE INDEX idx_speaking_profile_student ON public.speaking_profile(student_id, hub);

CREATE TABLE public.speaking_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  hub text NOT NULL CHECK (hub IN ('playground','academy','success')),
  lesson_id uuid,
  slide_id text,
  task_type text NOT NULL,
  rung text NOT NULL CHECK (rung IN ('repetition','cued','guided','free','spontaneous')),
  scenario_key text,
  target_text text,
  transcript text,
  duration_ms integer NOT NULL DEFAULT 0,
  wpm numeric NOT NULL DEFAULT 0,
  hesitations integer NOT NULL DEFAULT 0,
  bravery_bonus boolean NOT NULL DEFAULT false,
  success boolean NOT NULL DEFAULT false,
  pronunciation_attempt_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_speaking_attempts_student_time ON public.speaking_attempts(student_id, created_at DESC);
CREATE INDEX idx_speaking_attempts_lesson ON public.speaking_attempts(lesson_id);

CREATE TABLE public.speaking_task_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  hub text NOT NULL CHECK (hub IN ('playground','academy','success')),
  task_type text NOT NULL,
  scenario_key text NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  use_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, task_type, scenario_key)
);
CREATE INDEX idx_speaking_task_history_student ON public.speaking_task_history(student_id, last_used_at DESC);

CREATE TABLE public.fluency_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  hub text NOT NULL CHECK (hub IN ('playground','academy','success')),
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fluency_snapshots_student_time ON public.fluency_snapshots(student_id, created_at DESC);

-- RLS
ALTER TABLE public.speaking_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluency_snapshots ENABLE ROW LEVEL SECURITY;

-- Students: full access to their own rows
CREATE POLICY "students_own_speaking_profile" ON public.speaking_profile
  FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "students_own_speaking_attempts" ON public.speaking_attempts
  FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "students_own_speaking_task_history" ON public.speaking_task_history
  FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "students_own_fluency_snapshots" ON public.fluency_snapshots
  FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Teachers: read access for students they have bookings with
CREATE POLICY "teachers_read_speaking_profile" ON public.speaking_profile
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = speaking_profile.student_id AND cb.teacher_id = auth.uid()
  ));
CREATE POLICY "teachers_read_speaking_attempts" ON public.speaking_attempts
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = speaking_attempts.student_id AND cb.teacher_id = auth.uid()
  ));
CREATE POLICY "teachers_read_fluency_snapshots" ON public.fluency_snapshots
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.student_id = fluency_snapshots.student_id AND cb.teacher_id = auth.uid()
  ));

-- Admins: full access
CREATE POLICY "admins_all_speaking_profile" ON public.speaking_profile
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins_all_speaking_attempts" ON public.speaking_attempts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins_all_speaking_task_history" ON public.speaking_task_history
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins_all_fluency_snapshots" ON public.fluency_snapshots
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- updated_at triggers
CREATE TRIGGER update_speaking_profile_updated_at BEFORE UPDATE ON public.speaking_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_speaking_task_history_updated_at BEFORE UPDATE ON public.speaking_task_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fluency_snapshots_updated_at BEFORE UPDATE ON public.fluency_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
