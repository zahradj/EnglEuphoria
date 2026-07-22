
-- 1) lesson_videos: canonical per-lesson video record
CREATE TABLE public.lesson_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  prompt_used TEXT,
  video_url TEXT NOT NULL,
  starting_frame_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 5,
  source TEXT NOT NULL DEFAULT 'ai_generated' CHECK (source IN ('ai_generated','teacher_upload')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  cefr TEXT,
  hub TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  replaced_at TIMESTAMPTZ
);

CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos(lesson_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_videos TO authenticated;
GRANT ALL ON public.lesson_videos TO service_role;

ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read lesson videos"
  ON public.lesson_videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators manage their lesson videos"
  ON public.lesson_videos FOR ALL
  TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'content_creator'::app_role))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'content_creator'::app_role));

CREATE TRIGGER trg_lesson_videos_updated_at
  BEFORE UPDATE ON public.lesson_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) video_generation_cache: reuse renders across identical prompts
CREATE TABLE public.video_generation_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  prompt TEXT NOT NULL,
  cefr TEXT,
  hub TEXT,
  video_url TEXT NOT NULL,
  starting_frame_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 5,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_video_generation_cache_key ON public.video_generation_cache(cache_key);

GRANT SELECT ON public.video_generation_cache TO authenticated;
GRANT ALL ON public.video_generation_cache TO service_role;

ALTER TABLE public.video_generation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read video cache"
  ON public.video_generation_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER trg_video_generation_cache_updated_at
  BEFORE UPDATE ON public.video_generation_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) curriculum_lessons pointer
ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS video_lesson_id UUID REFERENCES public.lesson_videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS video_lesson_enabled BOOLEAN NOT NULL DEFAULT false;

-- 4) Storage policies on the lesson-videos bucket
CREATE POLICY "Authenticated can read lesson-videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'lesson-videos');

CREATE POLICY "Creators can upload to lesson-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-videos'
    AND (public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'content_creator'::app_role)
      OR public.has_role(auth.uid(), 'teacher'::app_role))
  );

CREATE POLICY "Creators can update their lesson-videos objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lesson-videos'
    AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Creators can delete their lesson-videos objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lesson-videos'
    AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  );
