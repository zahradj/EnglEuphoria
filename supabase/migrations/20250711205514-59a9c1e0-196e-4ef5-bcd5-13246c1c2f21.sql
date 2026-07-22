-- Speaking Classroom Database Schema
-- Table for AI-generated topics
CREATE TABLE public.ai_generated_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_text TEXT NOT NULL,
  category TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  context_prompts JSONB DEFAULT '{}',
  difficulty_score INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for speaking groups
CREATE TABLE public.speaking_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  max_participants INTEGER DEFAULT 6,
  current_participants INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 45,
  topic_category TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for speaking classroom sessions
CREATE TABLE public.speaking_classroom_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES speaking_groups(id),
  topic_id UUID REFERENCES ai_generated_topics(id),
  generated_topic TEXT,
  session_type TEXT DEFAULT 'guided',
  difficulty_level TEXT,
  total_questions INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  avg_response_time INTEGER,
  vocabulary_used JSONB DEFAULT '[]',
  session_metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for speaking group sessions
CREATE TABLE public.speaking_group_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES speaking_groups(id) NOT NULL,
  session_topic TEXT NOT NULL,
  ai_facilitator_prompt TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  session_status TEXT DEFAULT 'scheduled',
  participant_count INTEGER DEFAULT 0,
  session_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for speaking questions
CREATE TABLE public.speaking_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES speaking_classroom_sessions(id),
  group_session_id UUID REFERENCES speaking_group_sessions(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'follow_up',
  student_response TEXT,
  ai_analysis JSONB DEFAULT '{}',
  response_time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for group participants
CREATE TABLE public.speaking_group_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES speaking_groups(id) NOT NULL,
  session_id UUID REFERENCES speaking_group_sessions(id),
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  participation_score DECIMAL(3,2) DEFAULT 0.00,
  speaking_time_seconds INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  ai_feedback JSONB DEFAULT '{}'
);

-- Table for student speaking profiles
CREATE TABLE public.student_speaking_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  current_cefr_level TEXT NOT NULL DEFAULT 'A1',
  confidence_level TEXT DEFAULT 'medium',
  preferred_topics TEXT[] DEFAULT '{}',
  speaking_goals TEXT[] DEFAULT '{}',
  availability_schedule JSONB DEFAULT '{}',
  personality_type TEXT DEFAULT 'ambivert',
  learning_style TEXT DEFAULT 'mixed',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_generated_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_speaking_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_generated_topics
CREATE POLICY "Anyone can view active topics" ON public.ai_generated_topics
  FOR SELECT USING (is_active = true);

-- RLS Policies for speaking_groups
CREATE POLICY "Users can view active groups" ON public.speaking_groups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create groups" ON public.speaking_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.speaking_groups
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for speaking_classroom_sessions
CREATE POLICY "Users can view their own classroom sessions" ON public.speaking_classroom_sessions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own classroom sessions" ON public.speaking_classroom_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own classroom sessions" ON public.speaking_classroom_sessions
  FOR UPDATE USING (auth.uid() = student_id);

-- RLS Policies for speaking_group_sessions
CREATE POLICY "Group participants can view group sessions" ON public.speaking_group_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM speaking_group_participants 
      WHERE group_id = speaking_group_sessions.group_id 
      AND student_id = auth.uid()
    )
  );

-- RLS Policies for speaking_questions
CREATE POLICY "Users can view questions from their sessions" ON public.speaking_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM speaking_classroom_sessions 
      WHERE id = speaking_questions.session_id 
      AND student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM speaking_group_participants sgp
      JOIN speaking_group_sessions sgs ON sgp.session_id = sgs.id
      WHERE sgs.id = speaking_questions.group_session_id 
      AND sgp.student_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions in their sessions" ON public.speaking_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM speaking_classroom_sessions 
      WHERE id = speaking_questions.session_id 
      AND student_id = auth.uid()
    )
  );

-- RLS Policies for speaking_group_participants
CREATE POLICY "Users can view their own participation records" ON public.speaking_group_participants
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own participation records" ON public.speaking_group_participants
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own participation records" ON public.speaking_group_participants
  FOR UPDATE USING (auth.uid() = student_id);

-- RLS Policies for student_speaking_profiles
CREATE POLICY "Users can view their own speaking profile" ON public.student_speaking_profiles
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own speaking profile" ON public.student_speaking_profiles
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own speaking profile" ON public.student_speaking_profiles
  FOR UPDATE USING (auth.uid() = student_id);

-- Create indexes for better performance
CREATE INDEX idx_ai_topics_cefr_level ON public.ai_generated_topics(cefr_level);
CREATE INDEX idx_ai_topics_category ON public.ai_generated_topics(category);
CREATE INDEX idx_speaking_groups_cefr_level ON public.speaking_groups(cefr_level);
CREATE INDEX idx_speaking_groups_active ON public.speaking_groups(is_active);
CREATE INDEX idx_classroom_sessions_student ON public.speaking_classroom_sessions(student_id);
CREATE INDEX idx_group_sessions_group_id ON public.speaking_group_sessions(group_id);
CREATE INDEX idx_group_participants_group ON public.speaking_group_participants(group_id);
CREATE INDEX idx_group_participants_student ON public.speaking_group_participants(student_id);
CREATE INDEX idx_speaking_profiles_student ON public.student_speaking_profiles(student_id);
CREATE INDEX idx_speaking_profiles_cefr ON public.student_speaking_profiles(current_cefr_level);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_speaking_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for speaking_groups
CREATE TRIGGER update_speaking_groups_updated_at
  BEFORE UPDATE ON public.speaking_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_speaking_groups_updated_at();

-- Function to update group participant count
CREATE OR REPLACE FUNCTION public.update_group_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.speaking_groups 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.speaking_groups 
    SET current_participants = current_participants - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain group participant count
CREATE TRIGGER trigger_update_group_participant_count
  AFTER INSERT OR DELETE ON public.speaking_group_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_participant_count();