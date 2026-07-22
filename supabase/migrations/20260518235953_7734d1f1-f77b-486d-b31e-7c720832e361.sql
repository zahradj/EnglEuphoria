
-- ===================== Gamer Arcade =====================

-- 1) Catalog
CREATE TABLE public.arcade_games_catalog (
  id text PRIMARY KEY,
  game_type text NOT NULL,
  display_name text NOT NULL,
  description text,
  skill_focus text[] NOT NULL DEFAULT '{}',
  hub_allow text[] NOT NULL DEFAULT '{playground,academy,success}',
  cefr_min text NOT NULL DEFAULT 'PreA1',
  cefr_max text NOT NULL DEFAULT 'C1',
  supports_speaking boolean NOT NULL DEFAULT false,
  supports_multiplayer boolean NOT NULL DEFAULT false,
  ceiling_seconds integer NOT NULL DEFAULT 180,
  character_slots integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'foundational',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_games_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_catalog_read_all"
ON public.arcade_games_catalog FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "arcade_catalog_admin_write"
ON public.arcade_games_catalog FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Sessions
CREATE TABLE public.arcade_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  lesson_id text,
  hub text NOT NULL,
  cefr text NOT NULL,
  mode text NOT NULL DEFAULT 'solo',
  source text NOT NULL DEFAULT 'standalone',
  score integer NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  speaking_attempts integer NOT NULL DEFAULT 0,
  hesitation_ms_avg integer NOT NULL DEFAULT 0,
  xp_awarded integer NOT NULL DEFAULT 0,
  rounds_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_arcade_sessions_student ON public.arcade_sessions(student_id, created_at DESC);
CREATE INDEX idx_arcade_sessions_lesson ON public.arcade_sessions(lesson_id);

ALTER TABLE public.arcade_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_sessions_student_own"
ON public.arcade_sessions FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "arcade_sessions_student_insert"
ON public.arcade_sessions FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "arcade_sessions_student_update"
ON public.arcade_sessions FOR UPDATE
TO authenticated
USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "arcade_sessions_admin_all"
ON public.arcade_sessions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Rounds
CREATE TABLE public.arcade_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.arcade_sessions(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  target_ref text,
  reinforcement_source text,
  skill_kind text,
  correct boolean NOT NULL DEFAULT false,
  latency_ms integer NOT NULL DEFAULT 0,
  retries integer NOT NULL DEFAULT 0,
  speaking_used boolean NOT NULL DEFAULT false,
  bravery_bonus boolean NOT NULL DEFAULT false,
  mastery_delta numeric NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_arcade_rounds_session ON public.arcade_rounds(session_id);
CREATE INDEX idx_arcade_rounds_game ON public.arcade_rounds(game_id);

ALTER TABLE public.arcade_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_rounds_student_read_own"
ON public.arcade_rounds FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.arcade_sessions s
    WHERE s.id = session_id AND (s.student_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

CREATE POLICY "arcade_rounds_student_insert"
ON public.arcade_rounds FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.arcade_sessions s
    WHERE s.id = session_id AND s.student_id = auth.uid())
);

CREATE POLICY "arcade_rounds_admin_all"
ON public.arcade_rounds FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Multiplayer rooms
CREATE TABLE public.arcade_multiplayer_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  host_user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'team',
  hub text NOT NULL,
  cefr text NOT NULL,
  lesson_id text,
  game_id text,
  status text NOT NULL DEFAULT 'lobby',
  max_players integer NOT NULL DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_multiplayer_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_rooms_authenticated_read"
ON public.arcade_multiplayer_rooms FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "arcade_rooms_host_insert"
ON public.arcade_multiplayer_rooms FOR INSERT
TO authenticated
WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "arcade_rooms_host_update"
ON public.arcade_multiplayer_rooms FOR UPDATE
TO authenticated
USING (host_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "arcade_rooms_admin_all"
ON public.arcade_multiplayer_rooms FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Room participants
CREATE TABLE public.arcade_room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.arcade_multiplayer_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'player',
  score integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  UNIQUE (room_id, user_id)
);
CREATE INDEX idx_arcade_room_participants_room ON public.arcade_room_participants(room_id);

ALTER TABLE public.arcade_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_participants_read"
ON public.arcade_room_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.arcade_multiplayer_rooms r WHERE r.id = room_id AND r.host_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "arcade_participants_insert_self"
ON public.arcade_room_participants FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "arcade_participants_update_self"
ON public.arcade_room_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "arcade_participants_admin_all"
ON public.arcade_room_participants FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6) Tournaments
CREATE TABLE public.arcade_tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub text NOT NULL,
  cefr_band text NOT NULL,
  season text NOT NULL,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  prize_xp integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.arcade_tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_tournaments_read_all"
ON public.arcade_tournaments FOR SELECT
TO authenticated USING (true);

CREATE POLICY "arcade_tournaments_admin_write"
ON public.arcade_tournaments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7) Tournament entries
CREATE TABLE public.arcade_tournament_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.arcade_tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  rank integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);
ALTER TABLE public.arcade_tournament_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_entries_read_own_or_admin"
ON public.arcade_tournament_entries FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "arcade_entries_insert_self"
ON public.arcade_tournament_entries FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "arcade_entries_update_self"
ON public.arcade_tournament_entries FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "arcade_entries_admin_all"
ON public.arcade_tournament_entries FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_arcade_catalog_updated BEFORE UPDATE ON public.arcade_games_catalog
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_arcade_sessions_updated BEFORE UPDATE ON public.arcade_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_arcade_rooms_updated BEFORE UPDATE ON public.arcade_multiplayer_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_arcade_tournaments_updated BEFORE UPDATE ON public.arcade_tournaments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_arcade_entries_updated BEFORE UPDATE ON public.arcade_tournament_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed catalog
INSERT INTO public.arcade_games_catalog (id, game_type, display_name, description, skill_focus, hub_allow, cefr_min, cefr_max, supports_speaking, supports_multiplayer, ceiling_seconds, category) VALUES
('matching_pairs','matching','Matching Pairs','Match word ↔ image / translation.','{vocab}','{playground,academy,success}','PreA1','C1',false,true,120,'foundational'),
('drag_drop_sort','drag_drop','Drag & Drop Sort','Sort items into the right buckets.','{vocab,grammar}','{playground,academy,success}','PreA1','C1',false,false,150,'foundational'),
('sentence_builder','sentence_builder','Sentence Builder','Build a target sentence from word tiles.','{grammar,vocab}','{playground,academy,success}','PreA1','C1',false,true,180,'foundational'),
('spelling_race','spelling_race','Spelling Race','Type the word as fast as you can.','{vocab,spelling}','{academy,success}','A1','C1',false,true,150,'foundational'),
('phonics_challenge','phonics_challenge','Phonics Challenge','Tap the correct phoneme.','{pronunciation,phonics}','{playground}','PreA1','A2',true,false,120,'foundational'),
('listening_hunt','listening_hunt','Listening Hunt','Find the word/phrase you hear.','{listening,vocab}','{playground,academy,success}','PreA1','C1',false,false,150,'foundational'),
('roleplay_mission','roleplay','Roleplay Mission','Play a character in a real-life scene.','{speaking,communication}','{academy,success}','A1','C1',true,true,300,'communication'),
('pronunciation_quest','pronunciation_quest','Pronunciation Quest','Say the target line; get scored.','{speaking,pronunciation}','{playground,academy,success}','PreA1','C1',true,false,180,'communication'),
('fluency_round','fluency_round','Fluency Round','Speak for X seconds about a topic.','{speaking,fluency}','{academy,success}','A2','C1',true,true,180,'communication'),
('story_continuation','story_continuation','Story Continuation','Continue the story in your own words.','{speaking,creativity}','{academy,success}','A2','C1',true,true,240,'communication'),
('debate_battle','debate_battle','Debate Battle','Defend your side in a quick debate.','{speaking,argumentation}','{success}','B1','C1',true,true,300,'communication'),
('memory_quest','memory_quest','Memory Quest','Recall items from past lessons.','{vocab,grammar,memory}','{playground,academy,success}','PreA1','C1',false,false,180,'review'),
('grammar_boss','grammar_boss','Grammar Boss Battle','Beat the boss by answering grammar questions.','{grammar}','{academy,success}','A1','C1',false,true,240,'review'),
('vocab_tournament','vocab_tournament','Vocab Tournament','Bracket-style vocab match-ups.','{vocab}','{academy,success}','A1','C1',false,true,300,'review'),
('fluency_streak','fluency_streak','Fluency Streak','Chain correct answers without slipping.','{vocab,grammar}','{academy,success}','A1','C1',false,false,180,'review'),
('team_mission','team_mission','Team Mission','Cooperative quest with classmates.','{communication}','{academy,success}','A2','C1',true,true,360,'social'),
('classroom_battle','classroom_battle','Classroom Battle','Teacher-launched live quiz.','{vocab,grammar}','{academy,success}','A1','C1',false,true,360,'social'),
('leaderboard_event','leaderboard_event','Leaderboard Event','Weekly ranked event.','{vocab,grammar}','{academy,success}','A1','C1',false,true,300,'social'),
('coop_challenge','coop_challenge','Coop Challenge','Pair up to solve a chain of tasks.','{vocab,grammar,communication}','{playground,academy,success}','PreA1','C1',true,true,300,'social'),
('song_chant','song_chant','Song & Chant','Sing/chant the target line.','{pronunciation,vocab}','{playground}','PreA1','A2',true,false,120,'foundational'),
('business_sim','business_sim','Business Simulation','Realistic workplace scenarios.','{speaking,communication}','{success}','B1','C1',true,true,360,'communication'),
('timeline_race','timeline_race','Timeline Race','Put events on the right timeline.','{grammar,tense}','{academy,success}','A1','C1',false,true,180,'foundational');
