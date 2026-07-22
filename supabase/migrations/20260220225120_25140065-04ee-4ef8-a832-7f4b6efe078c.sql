
-- Create daily_lessons table for tracking AI-generated personalized lessons
CREATE TABLE IF NOT EXISTS public.daily_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_level TEXT NOT NULL DEFAULT 'academy' CHECK (student_level IN ('playground', 'academy', 'professional')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one lesson per student per day
CREATE UNIQUE INDEX IF NOT EXISTS daily_lessons_student_date_idx 
  ON public.daily_lessons (student_id, lesson_date);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS daily_lessons_student_id_idx ON public.daily_lessons (student_id);
CREATE INDEX IF NOT EXISTS daily_lessons_email_sent_idx ON public.daily_lessons (email_sent) WHERE email_sent = false;

-- Enable RLS
ALTER TABLE public.daily_lessons ENABLE ROW LEVEL SECURITY;

-- Students can read their own lessons
CREATE POLICY "Students can view own daily lessons"
  ON public.daily_lessons
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own lessons (generated client-side via hook)
CREATE POLICY "Students can insert own daily lessons"
  ON public.daily_lessons
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own lessons (e.g., mark email_sent)
CREATE POLICY "Students can update own daily lessons"
  ON public.daily_lessons
  FOR UPDATE
  USING (auth.uid() = student_id);
