-- Create generation history table to track all lesson generation attempts
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  topic TEXT NOT NULL,
  system_type TEXT NOT NULL,
  cefr_level TEXT,
  age_group TEXT,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL CHECK (status IN ('pending', 'generating', 'success', 'failed', 'cancelled')),
  duration_seconds INTEGER,
  validation_score INTEGER,
  validation_issues JSONB,
  error_message TEXT,
  lesson_id UUID REFERENCES public.curriculum_lessons(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for admins only
CREATE POLICY "Admins can view all generation history"
  ON public.generation_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert generation history"
  ON public.generation_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update generation history"
  ON public.generation_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Create index for fast lookups
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);
CREATE INDEX idx_generation_history_status ON public.generation_history(status);
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);