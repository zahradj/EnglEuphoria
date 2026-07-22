
ALTER TABLE public.learning_games
  ADD COLUMN IF NOT EXISTS hub text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS xp_reward integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

UPDATE public.learning_games SET hub = COALESCE(hub,
  CASE WHEN 'playground' = ANY(tags) THEN 'playground'
       WHEN 'academy'    = ANY(tags) THEN 'academy'
       WHEN 'success'    = ANY(tags) THEN 'success'
       ELSE 'academy' END);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learning_games_hub_chk') THEN
    ALTER TABLE public.learning_games
      ADD CONSTRAINT learning_games_hub_chk CHECK (hub IN ('playground','academy','success'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lg_hub_pub_level ON public.learning_games(hub, is_published, level);
CREATE INDEX IF NOT EXISTS idx_lg_published_at ON public.learning_games(published_at DESC);

CREATE OR REPLACE FUNCTION public.sync_learning_game_publish()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.tags IS NOT NULL THEN
    IF 'playground' = ANY(NEW.tags) THEN NEW.hub := 'playground';
    ELSIF 'academy' = ANY(NEW.tags) THEN NEW.hub := 'academy';
    ELSIF 'success' = ANY(NEW.tags) THEN NEW.hub := 'success';
    END IF;
  END IF;
  IF NEW.hub IS NULL THEN NEW.hub := 'academy'; END IF;
  IF NEW.is_published AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_learning_game_publish ON public.learning_games;
CREATE TRIGGER trg_sync_learning_game_publish
BEFORE INSERT OR UPDATE ON public.learning_games
FOR EACH ROW EXECUTE FUNCTION public.sync_learning_game_publish();

-- Per-student progress
CREATE TABLE IF NOT EXISTS public.student_game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_id uuid NOT NULL REFERENCES public.learning_games(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  best_score numeric NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  last_played_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_sgp_user_status ON public.student_game_progress(user_id, status, last_played_at DESC);

ALTER TABLE public.student_game_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own progress" ON public.student_game_progress;
CREATE POLICY "Students read own progress"
ON public.student_game_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students insert own progress" ON public.student_game_progress;
CREATE POLICY "Students insert own progress"
ON public.student_game_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students update own progress" ON public.student_game_progress;
CREATE POLICY "Students update own progress"
ON public.student_game_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Assignments
CREATE TABLE IF NOT EXISTS public.game_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.learning_games(id) ON DELETE CASCADE,
  student_id uuid,
  booking_id uuid,
  assigned_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ga_student ON public.game_assignments(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ga_booking ON public.game_assignments(booking_id, created_at DESC);

ALTER TABLE public.game_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students see own assignments" ON public.game_assignments;
CREATE POLICY "Students see own assignments"
ON public.game_assignments FOR SELECT TO authenticated
USING (auth.uid() = student_id OR auth.uid() = assigned_by);

DROP POLICY IF EXISTS "Teachers can assign games" ON public.game_assignments;
CREATE POLICY "Teachers can assign games"
ON public.game_assignments FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = assigned_by AND (
    public.has_role(auth.uid(),'teacher'::app_role)
    OR public.has_role(auth.uid(),'content_creator'::app_role)
    OR public.has_role(auth.uid(),'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Assigners can delete own assignments" ON public.game_assignments;
CREATE POLICY "Assigners can delete own assignments"
ON public.game_assignments FOR DELETE TO authenticated
USING (auth.uid() = assigned_by OR public.has_role(auth.uid(),'admin'::app_role));
