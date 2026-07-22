-- Add missing systematic_lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.systematic_lessons (
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

-- Enable RLS if table was created
ALTER TABLE public.systematic_lessons ENABLE ROW LEVEL SECURITY;

-- Add RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'systematic_lessons' 
    AND policyname = 'Anyone can view published lessons'
  ) THEN
    CREATE POLICY "Anyone can view published lessons" 
    ON public.systematic_lessons FOR SELECT 
    USING (status = 'published' OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin')
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'systematic_lessons' 
    AND policyname = 'Teachers can manage lessons'
  ) THEN
    CREATE POLICY "Teachers can manage lessons" 
    ON public.systematic_lessons FOR ALL 
    USING (EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin')
    ));
  END IF;
END
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_systematic_lessons_level ON public.systematic_lessons(curriculum_level_id);
CREATE INDEX IF NOT EXISTS idx_systematic_lessons_number ON public.systematic_lessons(lesson_number);

-- Add trigger for updating timestamps
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_systematic_lessons_updated_at'
  ) THEN
    CREATE TRIGGER update_systematic_lessons_updated_at
      BEFORE UPDATE ON public.systematic_lessons
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;