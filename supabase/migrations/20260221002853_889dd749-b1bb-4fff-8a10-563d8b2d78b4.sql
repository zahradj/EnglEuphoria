
-- Create student_skills table for persistent skill scores
CREATE TABLE public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL CHECK (skill_name IN (
    'professional_vocabulary', 'fluency', 'grammar_accuracy', 'business_writing', 'listening'
  )),
  current_score NUMERIC(4,1) DEFAULT 0 CHECK (current_score BETWEEN 0 AND 10),
  target_score NUMERIC(4,1) DEFAULT 8 CHECK (target_score BETWEEN 0 AND 10),
  cefr_equivalent TEXT DEFAULT 'A1',
  next_focus TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, skill_name)
);

-- Enable RLS
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;

-- Students can read their own skills
CREATE POLICY "Students can view own skills"
  ON public.student_skills FOR SELECT
  USING (student_id = auth.uid());

-- Students can insert their own (for placement test seeding)
CREATE POLICY "Students can insert own skills"
  ON public.student_skills FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Admins and teachers can update any student skills
CREATE POLICY "Teachers and admins can update skills"
  ON public.student_skills FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'teacher')
  );

-- Admins can view all skills
CREATE POLICY "Admins can view all skills"
  ON public.student_skills FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Teachers can view their students' skills
CREATE POLICY "Teachers can view student skills"
  ON public.student_skills FOR SELECT
  USING (public.has_role(auth.uid(), 'teacher'));
