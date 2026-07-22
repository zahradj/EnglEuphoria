-- Create iron_curriculums table to store generated PPP curriculums
CREATE TABLE public.iron_curriculums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('kids', 'teens', 'adults')),
  cefr_level TEXT NOT NULL,
  levels JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create iron_student_progress table to track student progress through Iron curriculums
CREATE TABLE public.iron_student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curriculum_id UUID NOT NULL REFERENCES public.iron_curriculums(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_lesson INTEGER NOT NULL DEFAULT 1,
  current_phase TEXT NOT NULL DEFAULT 'presentation' CHECK (current_phase IN ('presentation', 'practice', 'production')),
  practice_completion JSONB DEFAULT '{"taskA": false, "taskB": false, "taskC": false}',
  production_attempts INTEGER NOT NULL DEFAULT 0,
  production_passed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, curriculum_id)
);

-- Enable Row Level Security
ALTER TABLE public.iron_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iron_student_progress ENABLE ROW LEVEL SECURITY;

-- Policies for iron_curriculums
-- Admins can do everything
CREATE POLICY "Admins can manage all iron curriculums"
ON public.iron_curriculums
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Teachers can view all and create their own
CREATE POLICY "Teachers can view all iron curriculums"
ON public.iron_curriculums
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'teacher'
  )
);

CREATE POLICY "Teachers can create iron curriculums"
ON public.iron_curriculums
FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'teacher'
  )
);

-- Students can view curriculums they're enrolled in
CREATE POLICY "Students can view assigned curriculums"
ON public.iron_curriculums
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.iron_student_progress
    WHERE iron_student_progress.curriculum_id = iron_curriculums.id
    AND iron_student_progress.student_id = auth.uid()
  )
);

-- Policies for iron_student_progress
-- Students can view and update their own progress
CREATE POLICY "Students can view own progress"
ON public.iron_student_progress
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can update own progress"
ON public.iron_student_progress
FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own progress"
ON public.iron_student_progress
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Teachers and admins can view all progress
CREATE POLICY "Teachers can view all student progress"
ON public.iron_student_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('teacher', 'admin')
  )
);

-- Admins can manage all progress
CREATE POLICY "Admins can manage all student progress"
ON public.iron_student_progress
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_iron_curriculums_created_by ON public.iron_curriculums(created_by);
CREATE INDEX idx_iron_curriculums_topic ON public.iron_curriculums(topic);
CREATE INDEX idx_iron_student_progress_student ON public.iron_student_progress(student_id);
CREATE INDEX idx_iron_student_progress_curriculum ON public.iron_student_progress(curriculum_id);

-- Create trigger for updated_at
CREATE TRIGGER update_iron_curriculums_updated_at
BEFORE UPDATE ON public.iron_curriculums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iron_student_progress_updated_at
BEFORE UPDATE ON public.iron_student_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();