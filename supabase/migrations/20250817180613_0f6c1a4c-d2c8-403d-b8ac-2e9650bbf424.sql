-- Create AI lessons table for storing lesson generation requests
CREATE TABLE public.ai_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  cefr_level TEXT NOT NULL DEFAULT 'A2',
  age_group TEXT NOT NULL DEFAULT '9-10',
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  activities TEXT[] NOT NULL DEFAULT '{}',
  generation_prompt TEXT NOT NULL,
  generation_status TEXT NOT NULL DEFAULT 'pending',
  generation_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI lesson artifacts table for storing generated materials
CREATE TABLE public.ai_lesson_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.ai_lessons(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL, -- 'slides', 'worksheet', 'quiz', 'teacher_guide'
  title TEXT NOT NULL,
  content TEXT, -- For text-based content
  file_url TEXT, -- For uploaded files (PDFs, etc.)
  file_type TEXT, -- 'html', 'pdf', 'json', etc.
  metadata JSONB NOT NULL DEFAULT '{}',
  storage_path TEXT, -- Path in Supabase storage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_lesson_artifacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_lessons
CREATE POLICY "Teachers can create their own AI lessons" 
ON public.ai_lessons 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can view their own AI lessons" 
ON public.ai_lessons 
FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own AI lessons" 
ON public.ai_lessons 
FOR UPDATE 
USING (auth.uid() = teacher_id);

-- RLS policies for ai_lesson_artifacts
CREATE POLICY "Teachers can view artifacts from their lessons" 
ON public.ai_lesson_artifacts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ai_lessons 
    WHERE id = ai_lesson_artifacts.lesson_id 
    AND teacher_id = auth.uid()
  )
);

CREATE POLICY "System can insert artifacts" 
ON public.ai_lesson_artifacts 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_ai_lessons_teacher_id ON public.ai_lessons(teacher_id);
CREATE INDEX idx_ai_lessons_status ON public.ai_lessons(generation_status);
CREATE INDEX idx_ai_lesson_artifacts_lesson_id ON public.ai_lesson_artifacts(lesson_id);
CREATE INDEX idx_ai_lesson_artifacts_type ON public.ai_lesson_artifacts(artifact_type);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_lessons_updated_at
  BEFORE UPDATE ON public.ai_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();