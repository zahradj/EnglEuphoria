-- Collaborative slide comments for the Creator Studio
CREATE TABLE public.creator_slide_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL,
  slide_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  body TEXT NOT NULL CHECK (length(trim(body)) > 0 AND length(body) <= 4000),
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_creator_slide_comments_lesson ON public.creator_slide_comments(lesson_id);
CREATE INDEX idx_creator_slide_comments_lesson_slide ON public.creator_slide_comments(lesson_id, slide_id);

ALTER TABLE public.creator_slide_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read/write comments on lessons (collaborative).
-- Tighten later via lesson ownership/sharing if needed.
CREATE POLICY "Authenticated users can view slide comments"
  ON public.creator_slide_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.creator_slide_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own comments"
  ON public.creator_slide_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own comments"
  ON public.creator_slide_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER update_creator_slide_comments_updated_at
  BEFORE UPDATE ON public.creator_slide_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.creator_slide_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_slide_comments;