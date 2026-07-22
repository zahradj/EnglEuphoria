INSERT INTO public.arcade_games_catalog (
  id, game_type, display_name, description,
  skill_focus, hub_allow, cefr_min, cefr_max,
  supports_speaking, supports_multiplayer, ceiling_seconds, category
) VALUES (
  'vocab_boss_round',
  'boss_round',
  '⚔️ Boss Round · Vocab Duel',
  'KhanQuest-inspired retrieval duel: each correct vocab meaning damages the boss; wrong picks cost HP. Bound to lesson reinforcement targets.',
  ARRAY['vocab','memory']::text[],
  ARRAY['playground','academy','success']::text[],
  'Pre-A1',
  'C1',
  false,
  false,
  210,
  'review'
)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  skill_focus = EXCLUDED.skill_focus,
  hub_allow = EXCLUDED.hub_allow,
  cefr_min = EXCLUDED.cefr_min,
  cefr_max = EXCLUDED.cefr_max,
  ceiling_seconds = EXCLUDED.ceiling_seconds,
  category = EXCLUDED.category;