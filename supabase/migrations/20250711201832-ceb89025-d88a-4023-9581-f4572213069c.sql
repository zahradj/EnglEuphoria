-- Create AI learning analytics and personalization tables
CREATE TABLE public.ai_learning_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id),
  model_type TEXT NOT NULL, -- 'adaptive_path', 'learning_style', 'difficulty_preference'
  model_data JSONB NOT NULL DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI tutoring sessions table
CREATE TABLE public.ai_tutoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id),
  conversation_id TEXT NOT NULL,
  session_type TEXT NOT NULL, -- 'voice', 'text', 'mixed'
  topic TEXT,
  cefr_level TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  ai_model TEXT DEFAULT 'gpt-4',
  voice_model TEXT DEFAULT 'alloy',
  session_data JSONB DEFAULT '{}',
  learning_objectives TEXT[],
  completed_objectives TEXT[],
  session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
  feedback_notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create adaptive content table
CREATE TABLE public.adaptive_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'lesson', 'exercise', 'quiz', 'worksheet'
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  cefr_level TEXT NOT NULL,
  learning_objectives TEXT[] NOT NULL,
  prerequisites TEXT[],
  content_data JSONB NOT NULL,
  ai_generated BOOLEAN DEFAULT FALSE,
  generation_prompt TEXT,
  tags TEXT[],
  estimated_duration INTEGER, -- in minutes
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  avg_completion_time INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personalized learning paths table
CREATE TABLE public.personalized_learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id),
  path_name TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,
  path_data JSONB NOT NULL, -- contains ordered content IDs and metadata
  learning_style TEXT, -- 'visual', 'auditory', 'kinesthetic', 'mixed'
  difficulty_preference TEXT, -- 'gradual', 'challenging', 'adaptive'
  estimated_completion_days INTEGER,
  actual_completion_days INTEGER,
  completion_percentage DECIMAL(5,2) DEFAULT 0.0,
  ai_generated BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI conversation messages table
CREATE TABLE public.ai_conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_tutoring_sessions(id),
  message_type TEXT NOT NULL, -- 'user_text', 'user_audio', 'ai_text', 'ai_audio'
  content TEXT,
  audio_url TEXT,
  audio_duration INTEGER, -- in seconds
  metadata JSONB DEFAULT '{}',
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning analytics events table
CREATE TABLE public.ai_learning_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id),
  event_type TEXT NOT NULL, -- 'content_start', 'content_complete', 'struggle_detected', 'mastery_achieved'
  content_id UUID REFERENCES public.adaptive_content(id),
  session_id UUID REFERENCES public.ai_tutoring_sessions(id),
  event_data JSONB NOT NULL DEFAULT '{}',
  performance_score DECIMAL(5,2),
  time_spent_seconds INTEGER,
  help_requested BOOLEAN DEFAULT FALSE,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.ai_learning_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_events ENABLE ROW LEVEL SECURITY;

-- AI Learning Models policies
CREATE POLICY "Users can view their own AI models" ON public.ai_learning_models
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can update their own AI models" ON public.ai_learning_models
  FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "System can insert AI models" ON public.ai_learning_models
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- AI Tutoring Sessions policies
CREATE POLICY "Users can view their own tutoring sessions" ON public.ai_tutoring_sessions
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can create their own tutoring sessions" ON public.ai_tutoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own tutoring sessions" ON public.ai_tutoring_sessions
  FOR UPDATE USING (auth.uid() = student_id);

-- Adaptive Content policies
CREATE POLICY "Everyone can view active content" ON public.adaptive_content
  FOR SELECT USING (is_active = true);
CREATE POLICY "Teachers can create content" ON public.adaptive_content
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );
CREATE POLICY "Content creators can update their content" ON public.adaptive_content
  FOR UPDATE USING (auth.uid() = created_by);

-- Personalized Learning Paths policies
CREATE POLICY "Users can view their own learning paths" ON public.personalized_learning_paths
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can update their own learning paths" ON public.personalized_learning_paths
  FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "System can create learning paths" ON public.personalized_learning_paths
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- AI Conversation Messages policies
CREATE POLICY "Users can view messages from their sessions" ON public.ai_conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_tutoring_sessions 
      WHERE id = session_id AND student_id = auth.uid()
    )
  );
CREATE POLICY "Users can create messages in their sessions" ON public.ai_conversation_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_tutoring_sessions 
      WHERE id = session_id AND student_id = auth.uid()
    )
  );

-- AI Learning Events policies
CREATE POLICY "Users can view their own learning events" ON public.ai_learning_events
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can create their own learning events" ON public.ai_learning_events
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Create indexes for performance
CREATE INDEX idx_ai_learning_models_student_id ON public.ai_learning_models(student_id);
CREATE INDEX idx_ai_learning_models_model_type ON public.ai_learning_models(model_type);
CREATE INDEX idx_ai_tutoring_sessions_student_id ON public.ai_tutoring_sessions(student_id);
CREATE INDEX idx_ai_tutoring_sessions_created_at ON public.ai_tutoring_sessions(created_at);
CREATE INDEX idx_adaptive_content_cefr_level ON public.adaptive_content(cefr_level);
CREATE INDEX idx_adaptive_content_difficulty ON public.adaptive_content(difficulty_level);
CREATE INDEX idx_personalized_paths_student_id ON public.personalized_learning_paths(student_id);
CREATE INDEX idx_ai_conversation_messages_session_id ON public.ai_conversation_messages(session_id);
CREATE INDEX idx_ai_learning_events_student_id ON public.ai_learning_events(student_id);
CREATE INDEX idx_ai_learning_events_created_at ON public.ai_learning_events(created_at);

-- Create functions for AI learning analytics
CREATE OR REPLACE FUNCTION public.update_learning_model(
  student_uuid UUID,
  model_type_param TEXT,
  new_model_data JSONB,
  confidence DECIMAL(3,2) DEFAULT 0.8
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  model_id UUID;
BEGIN
  INSERT INTO public.ai_learning_models (
    student_id, 
    model_type, 
    model_data, 
    confidence_score
  ) VALUES (
    student_uuid, 
    model_type_param, 
    new_model_data, 
    confidence
  )
  ON CONFLICT (student_id, model_type) 
  DO UPDATE SET
    model_data = EXCLUDED.model_data,
    confidence_score = EXCLUDED.confidence_score,
    last_updated_at = NOW()
  RETURNING id INTO model_id;
  
  RETURN model_id;
END;
$$;

-- Function to generate adaptive learning path
CREATE OR REPLACE FUNCTION public.generate_adaptive_learning_path(
  student_uuid UUID,
  target_cefr_level TEXT,
  learning_style_param TEXT DEFAULT 'mixed',
  difficulty_pref TEXT DEFAULT 'adaptive'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  path_id UUID;
  content_items JSONB;
BEGIN
  -- Get suitable content based on student's level and preferences
  SELECT jsonb_agg(
    jsonb_build_object(
      'content_id', id,
      'title', title,
      'difficulty_level', difficulty_level,
      'estimated_duration', estimated_duration,
      'order_index', ROW_NUMBER() OVER (ORDER BY difficulty_level, success_rate DESC)
    )
  ) INTO content_items
  FROM public.adaptive_content
  WHERE cefr_level = target_cefr_level 
    AND is_active = true
  ORDER BY difficulty_level, success_rate DESC
  LIMIT 20;

  -- Create personalized learning path
  INSERT INTO public.personalized_learning_paths (
    student_id,
    path_name,
    total_steps,
    path_data,
    learning_style,
    difficulty_preference,
    estimated_completion_days
  ) VALUES (
    student_uuid,
    'AI-Generated Path for ' || target_cefr_level,
    jsonb_array_length(content_items),
    jsonb_build_object('content_sequence', content_items),
    learning_style_param,
    difficulty_pref,
    jsonb_array_length(content_items) * 2 -- Estimate 2 days per item
  )
  RETURNING id INTO path_id;
  
  RETURN path_id;
END;
$$;

-- Trigger for automatic learning analytics
CREATE OR REPLACE FUNCTION public.process_learning_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update student XP based on performance
  IF NEW.event_type = 'content_complete' AND NEW.performance_score IS NOT NULL THEN
    PERFORM public.update_student_xp(
      NEW.student_id, 
      GREATEST(10, (NEW.performance_score * 0.5)::INTEGER)
    );
  END IF;
  
  -- Update learning path progress
  IF NEW.event_type = 'content_complete' THEN
    UPDATE public.personalized_learning_paths
    SET 
      current_step = current_step + 1,
      completion_percentage = LEAST(100, ((current_step + 1)::DECIMAL / total_steps) * 100),
      last_activity_at = NOW(),
      completed_at = CASE 
        WHEN current_step + 1 >= total_steps THEN NOW() 
        ELSE completed_at 
      END
    WHERE student_id = NEW.student_id 
      AND completed_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_process_learning_event
  AFTER INSERT ON public.ai_learning_events
  FOR EACH ROW
  EXECUTE FUNCTION public.process_learning_event();