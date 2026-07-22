
-- Create speaking_sessions table to track practice sessions
CREATE TABLE public.speaking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('role_play', 'picture_talk', 'random_questions')),
  scenario_name TEXT NOT NULL,
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  pronunciation_score DECIMAL(3,2) CHECK (pronunciation_score >= 0 AND pronunciation_score <= 1),
  grammar_score DECIMAL(3,2) CHECK (grammar_score >= 0 AND grammar_score <= 1),
  fluency_score DECIMAL(3,2) CHECK (fluency_score >= 0 AND fluency_score <= 1),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  feedback_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speaking_progress table to track cumulative progress
CREATE TABLE public.speaking_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  total_speaking_time INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  current_cefr_level TEXT NOT NULL DEFAULT 'A1',
  speaking_xp INTEGER NOT NULL DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speaking_scenarios table for practice content
CREATE TABLE public.speaking_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('role_play', 'picture_talk', 'random_questions')),
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+')),
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  context_instructions TEXT,
  expected_duration INTEGER NOT NULL DEFAULT 180, -- seconds
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS policies for speaking_sessions
CREATE POLICY "Users can view their own speaking sessions"
  ON public.speaking_sessions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own speaking sessions"
  ON public.speaking_sessions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own speaking sessions"
  ON public.speaking_sessions FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS policies for speaking_progress
CREATE POLICY "Users can view their own speaking progress"
  ON public.speaking_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own speaking progress"
  ON public.speaking_progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own speaking progress"
  ON public.speaking_progress FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS policies for speaking_scenarios (read-only for students)
CREATE POLICY "Everyone can view active speaking scenarios"
  ON public.speaking_scenarios FOR SELECT
  USING (is_active = true);

-- Insert sample scenarios
INSERT INTO public.speaking_scenarios (name, type, cefr_level, description, prompt, context_instructions, expected_duration, difficulty_rating, tags) VALUES
('Meeting Someone New', 'role_play', 'A1', 'Practice introducing yourself and basic greetings', 'You are meeting someone for the first time. Start by saying hello and introducing yourself.', 'The AI will play the role of a friendly person you are meeting. Keep responses simple and clear.', 120, 1, '{"greetings", "introductions", "basic"}'),
('Ordering Food', 'role_play', 'A1', 'Practice ordering food at a restaurant', 'You are at a restaurant and want to order food. Look at the menu and place your order.', 'The AI will be a waiter. You can ask about menu items and make your order.', 180, 2, '{"food", "restaurant", "ordering"}'),
('Talking About Family', 'role_play', 'A2', 'Describe your family members and relationships', 'Tell me about your family. Who lives with you? What do they do?', 'Share information about your family members, their ages, jobs, and what they like to do.', 240, 2, '{"family", "relationships", "descriptions"}'),
('Describing a Picture', 'picture_talk', 'A1', 'Look at a picture and describe what you see', 'Look at this picture and tell me what you see. Describe the people, objects, and actions.', 'Focus on simple descriptions using present tense. Say what you can see clearly.', 150, 1, '{"description", "vocabulary", "observation"}'),
('Daily Routine', 'random_questions', 'A2', 'Talk about your typical day', 'What do you usually do in the morning? Tell me about your daily routine.', 'Describe your daily activities using present simple tense.', 180, 2, '{"routine", "daily_life", "present_simple"}'),
('Shopping for Clothes', 'role_play', 'A2', 'Practice shopping for clothes', 'You want to buy a new shirt. Ask the shop assistant for help finding the right size and color.', 'The AI will be a shop assistant. You can ask about sizes, colors, and prices.', 200, 3, '{"shopping", "clothes", "questions"}'),
('Weekend Plans', 'random_questions', 'B1', 'Discuss your weekend activities', 'What are you planning to do this weekend? Do you have any special plans?', 'Talk about future plans using going to and will. Include reasons for your choices.', 240, 3, '{"future", "plans", "weekend", "intermediate"}');

-- Create function to update speaking progress
CREATE OR REPLACE FUNCTION update_speaking_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.speaking_progress (
    student_id, 
    total_speaking_time, 
    total_sessions, 
    current_streak,
    longest_streak,
    last_practice_date,
    speaking_xp
  ) VALUES (
    NEW.student_id,
    NEW.duration_seconds,
    1,
    1,
    1,
    CURRENT_DATE,
    NEW.xp_earned
  )
  ON CONFLICT (student_id) 
  DO UPDATE SET
    total_speaking_time = speaking_progress.total_speaking_time + NEW.duration_seconds,
    total_sessions = speaking_progress.total_sessions + 1,
    current_streak = CASE 
      WHEN speaking_progress.last_practice_date = CURRENT_DATE - INTERVAL '1 day' 
      THEN speaking_progress.current_streak + 1
      WHEN speaking_progress.last_practice_date = CURRENT_DATE 
      THEN speaking_progress.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      speaking_progress.longest_streak, 
      CASE 
        WHEN speaking_progress.last_practice_date = CURRENT_DATE - INTERVAL '1 day' 
        THEN speaking_progress.current_streak + 1
        WHEN speaking_progress.last_practice_date = CURRENT_DATE 
        THEN speaking_progress.current_streak
        ELSE 1
      END
    ),
    last_practice_date = CURRENT_DATE,
    speaking_xp = speaking_progress.speaking_xp + NEW.xp_earned,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update progress
CREATE TRIGGER speaking_session_progress_trigger
  AFTER INSERT ON public.speaking_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_speaking_progress();
