CREATE TABLE public.remedial_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  source_lesson_id UUID,
  generated_lesson_id UUID,
  retest_lesson_id UUID,
  kind TEXT NOT NULL CHECK (kind IN ('unit','micro')),
  failed_tags TEXT[] NOT NULL DEFAULT '{}',
  attempt_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','exhausted')),
  hub TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE ON public.remedial_lessons TO authenticated;
GRANT ALL ON public.remedial_lessons TO service_role;

ALTER TABLE public.remedial_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view their own remedial lessons"
  ON public.remedial_lessons FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students insert their own remedial lessons"
  ON public.remedial_lessons FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students update their own remedial lessons"
  ON public.remedial_lessons FOR UPDATE TO authenticated
  USING (auth.uid() = student_id);

CREATE INDEX idx_remedial_lessons_student_status ON public.remedial_lessons(student_id, status);

ALTER TABLE public.scaffold_strike_events ADD COLUMN IF NOT EXISTS phase TEXT;