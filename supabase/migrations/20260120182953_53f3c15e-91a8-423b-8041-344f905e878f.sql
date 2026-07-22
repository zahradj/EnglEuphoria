-- Create iron_games table for storing generated IronLMS games
CREATE TABLE public.iron_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL,
  game_mode text NOT NULL CHECK (game_mode IN ('mechanic', 'context', 'application')),
  target_group text NOT NULL CHECK (target_group IN ('playground', 'academy', 'hub')),
  cefr_level text DEFAULT 'A2',
  game_data jsonb NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.iron_games ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all games" ON public.iron_games
  FOR SELECT USING (true);

CREATE POLICY "Users can create games" ON public.iron_games
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own games" ON public.iron_games
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own games" ON public.iron_games
  FOR DELETE USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE TRIGGER update_iron_games_updated_at
  BEFORE UPDATE ON public.iron_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();