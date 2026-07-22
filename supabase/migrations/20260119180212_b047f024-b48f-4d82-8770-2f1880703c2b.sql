-- Create exports storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Create export history table
CREATE TABLE IF NOT EXISTS public.curriculum_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  format TEXT NOT NULL,
  lesson_count INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE public.curriculum_exports ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view exports
CREATE POLICY "Authenticated users can view exports" 
ON public.curriculum_exports 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert exports
CREATE POLICY "Authenticated users can create exports" 
ON public.curriculum_exports 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Storage policies for exports bucket
CREATE POLICY "Authenticated users can upload exports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read exports"
ON storage.objects FOR SELECT
USING (bucket_id = 'exports' AND auth.role() = 'authenticated');