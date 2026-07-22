
CREATE TABLE public.playground_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id TEXT,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | rendering | ready | failed
  provider TEXT NOT NULL DEFAULT 'replicate',
  prediction_id TEXT,
  source_image_url TEXT,
  storage_path TEXT,
  video_url TEXT,
  duration_sec NUMERIC,
  youtube_video_id TEXT,
  youtube_url TEXT,
  youtube_status TEXT, -- pending | uploaded | failed
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.playground_videos TO authenticated;
GRANT ALL ON public.playground_videos TO service_role;

ALTER TABLE public.playground_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own videos"
  ON public.playground_videos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_playground_videos_updated
  BEFORE UPDATE ON public.playground_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage RLS: users access only their own folder in playground-videos
CREATE POLICY "video owners read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'playground-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "video owners insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'playground-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "video owners delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'playground-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
