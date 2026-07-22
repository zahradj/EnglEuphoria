-- Saved Games library for teachers
CREATE TABLE IF NOT EXISTS public.saved_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  age_level TEXT,
  game_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_games_teacher_id ON public.saved_games(teacher_id);
CREATE INDEX IF NOT EXISTS idx_saved_games_created_at ON public.saved_games(created_at DESC);

ALTER TABLE public.saved_games ENABLE ROW LEVEL SECURITY;

-- Teachers manage their own games
CREATE POLICY "Teachers can view their own saved games"
ON public.saved_games FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own saved games"
ON public.saved_games FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own saved games"
ON public.saved_games FOR UPDATE
TO authenticated
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own saved games"
ON public.saved_games FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);

-- Admin override (uses existing has_role helper)
CREATE POLICY "Admins can view all saved games"
ON public.saved_games FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_saved_games_updated_at
BEFORE UPDATE ON public.saved_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();