
-- Fix RLS policies for speaking scenarios (should be publicly readable)
DROP POLICY IF EXISTS "Everyone can view active speaking scenarios" ON public.speaking_scenarios;

CREATE POLICY "Everyone can view active speaking scenarios"
  ON public.speaking_scenarios FOR SELECT
  USING (is_active = true);

-- Add RLS policies for speaking_sessions
DROP POLICY IF EXISTS "Users can view their own speaking sessions" ON public.speaking_sessions;
DROP POLICY IF EXISTS "Users can create their own speaking sessions" ON public.speaking_sessions;
DROP POLICY IF EXISTS "Users can update their own speaking sessions" ON public.speaking_sessions;

CREATE POLICY "Users can view their own speaking sessions"
  ON public.speaking_sessions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own speaking sessions"
  ON public.speaking_sessions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own speaking sessions"
  ON public.speaking_sessions FOR UPDATE
  USING (auth.uid() = student_id);

-- Add RLS policies for speaking_progress
DROP POLICY IF EXISTS "Users can view their own speaking progress" ON public.speaking_progress;
DROP POLICY IF EXISTS "Users can create their own speaking progress" ON public.speaking_progress;
DROP POLICY IF EXISTS "Users can update their own speaking progress" ON public.speaking_progress;

CREATE POLICY "Users can view their own speaking progress"
  ON public.speaking_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own speaking progress"
  ON public.speaking_progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own speaking progress"
  ON public.speaking_progress FOR UPDATE
  USING (auth.uid() = student_id);

-- Insert additional speaking scenarios for better coverage
INSERT INTO public.speaking_scenarios (name, type, cefr_level, description, prompt, context_instructions, expected_duration, difficulty_rating, tags) VALUES
-- A1 Level scenarios
('At the Supermarket', 'role_play', 'A1', 'Practice shopping for groceries', 'You are at the supermarket. You need to buy milk, bread, and apples. Ask for help finding these items.', 'The AI will be a shop assistant. Keep your language simple and clear.', 120, 1, '{"shopping", "groceries", "basic"}'),
('Asking for Directions', 'role_play', 'A1', 'Practice asking for and giving directions', 'You are lost and need to find the nearest bank. Ask someone for directions.', 'The AI will help you with directions. Use simple present tense.', 150, 2, '{"directions", "location", "help"}'),
('Describing Your Room', 'picture_talk', 'A1', 'Describe your bedroom', 'Look at this picture of a bedroom and describe what you see. What furniture is there?', 'Use simple vocabulary for furniture and colors. Say where things are located.', 120, 1, '{"description", "furniture", "home"}'),

-- A2 Level scenarios
('At the Doctor', 'role_play', 'A2', 'Practice talking about health problems', 'You have a headache and feel tired. Visit the doctor and explain your symptoms.', 'The AI will be a doctor. Describe how you feel and answer questions about your health.', 200, 3, '{"health", "doctor", "symptoms"}'),
('Planning a Trip', 'role_play', 'A2', 'Discuss travel plans with a friend', 'You want to plan a weekend trip with your friend. Discuss where to go and what to do.', 'The AI will be your friend. Talk about preferences, activities, and making decisions together.', 240, 3, '{"travel", "planning", "friends"}'),
('Describing a Holiday', 'random_questions', 'A2', 'Talk about your last vacation', 'Tell me about your last holiday. Where did you go? What did you do? Did you enjoy it?', 'Use past tense to describe your experiences. Talk about activities and feelings.', 180, 2, '{"holidays", "past_tense", "experiences"}'),

-- B1 Level scenarios
('Job Interview', 'role_play', 'B1', 'Practice a job interview conversation', 'You are applying for a job as a shop assistant. Answer questions about your experience and skills.', 'The AI will be the interviewer. Talk about your qualifications, experience, and why you want the job.', 300, 4, '{"job", "interview", "work"}'),
('Complaining at a Restaurant', 'role_play', 'B1', 'Practice making a complaint politely', 'Your food is cold and the service is slow. Speak to the manager about the problem.', 'The AI will be the restaurant manager. Be polite but firm about your complaint.', 250, 4, '{"complaints", "restaurant", "problems"}'),
('Environmental Issues', 'random_questions', 'B1', 'Discuss environmental problems and solutions', 'What do you think are the biggest environmental problems today? What can we do to help?', 'Express opinions, give reasons, and suggest solutions. Use conditional sentences.', 300, 4, '{"environment", "opinions", "solutions"}');
