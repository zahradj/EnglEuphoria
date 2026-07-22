-- Add new columns for comprehensive lesson structure
ALTER TABLE public.early_learners_lessons 
  ADD COLUMN IF NOT EXISTS components JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS multimedia_manifest JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gamification JSONB DEFAULT '{}'::jsonb;

-- Create multimedia generation queue table
CREATE TABLE IF NOT EXISTS public.multimedia_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.early_learners_lessons(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'audio')),
  asset_purpose TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'complete', 'failed')),
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_multimedia_queue_lesson 
  ON public.multimedia_generation_queue(lesson_id);
CREATE INDEX IF NOT EXISTS idx_multimedia_queue_status 
  ON public.multimedia_generation_queue(status);

-- RLS for multimedia queue
ALTER TABLE public.multimedia_generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage multimedia queue"
  ON public.multimedia_generation_queue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );