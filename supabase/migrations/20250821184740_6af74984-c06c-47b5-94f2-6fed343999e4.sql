-- Create content generation jobs table for tracking batch operations
CREATE TABLE public.content_generation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  metadata JSONB NOT NULL DEFAULT '{}',
  error_details TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view generation jobs"
  ON public.content_generation_jobs
  FOR SELECT
  USING (true);

CREATE POLICY "System can manage generation jobs"
  ON public.content_generation_jobs
  FOR ALL
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_content_generation_jobs_updated_at
  BEFORE UPDATE ON public.content_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();