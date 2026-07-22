ALTER TABLE public.classroom_sessions
  ADD COLUMN IF NOT EXISTS active_canvas_tab text DEFAULT 'slides',
  ADD COLUMN IF NOT EXISTS embedded_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_screen_sharing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS star_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS show_star_celebration boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_milestone boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS timer_value integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timer_running boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dice_value integer DEFAULT NULL;