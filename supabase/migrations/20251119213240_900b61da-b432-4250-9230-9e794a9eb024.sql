-- Early Learners Lessons Table
CREATE TABLE public.early_learners_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  phonics_focus TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Slides Table
CREATE TABLE public.early_learners_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES early_learners_lessons(id) ON DELETE CASCADE NOT NULL,
  slide_number INTEGER NOT NULL,
  slide_type TEXT NOT NULL CHECK (slide_type IN ('warmup', 'phonics_intro', 'letter_sound_practice', 'word_blending', 'drag_drop_game', 'matching_game', 'listening_exercise', 'speaking_practice', 'assessment', 'reward')),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_prompt TEXT,
  image_url TEXT,
  audio_text TEXT,
  audio_url TEXT,
  phonics_sounds JSONB DEFAULT '[]'::jsonb,
  interactive_elements JSONB DEFAULT '[]'::jsonb,
  gamification JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, slide_number)
);

-- Multimedia Assets Cache Table
CREATE TABLE public.early_learners_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'audio', 'phonics')),
  prompt TEXT NOT NULL,
  asset_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  cache_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Progress Table
CREATE TABLE public.early_learners_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  lesson_id UUID REFERENCES early_learners_lessons(id) NOT NULL,
  slide_id UUID REFERENCES early_learners_slides(id),
  score INTEGER,
  stars_earned INTEGER CHECK (stars_earned >= 0 AND stars_earned <= 3),
  badges_earned JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 1,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.early_learners_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_learners_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_learners_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_learners_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for early_learners_lessons
CREATE POLICY "Admins can manage all lessons"
  ON public.early_learners_lessons
  FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view published lessons"
  ON public.early_learners_lessons
  FOR SELECT
  USING (
    status = 'published' 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students can view published lessons"
  ON public.early_learners_lessons
  FOR SELECT
  USING (status = 'published');

-- RLS Policies for early_learners_slides
CREATE POLICY "Admins can manage all slides"
  ON public.early_learners_slides
  FOR ALL
  USING (is_user_admin());

CREATE POLICY "Users can view slides from accessible lessons"
  ON public.early_learners_slides
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.early_learners_lessons 
      WHERE id = early_learners_slides.lesson_id 
      AND (status = 'published' OR is_user_admin())
    )
  );

-- RLS Policies for early_learners_assets
CREATE POLICY "Admins can manage all assets"
  ON public.early_learners_assets
  FOR ALL
  USING (is_user_admin());

CREATE POLICY "Authenticated users can view assets"
  ON public.early_learners_assets
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for early_learners_progress
CREATE POLICY "Students can manage their own progress"
  ON public.early_learners_progress
  FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers and admins can view all progress"
  ON public.early_learners_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_early_learners_lessons_status ON public.early_learners_lessons(status);
CREATE INDEX idx_early_learners_lessons_difficulty ON public.early_learners_lessons(difficulty_level);
CREATE INDEX idx_early_learners_slides_lesson_id ON public.early_learners_slides(lesson_id);
CREATE INDEX idx_early_learners_slides_type ON public.early_learners_slides(slide_type);
CREATE INDEX idx_early_learners_progress_student ON public.early_learners_progress(student_id);
CREATE INDEX idx_early_learners_progress_lesson ON public.early_learners_progress(lesson_id);
CREATE INDEX idx_early_learners_assets_cache ON public.early_learners_assets(cache_key);

-- Create trigger for updated_at on lessons
CREATE TRIGGER update_early_learners_lessons_updated_at
  BEFORE UPDATE ON public.early_learners_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();