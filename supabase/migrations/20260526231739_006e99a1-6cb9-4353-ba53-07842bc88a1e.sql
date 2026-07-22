
-- 1. WORLDS TABLE -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.curriculum_worlds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  hub text NOT NULL DEFAULT 'playground',
  cefr_band text NOT NULL DEFAULT 'A1',
  visual_style jsonb NOT NULL DEFAULT '{}'::jsonb,
  emotional_tone text NOT NULL,
  gameplay_identity text NOT NULL,
  palette jsonb NOT NULL DEFAULT '[]'::jsonb,
  mascots jsonb NOT NULL DEFAULT '[]'::jsonb,
  music_mood text,
  suggested_activity_types text[] NOT NULL DEFAULT '{}',
  topic_affinity text[] NOT NULL DEFAULT '{}',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.curriculum_worlds TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculum_worlds TO authenticated;
GRANT ALL ON public.curriculum_worlds TO service_role;

ALTER TABLE public.curriculum_worlds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "worlds_readable_by_all"
  ON public.curriculum_worlds FOR SELECT
  USING (true);

CREATE POLICY "worlds_managed_by_admins_or_creators"
  ON public.curriculum_worlds FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_creator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_creator')
  );

-- 2. UNITS LINK -------------------------------------------------------------
ALTER TABLE public.curriculum_units
  ADD COLUMN IF NOT EXISTS world_id uuid REFERENCES public.curriculum_worlds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS world_slug text;

CREATE INDEX IF NOT EXISTS idx_curriculum_units_world_id ON public.curriculum_units(world_id);

-- 3. SEED A1 PLAYGROUND WORLDS ---------------------------------------------
INSERT INTO public.curriculum_worlds
  (slug, name, hub, cefr_band, emotional_tone, gameplay_identity, palette, mascots, music_mood, suggested_activity_types, topic_affinity, display_order, visual_style)
VALUES
  ('welcome-town', 'Welcome Town', 'playground', 'A1', 'safe-welcoming',  'greeting-quests',
    '["#FFD166","#FFB703","#FB8500","#8ECAE6"]'::jsonb,
    '["Pip the Penguin","Mayor Marigold"]'::jsonb, 'cheerful-marching',
    ARRAY['multiple_choice','match_pairs','drag_drop','speaking_repeat'],
    ARRAY['greetings','introductions','classroom','colors','commands'], 1,
    '{"setting":"cheerful town","props":["balloons","schoolhouse","streets"]}'::jsonb),

  ('jungle-adventure','Jungle Adventure','playground','A1','adventurous-energetic','animal-rescue',
    '["#2A9D8F","#E9C46A","#F4A261","#264653"]'::jsonb,
    '["Rumi the Tiger Cub","Sky the Parrot"]'::jsonb,'tribal-drums-upbeat',
    ARRAY['drag_drop','sound_discrimination','match_pairs','speaking_describe'],
    ARRAY['animals','actions','movement','simple_present'], 2,
    '{"setting":"jungle","props":["waterfalls","vines","tropical-canopy"]}'::jsonb),

  ('space-mission','Space Mission','playground','A1','curious-futuristic','rocket-navigation',
    '["#3D348B","#7678ED","#F7B801","#F18701"]'::jsonb,
    '["Captain Nova","Beep the Robot"]'::jsonb,'synthwave-curious',
    ARRAY['drag_drop','dictation_builder','listen_and_match','speaking_command'],
    ARRAY['numbers','directions','counting','locations','commands'], 3,
    '{"setting":"space station","props":["planets","rockets","control-panels"]}'::jsonb),

  ('food-festival','Food Festival','playground','A1','social-playful','restaurant-roleplay',
    '["#E63946","#F1FAEE","#A8DADC","#457B9D"]'::jsonb,
    '["Chef Cilla","Pico the Mouse"]'::jsonb,'mariachi-light',
    ARRAY['drag_drop','match_pairs','speaking_dialogue','multiple_choice'],
    ARRAY['food','likes_dislikes','countables','ordering'], 4,
    '{"setting":"food market","props":["stalls","lanterns","candy-bowls"]}'::jsonb),

  ('monster-academy','Monster Academy','playground','A1','funny-magical','monster-customization',
    '["#7209B7","#3A0CA3","#F72585","#4CC9F0"]'::jsonb,
    '["Professor Glob","Bibi the Tiny Monster"]'::jsonb,'whimsical-organ',
    ARRAY['visual_grammar','match_pairs','speaking_describe','drag_drop'],
    ARRAY['emotions','appearance','personality','describing_people'], 5,
    '{"setting":"magical classroom","props":["floating-books","potions","starry-ceiling"]}'::jsonb),

  ('ocean-explorers','Ocean Explorers','playground','A1','calm-exploratory','treasure-hunt',
    '["#0077B6","#00B4D8","#90E0EF","#CAF0F8"]'::jsonb,
    '["Coral the Mermaid","Bub the Octopus"]'::jsonb,'ambient-underwater',
    ARRAY['drag_drop','sound_discrimination','speaking_question','match_pairs'],
    ARRAY['sea_animals','actions','questions','habitats'], 6,
    '{"setting":"underwater reef","props":["submarine","coral","bubbles"]}'::jsonb),

  ('superhero-city','Superhero City','playground','A1','empowering-exciting','rescue-mission',
    '["#D62828","#003049","#F77F00","#FCBF49"]'::jsonb,
    '["Captain Spark","Zippy the Sidekick"]'::jsonb,'cinematic-power',
    ARRAY['speaking_dialogue','multiple_choice','drag_drop','listen_and_match'],
    ARRAY['abilities','can_cant','helping','daily_actions'], 7,
    '{"setting":"comic-book city","props":["skyscrapers","gadgets","action-lines"]}'::jsonb),

  ('dinosaur-island','Dinosaur Island','playground','A1','epic-adventurous','fossil-collection',
    '["#386641","#6A994E","#A7C957","#F2E8CF"]'::jsonb,
    '["Rexi the T-Rex","Tilly the Triceratops"]'::jsonb,'epic-tribal',
    ARRAY['drag_drop','match_pairs','visual_grammar','speaking_describe'],
    ARRAY['sizes','comparisons','adjectives','nature'], 8,
    '{"setting":"prehistoric jungle","props":["volcano","fossils","ferns"]}'::jsonb),

  ('magic-castle','Magic Castle','playground','A1','mysterious-magical','hidden-object-quest',
    '["#22223B","#4A4E69","#9A8C98","#C9ADA7"]'::jsonb,
    '["Wizard Wim","Cat-cat the Familiar"]'::jsonb,'celesta-mystery',
    ARRAY['drag_drop','match_pairs','visual_grammar','speaking_describe'],
    ARRAY['household','rooms','prepositions','object_descriptions'], 9,
    '{"setting":"enchanted castle","props":["torches","tapestries","spiral-stairs"]}'::jsonb),

  ('future-tech-lab','Future Tech Lab','playground','A1','innovative-intelligent','invention-challenge',
    '["#00F5D4","#00BBF9","#9B5DE5","#F15BB5"]'::jsonb,
    '["Dr. Volt","Nano the Bot"]'::jsonb,'electronic-bright',
    ARRAY['dictation_builder','multiple_choice','drag_drop','speaking_instruct'],
    ARRAY['technology','instructions','routines','problem_solving'], 10,
    '{"setting":"holographic lab","props":["screens","robots","blueprints"]}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- 4. ENGAGEMENT VIEW --------------------------------------------------------
CREATE OR REPLACE VIEW public.world_engagement_summary AS
SELECT
  w.id          AS world_id,
  w.slug        AS world_slug,
  w.name        AS world_name,
  COUNT(DISTINCT u.id)                     AS unit_count,
  COUNT(DISTINCT cl.id)                    AS lesson_count
FROM public.curriculum_worlds w
LEFT JOIN public.curriculum_units    u  ON u.world_id = w.id
LEFT JOIN public.curriculum_lessons  cl ON cl.unit_id = u.id
GROUP BY w.id, w.slug, w.name;

GRANT SELECT ON public.world_engagement_summary TO authenticated;
GRANT SELECT ON public.world_engagement_summary TO anon;
