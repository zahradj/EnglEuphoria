-- Create student slide progress tracking table
CREATE TABLE IF NOT EXISTS public.student_slide_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL,
  slide_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  accuracy_score NUMERIC(5,2),
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student badges table
CREATE TABLE IF NOT EXISTS public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  criteria_met JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning streaks table
CREATE TABLE IF NOT EXISTS public.learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  streak_type TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, streak_type)
);

-- Enable RLS
ALTER TABLE public.student_slide_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_slide_progress
CREATE POLICY "Users can view their own slide progress"
  ON public.student_slide_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own slide progress"
  ON public.student_slide_progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own slide progress"
  ON public.student_slide_progress FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS Policies for student_badges
CREATE POLICY "Users can view their own badges"
  ON public.student_badges FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own badges"
  ON public.student_badges FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- RLS Policies for learning_streaks
CREATE POLICY "Users can view their own streaks"
  ON public.learning_streaks FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own streaks"
  ON public.learning_streaks FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own streaks"
  ON public.learning_streaks FOR UPDATE
  USING (auth.uid() = student_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_slide_progress_student ON public.student_slide_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_slide_progress_lesson ON public.student_slide_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_streaks_student ON public.learning_streaks(student_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_student_slide_progress_updated_at ON public.student_slide_progress;
CREATE TRIGGER update_student_slide_progress_updated_at
  BEFORE UPDATE ON public.student_slide_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_streaks_updated_at ON public.learning_streaks;
CREATE TRIGGER update_learning_streaks_updated_at
  BEFORE UPDATE ON public.learning_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();