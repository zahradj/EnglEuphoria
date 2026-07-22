
-- Add more comprehensive speaking scenarios for all CEFR levels
INSERT INTO public.speaking_scenarios (name, type, cefr_level, description, prompt, context_instructions, expected_duration, difficulty_rating, tags) VALUES

-- A1 Level scenarios (Beginner)
('Buying Groceries', 'role_play', 'A1', 'Practice shopping for basic items at a grocery store', 'You need to buy milk, bread, eggs, and apples at the supermarket. Ask the cashier about prices and pay for your items.', 'The AI will be a friendly cashier. Use simple present tense and basic vocabulary.', 180, 1, '{"shopping", "food", "money", "basic"}'),
('Doctor Visit', 'role_play', 'A1', 'Practice talking about health problems with a doctor', 'You have a headache and fever. Visit the doctor and describe how you feel.', 'The AI will be a doctor. Use simple sentences to describe your symptoms.', 200, 2, '{"health", "doctor", "symptoms", "basic"}'),
('School Day', 'random_questions', 'A1', 'Talk about your typical school day', 'Tell me about your school. What time do you start? What subjects do you study?', 'Use present simple tense. Talk about daily routines and school subjects.', 150, 1, '{"school", "routine", "education", "daily_life"}'),
('My Pet', 'picture_talk', 'A1', 'Describe your pet or a pet you would like to have', 'Look at this picture of a pet. Describe what you see and tell me about pets you like.', 'Use simple adjectives and present tense. Talk about animals and their characteristics.', 120, 1, '{"animals", "pets", "description", "likes"}'),

-- A2 Level scenarios (Elementary)
('Job Interview Basics', 'role_play', 'A2', 'Practice a simple job interview for a part-time position', 'You are applying for a job at a local cafe. Answer questions about yourself and your availability.', 'The AI will be an interviewer. Talk about your experience, skills, and why you want the job.', 300, 3, '{"work", "interview", "experience", "skills"}'),
('Weather and Seasons', 'random_questions', 'A2', 'Discuss weather, seasons, and climate preferences', 'What is your favorite season? How is the weather in your country? What do you like to do in different seasons?', 'Use weather vocabulary and express preferences. Compare different seasons.', 180, 2, '{"weather", "seasons", "preferences", "nature"}'),
('Shopping for Clothes', 'role_play', 'A2', 'Practice buying clothes and discussing sizes, colors, and prices', 'You want to buy a new shirt for a party. Ask about sizes, colors, and try to get a discount.', 'The AI will be a shop assistant. Ask questions about products and negotiate politely.', 250, 3, '{"shopping", "clothes", "colors", "sizes", "negotiation"}'),
('Vacation Plans', 'random_questions', 'A2', 'Talk about past and future vacation experiences', 'Where did you go on your last vacation? Where would you like to go next year? What do you like to do when traveling?', 'Use past and future tenses. Talk about travel experiences and preferences.', 220, 3, '{"travel", "vacation", "experiences", "future_plans"}'),

-- B1 Level scenarios (Intermediate)
('Complaining at a Restaurant', 'role_play', 'B1', 'Practice making polite complaints about service or food quality', 'Your food arrived cold and the service is very slow. Speak to the manager about these problems politely but firmly.', 'The AI will be a restaurant manager. Express dissatisfaction while remaining polite and constructive.', 300, 4, '{"complaints", "restaurant", "problem_solving", "politeness"}'),
('Environmental Issues Discussion', 'random_questions', 'B1', 'Discuss environmental problems and propose solutions', 'What are the biggest environmental problems in your area? What can individuals do to help protect the environment?', 'Express opinions with reasons, suggest solutions, and discuss cause and effect relationships.', 350, 4, '{"environment", "problems", "solutions", "opinions"}'),
('University Life', 'role_play', 'B1', 'Practice conversations about student life, courses, and campus activities', 'You are a new international student. Ask about course registration, campus facilities, and student clubs.', 'The AI will be a student advisor. Ask detailed questions and seek advice about university life.', 280, 4, '{"education", "university", "student_life", "advice"}'),
('Technology Debate', 'random_questions', 'B1', 'Discuss the impact of technology on daily life', 'How has technology changed the way we communicate? What are the advantages and disadvantages of social media?', 'Present balanced arguments, compare past and present, express opinions with supporting evidence.', 320, 4, '{"technology", "debate", "social_media", "change"}'),

-- B2 Level scenarios (Upper-Intermediate)
('Business Presentation', 'role_play', 'B2', 'Practice giving a presentation about a business proposal', 'Present your idea for a new mobile app to potential investors. Explain the concept, target market, and revenue model.', 'The AI will be an investor. Use persuasive language, present data clearly, and answer challenging questions.', 400, 5, '{"business", "presentation", "investment", "persuasion"}'),
('Cultural Differences', 'random_questions', 'B2', 'Discuss cultural differences and cross-cultural communication', 'How do business practices differ between countries? What challenges do people face when working in international teams?', 'Compare cultures analytically, discuss communication styles, and explore cultural sensitivity.', 350, 5, '{"culture", "international", "communication", "workplace"}'),
('Medical Emergency', 'role_play', 'B2', 'Handle a complex medical emergency situation', 'Your friend has been injured in an accident. Call emergency services and explain the situation clearly and calmly.', 'The AI will be an emergency operator. Provide detailed, accurate information under pressure while staying calm.', 250, 5, '{"emergency", "medical", "stress", "communication"}'),
('Philosophy Discussion', 'random_questions', 'B2', 'Explore philosophical questions about life, happiness, and success', 'What does it mean to live a meaningful life? How do you define success? Is happiness a choice?', 'Engage in abstract thinking, present complex ideas clearly, and explore different perspectives.', 400, 5, '{"philosophy", "life", "success", "abstract_thinking"}'),

-- C1 Level scenarios (Advanced)
('Academic Conference', 'role_play', 'C1', 'Participate in an academic conference as a researcher', 'Present your research findings at a conference and engage in scholarly debate with peers.', 'The AI will be fellow academics. Use sophisticated academic language, defend your methodology, and critique others\' work constructively.', 450, 6, '{"academic", "research", "conference", "scholarly_debate"}'),
('Political Analysis', 'random_questions', 'C1', 'Analyze current political events and policies', 'What are the main challenges facing democratic societies today? How should governments balance individual freedom with collective security?', 'Present nuanced political analysis, consider multiple perspectives, and use sophisticated argumentation.', 400, 6, '{"politics", "democracy", "analysis", "current_events"}'),
('Literary Criticism', 'random_questions', 'C1', 'Discuss literature, themes, and artistic interpretation', 'How do authors use symbolism to convey meaning? What makes a work of literature timeless and universally relevant?', 'Analyze literary works critically, discuss abstract concepts, and make sophisticated interpretations.', 380, 6, '{"literature", "criticism", "symbolism", "interpretation"}'),
('Ethical Dilemma', 'role_play', 'C1', 'Navigate a complex ethical situation in a professional context', 'As a senior manager, you must decide whether to lay off employees to save the company or risk bankruptcy. Discuss this with the board.', 'The AI will be board members. Present ethical arguments, consider stakeholder interests, and make difficult decisions.', 420, 6, '{"ethics", "management", "decision_making", "stakeholders"}'),

-- C2 Level scenarios (Mastery)
('International Diplomacy', 'role_play', 'C2', 'Engage in diplomatic negotiations between countries', 'Negotiate a trade agreement between two countries with conflicting interests. Find mutually beneficial solutions.', 'The AI will be foreign diplomats. Use diplomatic language, understand cultural nuances, and build consensus.', 500, 7, '{"diplomacy", "negotiation", "international_relations", "consensus"}'),
('Scientific Breakthrough', 'role_play', 'C2', 'Present groundbreaking scientific research to peers', 'You have made a significant discovery in your field. Present your findings and defend your methodology against peer review.', 'The AI will be expert scientists. Use precise scientific language, handle criticism professionally, and explain complex concepts.', 450, 7, '{"science", "research", "peer_review", "innovation"}'),
('Philosophical Symposium', 'random_questions', 'C2', 'Engage in deep philosophical discourse', 'Explore the nature of consciousness, free will, and human existence. What are the implications of artificial intelligence for human identity?', 'Engage with abstract philosophical concepts, present original thinking, and build on complex theoretical frameworks.', 480, 7, '{"philosophy", "consciousness", "AI", "existentialism"}'),
('Historical Analysis', 'random_questions', 'C2', 'Analyze historical events and their contemporary relevance', 'How do historical patterns of social change inform our understanding of current global challenges? What lessons can we learn from past civilizations?', 'Draw sophisticated historical parallels, analyze cause and effect across centuries, and apply historical insights to modern contexts.', 420, 7, '{"history", "analysis", "patterns", "contemporary_relevance"}');

-- Create AI conversation sessions table for live chat tracking
CREATE TABLE IF NOT EXISTS public.ai_conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('live_chat', 'voice_practice', 'assessment')),
  scenario_id UUID REFERENCES public.speaking_scenarios(id),
  conversation_topic TEXT,
  ai_personality TEXT DEFAULT 'friendly_tutor',
  voice_enabled BOOLEAN DEFAULT false,
  session_duration INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  session_data JSONB DEFAULT '{}',
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  feedback_notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create speaking assessments table for detailed feedback
CREATE TABLE IF NOT EXISTS public.speaking_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_conversation_sessions(id),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  pronunciation_score DECIMAL(3,2) CHECK (pronunciation_score >= 0 AND pronunciation_score <= 1),
  fluency_score DECIMAL(3,2) CHECK (fluency_score >= 0 AND fluency_score <= 1),
  grammar_score DECIMAL(3,2) CHECK (grammar_score >= 0 AND fluency_score <= 1),
  vocabulary_score DECIMAL(3,2) CHECK (vocabulary_score >= 0 AND vocabulary_score <= 1),
  coherence_score DECIMAL(3,2) CHECK (coherence_score >= 0 AND coherence_score <= 1),
  overall_cefr_estimate TEXT CHECK (overall_cefr_estimate IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  improvement_areas TEXT[],
  strengths TEXT[],
  specific_feedback JSONB DEFAULT '{}',
  ai_generated_feedback TEXT,
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student speaking goals table
CREATE TABLE IF NOT EXISTS public.student_speaking_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  target_cefr_level TEXT NOT NULL CHECK (target_cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  daily_practice_minutes INTEGER DEFAULT 15,
  weekly_sessions_goal INTEGER DEFAULT 5,
  focus_areas TEXT[] DEFAULT '{}',
  deadline DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, is_active) WHERE is_active = true
);

-- Enable RLS on new tables
ALTER TABLE public.ai_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_speaking_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_conversation_sessions
CREATE POLICY "Users can manage their own AI sessions" ON ai_conversation_sessions
FOR ALL USING (auth.uid() = student_id);

-- RLS policies for speaking_assessments  
CREATE POLICY "Users can view their own assessments" ON speaking_assessments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can insert assessments" ON speaking_assessments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS policies for student_speaking_goals
CREATE POLICY "Users can manage their own goals" ON student_speaking_goals
FOR ALL USING (auth.uid() = student_id);

-- Function to get student's appropriate scenarios based on level
CREATE OR REPLACE FUNCTION public.get_student_appropriate_scenarios(student_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  cefr_level TEXT,
  description TEXT,
  prompt TEXT,
  context_instructions TEXT,
  expected_duration INTEGER,
  difficulty_rating INTEGER,
  tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_level TEXT;
  allowed_levels TEXT[];
BEGIN
  -- Get student's current CEFR level from speaking progress
  SELECT current_cefr_level INTO student_level
  FROM public.speaking_progress
  WHERE student_id = student_uuid;
  
  -- If no progress record, default to A1
  IF student_level IS NULL THEN
    student_level := 'A1';
  END IF;
  
  -- Determine allowed levels (current + next level)
  allowed_levels := CASE student_level
    WHEN 'A1' THEN ARRAY['A1', 'A2']
    WHEN 'A2' THEN ARRAY['A1', 'A2', 'B1']
    WHEN 'B1' THEN ARRAY['A2', 'B1', 'B2']
    WHEN 'B2' THEN ARRAY['B1', 'B2', 'C1']
    WHEN 'C1' THEN ARRAY['B2', 'C1', 'C2']
    WHEN 'C2' THEN ARRAY['C1', 'C2']
    ELSE ARRAY['A1', 'A2']
  END;
  
  -- Return scenarios within allowed levels
  RETURN QUERY
  SELECT s.id, s.name, s.type, s.cefr_level, s.description, 
         s.prompt, s.context_instructions, s.expected_duration,
         s.difficulty_rating, s.tags
  FROM public.speaking_scenarios s
  WHERE s.is_active = true
    AND s.cefr_level = ANY(allowed_levels)
  ORDER BY 
    CASE s.cefr_level
      WHEN student_level THEN 1
      ELSE 2
    END,
    s.difficulty_rating ASC;
END;
$$;

-- Function to update student speaking progress and level
CREATE OR REPLACE FUNCTION public.update_student_speaking_level()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_score DECIMAL(3,2);
  session_count INTEGER;
  new_level TEXT;
BEGIN
  -- Calculate average scores from recent assessments
  SELECT 
    AVG((pronunciation_score + fluency_score + grammar_score + vocabulary_score + coherence_score) / 5),
    COUNT(*)
  INTO avg_score, session_count
  FROM public.speaking_assessments sa
  JOIN public.ai_conversation_sessions acs ON sa.session_id = acs.id
  WHERE acs.student_id = NEW.student_id
    AND sa.assessment_date >= NOW() - INTERVAL '30 days';
  
  -- Determine level progression based on performance
  IF avg_score IS NOT NULL AND session_count >= 5 THEN
    new_level := CASE 
      WHEN avg_score >= 0.9 THEN 
        CASE (SELECT current_cefr_level FROM speaking_progress WHERE student_id = NEW.student_id)
          WHEN 'A1' THEN 'A2'
          WHEN 'A2' THEN 'B1'
          WHEN 'B1' THEN 'B2'
          WHEN 'B2' THEN 'C1'
          WHEN 'C1' THEN 'C2'
          ELSE 'C2'
        END
      WHEN avg_score >= 0.8 THEN 
        (SELECT current_cefr_level FROM speaking_progress WHERE student_id = NEW.student_id)
      ELSE 
        (SELECT current_cefr_level FROM speaking_progress WHERE student_id = NEW.student_id)
    END;
    
    -- Update speaking progress if level should change
    UPDATE public.speaking_progress 
    SET 
      current_cefr_level = new_level,
      updated_at = NOW()
    WHERE student_id = NEW.student_id 
      AND current_cefr_level != new_level;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic level progression
CREATE TRIGGER speaking_level_progression_trigger
  AFTER INSERT ON public.speaking_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_student_speaking_level();
