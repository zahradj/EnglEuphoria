-- Create curriculum structure tables
CREATE TABLE public.curriculum_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  level_order INTEGER NOT NULL,
  description TEXT,
  target_lessons INTEGER DEFAULT 50,
  estimated_hours INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create systematic lessons table
CREATE TABLE public.systematic_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_level_id UUID NOT NULL REFERENCES public.curriculum_levels(id),
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  grammar_focus TEXT,
  vocabulary_set JSONB DEFAULT '[]'::jsonb,
  communication_outcome TEXT,
  lesson_objectives JSONB DEFAULT '[]'::jsonb,
  slides_content JSONB DEFAULT '{}'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  gamified_elements JSONB DEFAULT '{}'::jsonb,
  is_review_lesson BOOLEAN DEFAULT false,
  prerequisite_lessons TEXT[],
  difficulty_level INTEGER DEFAULT 1,
  estimated_duration INTEGER DEFAULT 45,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(curriculum_level_id, lesson_number)
);

-- Create student curriculum progress table
CREATE TABLE public.student_curriculum_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  curriculum_level_id UUID NOT NULL REFERENCES public.curriculum_levels(id),
  current_lesson_number INTEGER DEFAULT 1,
  completed_lessons INTEGER[] DEFAULT '{}',
  mastered_vocabulary JSONB DEFAULT '[]'::jsonb,
  grammar_mastery JSONB DEFAULT '{}'::jsonb,
  overall_progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  badges_earned JSONB DEFAULT '[]'::jsonb,
  total_points INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, curriculum_level_id)
);

-- Insert default CEFR levels
INSERT INTO public.curriculum_levels (name, cefr_level, level_order, description, target_lessons) VALUES
('True Beginner', 'Pre-A1', 0, 'Complete beginners with no English knowledge', 40),
('Elementary Starter', 'A1', 1, 'Basic everyday expressions and simple interactions', 50),
('Pre-Intermediate', 'A2', 2, 'Understanding frequently used expressions', 50),
('Intermediate', 'B1', 3, 'Dealing with most situations in English-speaking areas', 50),
('Upper-Intermediate', 'B2', 4, 'Understanding complex texts and abstract topics', 50),
('Advanced', 'C1', 5, 'Flexible and effective use of language', 50),
('Proficiency', 'C2', 6, 'Near-native speaker fluency and understanding', 50);

-- Enable RLS
ALTER TABLE public.curriculum_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systematic_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_curriculum_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curriculum_levels
CREATE POLICY "Anyone can view curriculum levels" 
ON public.curriculum_levels FOR SELECT USING (true);

CREATE POLICY "Teachers can manage curriculum levels" 
ON public.curriculum_levels FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.role = 'teacher'
));

-- RLS Policies for systematic_lessons
CREATE POLICY "Anyone can view published lessons" 
ON public.systematic_lessons FOR SELECT 
USING (status = 'published' OR EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin')
));

CREATE POLICY "Teachers can manage lessons" 
ON public.systematic_lessons FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin')
));

-- RLS Policies for student progress
CREATE POLICY "Students can view their own progress" 
ON public.student_curriculum_progress FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" 
ON public.student_curriculum_progress FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "System can insert progress records" 
ON public.student_curriculum_progress FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view student progress" 
ON public.student_curriculum_progress FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin')
));

-- Create indexes for performance
CREATE INDEX idx_systematic_lessons_level ON public.systematic_lessons(curriculum_level_id);
CREATE INDEX idx_systematic_lessons_number ON public.systematic_lessons(lesson_number);
CREATE INDEX idx_student_progress_student ON public.student_curriculum_progress(student_id);
CREATE INDEX idx_student_progress_level ON public.student_curriculum_progress(curriculum_level_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_curriculum_levels_updated_at
  BEFORE UPDATE ON public.curriculum_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_systematic_lessons_updated_at
  BEFORE UPDATE ON public.systematic_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON public.student_curriculum_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();