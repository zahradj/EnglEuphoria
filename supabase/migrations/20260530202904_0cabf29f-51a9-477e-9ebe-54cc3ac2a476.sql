ALTER TABLE public.classroom_states
  ADD COLUMN IF NOT EXISTS active_game_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS student_cursor_position jsonb;