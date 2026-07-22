-- Create tables for content generation orchestration
CREATE TABLE IF NOT EXISTS public.content_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  failed_lessons INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  job_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_generation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.content_generation_jobs(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons_content(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  generated_slides_count INTEGER DEFAULT 0,
  media_enriched BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for slides media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('slides-media', 'slides-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for content generation tables
ALTER TABLE public.content_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view generation jobs" 
ON public.content_generation_jobs FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage generation jobs" 
ON public.content_generation_jobs FOR ALL 
USING (true);

CREATE POLICY "Authenticated users can view generation tasks" 
ON public.content_generation_tasks FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage generation tasks" 
ON public.content_generation_tasks FOR ALL 
USING (true);

-- Storage policies for slides media
CREATE POLICY "Public access to slides media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'slides-media');

CREATE POLICY "System can upload slides media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'slides-media');

CREATE POLICY "System can update slides media" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'slides-media');

-- Triggers for updated_at
CREATE TRIGGER update_content_generation_jobs_updated_at
BEFORE UPDATE ON public.content_generation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_generation_tasks_updated_at
BEFORE UPDATE ON public.content_generation_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();