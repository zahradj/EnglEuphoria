CREATE TABLE IF NOT EXISTS public.learning_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('sentence_builder','verb_trio','interview','sorting')),
  level TEXT NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  title TEXT NOT NULL,
  description TEXT,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_games_level_pub ON public.learning_games(level, is_published);
CREATE INDEX IF NOT EXISTS idx_learning_games_type ON public.learning_games(game_type);
CREATE INDEX IF NOT EXISTS idx_learning_games_creator ON public.learning_games(created_by);

ALTER TABLE public.learning_games ENABLE ROW LEVEL SECURITY;

-- Students/all authenticated users can read published games
CREATE POLICY "Authenticated can read published games"
ON public.learning_games FOR SELECT
TO authenticated
USING (is_published = true);

-- Creators can read their own (drafts included)
CREATE POLICY "Creators can read own games"
ON public.learning_games FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Teachers / content_creators / admins can insert
CREATE POLICY "Eligible roles can insert games"
ON public.learning_games FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'content_creator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Creators can update their own; admins can update any
CREATE POLICY "Creators or admins can update games"
ON public.learning_games FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role));

-- Creators can delete their own; admins can delete any
CREATE POLICY "Creators or admins can delete games"
ON public.learning_games FOR DELETE
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_learning_games_updated_at
BEFORE UPDATE ON public.learning_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();