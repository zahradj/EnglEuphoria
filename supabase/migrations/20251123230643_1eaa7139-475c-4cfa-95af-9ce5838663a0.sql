-- Create interactive_lessons table for storing library lessons
CREATE TABLE IF NOT EXISTS public.interactive_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Basic info
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  age_group TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  
  -- Learning content
  vocabulary_list TEXT[] NOT NULL DEFAULT '{}',
  grammar_focus TEXT[] NOT NULL DEFAULT '{}',
  learning_objectives TEXT[] NOT NULL DEFAULT '{}',
  selected_activities TEXT[] NOT NULL DEFAULT '{}',
  
  -- Generated content
  screens_data JSONB NOT NULL DEFAULT '[]',
  audio_manifest JSONB NOT NULL DEFAULT '[]',
  
  -- Gamification
  total_xp INTEGER NOT NULL DEFAULT 0,
  badges_available TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft',
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_cefr_level CHECK (cefr_level IN ('Pre-A1', 'A1', 'A2', 'B1', 'B2')),
  CONSTRAINT valid_age_group CHECK (age_group IN ('5-7', '8-11', '12-14', '15-17')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'archived'))
);

-- Enable RLS
ALTER TABLE public.interactive_lessons ENABLE ROW LEVEL SECURITY;

-- Teachers can view all active lessons
CREATE POLICY "Teachers can view active lessons"
ON public.interactive_lessons
FOR SELECT
USING (
  status = 'active' OR 
  created_by = auth.uid()
);

-- Teachers can create lessons
CREATE POLICY "Teachers can create lessons"
ON public.interactive_lessons
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Teachers can update their own lessons
CREATE POLICY "Teachers can update own lessons"
ON public.interactive_lessons
FOR UPDATE
USING (created_by = auth.uid());

-- Teachers can delete their own draft lessons
CREATE POLICY "Teachers can delete own drafts"
ON public.interactive_lessons
FOR DELETE
USING (created_by = auth.uid() AND status = 'draft');

-- Create index for faster queries
CREATE INDEX idx_interactive_lessons_cefr ON public.interactive_lessons(cefr_level);
CREATE INDEX idx_interactive_lessons_age ON public.interactive_lessons(age_group);
CREATE INDEX idx_interactive_lessons_status ON public.interactive_lessons(status);
CREATE INDEX idx_interactive_lessons_created_by ON public.interactive_lessons(created_by);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_interactive_lessons_updated_at
  BEFORE UPDATE ON public.interactive_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_progress_updated_at();