-- Create quick actions table
CREATE TABLE IF NOT EXISTS public.curriculum_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group TEXT NOT NULL,
  button_label TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('lesson', 'activity', 'worksheet', 'planning')),
  order_index INTEGER NOT NULL,
  icon TEXT DEFAULT 'BookOpen'
);

-- Create grammar progression table
CREATE TABLE IF NOT EXISTS public.grammar_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cefr_level TEXT NOT NULL,
  age_range TEXT NOT NULL,
  grammar_points JSONB NOT NULL,
  examples JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vocabulary progression table
CREATE TABLE IF NOT EXISTS public.vocabulary_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cefr_level TEXT NOT NULL,
  age_range TEXT NOT NULL,
  themes JSONB NOT NULL,
  word_lists JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.curriculum_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_progression ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "All authenticated users can view quick actions" ON public.curriculum_quick_actions;
DROP POLICY IF EXISTS "All authenticated users can view grammar progression" ON public.grammar_progression;
DROP POLICY IF EXISTS "All authenticated users can view vocabulary progression" ON public.vocabulary_progression;

-- RLS Policies for quick actions (read-only for all authenticated)
CREATE POLICY "All authenticated users can view quick actions"
ON public.curriculum_quick_actions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for progression tables (read-only for all authenticated)
CREATE POLICY "All authenticated users can view grammar progression"
ON public.grammar_progression FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "All authenticated users can view vocabulary progression"
ON public.vocabulary_progression FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Insert quick action buttons
INSERT INTO public.curriculum_quick_actions (age_group, button_label, prompt_text, category, order_index, icon) VALUES
-- Ages 5-7
('5-7', 'Basic Vocabulary Lesson', 'Create a 30-minute lesson for ages 5–7 on basic vocabulary (animals/colors/toys). Include TPR, flashcard games, chants, and simple can/can''t practice.', 'lesson', 1, 'Sparkles'),
('5-7', 'Speaking Activity', 'Generate a fun speaking activity for ages 5–7 to practice "This is a…" and "I like…" using pictures.', 'activity', 2, 'Mic'),
('5-7', 'Matching Worksheet', 'Make a worksheet with matching pictures and words for A1 kids (5–7).', 'worksheet', 3, 'FileText'),
-- Ages 8-11
('8-11', 'Present Simple Lesson', 'Create a 45-minute A1–A2 lesson for ages 8–11 on Present Simple routines with a mini-dialogue and 6-item formative quiz.', 'lesson', 4, 'BookOpen'),
('8-11', 'Vocabulary Game', 'Generate a game-based activity for 8–11 year olds to practice vocabulary (clothes/sports/foods) with full sentences.', 'activity', 5, 'Gamepad2'),
('8-11', 'Scope & Sequence', 'Design a 4-week scope & sequence for ages 8–11 (A2).', 'planning', 6, 'Calendar'),
-- Ages 12-14
('12-14', 'Past Tenses Lesson', 'Create a 50-minute A2–B1 lesson for ages 12–14 on Past Simple vs Present Perfect with speaking and writing tasks.', 'lesson', 7, 'Clock'),
('12-14', 'Critical Thinking Task', 'Generate a critical-thinking speaking task for A2–B1 learners (12–14 yrs) about technology and daily life.', 'activity', 8, 'MessageSquare'),
('12-14', 'Reading Text', 'Create a reading text (120 words) for 12–14 year olds about friendship, with comprehension questions.', 'worksheet', 9, 'BookMarked'),
-- Ages 15-17
('15-17', 'Conditionals Lesson', 'Create a 60-minute B1–B2 lesson for ages 15–17 on First + Second Conditionals with debates and writing tasks.', 'lesson', 10, 'GraduationCap'),
('15-17', 'Debate Prompt', 'Develop a TED-style speaking prompt for teens (15–17) to practice expressing opinions on social issues in simple language.', 'activity', 11, 'Users'),
('15-17', 'Exam Curriculum', 'Generate a 6-week curriculum outline for 15–17 year olds preparing for an international English exam.', 'planning', 12, 'Target')
ON CONFLICT DO NOTHING;

-- Insert grammar progression data
INSERT INTO public.grammar_progression (cefr_level, age_range, grammar_points, examples) VALUES
('Pre-A1', '5-7', 
  '["Nouns", "It''s a...", "Colors and toys", "Can/can''t", "Prepositions (in, on, under)"]'::jsonb,
  '{"Nouns": "cat, dog, bird", "It''s a...": "It''s a red car", "Can/can''t": "I can run. I can''t fly."}'::jsonb),
('A1', '8-11',
  '["Present Simple", "There is/are", "Have/has", "Imperatives", "Basic questions (What/Where/How)"]'::jsonb,
  '{"Present Simple": "I wake up at 7", "There is/are": "There are three dogs", "Have/has": "She has a bike"}'::jsonb),
('A2', '10-12',
  '["Present Continuous", "Past Simple", "Comparatives & superlatives", "Going to (future)", "Some/any"]'::jsonb,
  '{"Present Continuous": "I am eating lunch", "Past Simple": "I went to school yesterday", "Comparatives": "bigger, more interesting"}'::jsonb),
('B1', '12-15',
  '["Present Perfect", "Present Perfect Continuous", "Past Continuous", "Will/going to", "First conditional", "Modal verbs (must/should)"]'::jsonb,
  '{"Present Perfect": "I have visited Paris", "First conditional": "If I study, I will pass", "Modals": "You should study more"}'::jsonb),
('B2', '15-17',
  '["Second/third conditional", "Passive voice", "Reported speech", "Advanced modals", "Narrative tenses", "Complex clause structures"]'::jsonb,
  '{"Second conditional": "If I were rich, I would travel", "Passive": "The book was written in 1990", "Reported speech": "She said she was tired"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert vocabulary progression data
INSERT INTO public.vocabulary_progression (cefr_level, age_range, themes, word_lists) VALUES
('Pre-A1', '5-7',
  '["Colors", "Animals", "Toys", "Food", "Weather"]'::jsonb,
  '{"Colors": ["red", "blue", "yellow", "green"], "Animals": ["cat", "dog", "bird", "fish"], "Toys": ["ball", "doll", "car", "teddy"]}'::jsonb),
('A1', '8-11',
  '["School", "Family", "Clothes", "Daily routines", "Hobbies"]'::jsonb,
  '{"School": ["book", "pen", "teacher", "classroom"], "Family": ["mother", "father", "sister", "brother"], "Hobbies": ["reading", "swimming", "playing"]}'::jsonb),
('A2', '10-12',
  '["Travel", "Activities", "Community", "Sports", "Nature"]'::jsonb,
  '{"Travel": ["airport", "ticket", "passport", "hotel"], "Sports": ["football", "basketball", "tennis", "cycling"], "Nature": ["tree", "flower", "mountain", "river"]}'::jsonb),
('B1', '12-15',
  '["Environment", "Technology", "Feelings", "Health", "Education"]'::jsonb,
  '{"Environment": ["pollution", "recycling", "climate", "conservation"], "Technology": ["smartphone", "internet", "social media", "app"], "Feelings": ["anxious", "confident", "frustrated", "excited"]}'::jsonb),
('B2', '15-17',
  '["Global issues", "Careers", "Social problems", "Abstract concepts", "Academic vocabulary"]'::jsonb,
  '{"Global issues": ["sustainability", "inequality", "migration", "globalization"], "Careers": ["entrepreneurship", "innovation", "leadership", "qualification"], "Abstract": ["perspective", "consequence", "potential", "influence"]}'::jsonb)
ON CONFLICT DO NOTHING;