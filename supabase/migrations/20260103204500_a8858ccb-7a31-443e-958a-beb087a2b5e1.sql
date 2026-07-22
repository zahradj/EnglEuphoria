-- Iron LMS Database Schema

-- Add cohort_group to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cohort_group TEXT CHECK (cohort_group IN ('A', 'B', 'C'));

-- Create iron_modules table for curriculum structure
CREATE TABLE IF NOT EXISTS public.iron_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  module_number INTEGER NOT NULL,
  cohort_group TEXT NOT NULL CHECK (cohort_group IN ('A', 'B', 'C')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create iron_lessons table for PPP lessons
CREATE TABLE IF NOT EXISTS public.iron_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cohort_group TEXT NOT NULL CHECK (cohort_group IN ('A', 'B', 'C')),
  module_id UUID REFERENCES public.iron_modules(id) ON DELETE SET NULL,
  cefr_level TEXT,
  presentation_content JSONB NOT NULL DEFAULT '{}',
  practice_content JSONB NOT NULL DEFAULT '{"taskA": {}, "taskB": {}, "taskC": {}}',
  production_content JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'locked', 'live')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create iron_lesson_progress table for student progress tracking
CREATE TABLE IF NOT EXISTS public.iron_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.iron_lessons(id) ON DELETE CASCADE,
  current_phase TEXT DEFAULT 'presentation' CHECK (current_phase IN ('presentation', 'practice', 'production', 'completed')),
  presentation_completed BOOLEAN DEFAULT false,
  practice_completion JSONB DEFAULT '{"taskA": false, "taskB": false, "taskC": false}',
  production_submitted BOOLEAN DEFAULT false,
  production_response TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.iron_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iron_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iron_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Iron Modules policies (admins can manage, all authenticated can read)
CREATE POLICY "Admins can manage iron_modules"
ON public.iron_modules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Authenticated users can view iron_modules"
ON public.iron_modules FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Iron Lessons policies
CREATE POLICY "Admins can manage iron_lessons"
ON public.iron_lessons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Students can view live lessons for their cohort"
ON public.iron_lessons FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  status = 'live' AND
  cohort_group = (
    SELECT cohort_group FROM public.users WHERE id = auth.uid()
  )
);

-- Iron Lesson Progress policies
CREATE POLICY "Students can manage their own progress"
ON public.iron_lesson_progress FOR ALL
USING (student_id = auth.uid());

CREATE POLICY "Admins can view all progress"
ON public.iron_lesson_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_iron_lessons_cohort ON public.iron_lessons(cohort_group);
CREATE INDEX IF NOT EXISTS idx_iron_lessons_status ON public.iron_lessons(status);
CREATE INDEX IF NOT EXISTS idx_iron_lessons_module ON public.iron_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_iron_modules_cohort ON public.iron_modules(cohort_group);
CREATE INDEX IF NOT EXISTS idx_iron_progress_student ON public.iron_lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_iron_progress_lesson ON public.iron_lesson_progress(lesson_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_iron_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER iron_modules_updated_at
BEFORE UPDATE ON public.iron_modules
FOR EACH ROW EXECUTE FUNCTION update_iron_updated_at();

CREATE TRIGGER iron_lessons_updated_at
BEFORE UPDATE ON public.iron_lessons
FOR EACH ROW EXECUTE FUNCTION update_iron_updated_at();

CREATE TRIGGER iron_lesson_progress_updated_at
BEFORE UPDATE ON public.iron_lesson_progress
FOR EACH ROW EXECUTE FUNCTION update_iron_updated_at();