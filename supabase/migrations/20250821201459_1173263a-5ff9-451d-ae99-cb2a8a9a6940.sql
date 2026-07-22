-- Create lessons table for storing AI-generated lesson content
CREATE TABLE IF NOT EXISTS public.lessons_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL,
  cefr_level text NOT NULL DEFAULT 'A1',
  module_number integer NOT NULL DEFAULT 1,
  lesson_number integer NOT NULL DEFAULT 1,
  slides_content jsonb NOT NULL DEFAULT '{}',
  learning_objectives text[] DEFAULT '{}',
  vocabulary_focus text[] DEFAULT '{}',
  grammar_focus text[] DEFAULT '{}',
  duration_minutes integer DEFAULT 60,
  difficulty_level text DEFAULT 'beginner',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.lessons_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can create lessons"
ON public.lessons_content
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can view lessons"
ON public.lessons_content
FOR SELECT
USING (is_active = true);

CREATE POLICY "Teachers can update their own lessons"
ON public.lessons_content
FOR UPDATE
USING (auth.uid() = created_by);

-- Create index for better performance
CREATE INDEX idx_lessons_content_cefr_level ON public.lessons_content(cefr_level);
CREATE INDEX idx_lessons_content_module_lesson ON public.lessons_content(module_number, lesson_number);

-- Create trigger for updated_at
CREATE TRIGGER update_lessons_content_updated_at
BEFORE UPDATE ON public.lessons_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();