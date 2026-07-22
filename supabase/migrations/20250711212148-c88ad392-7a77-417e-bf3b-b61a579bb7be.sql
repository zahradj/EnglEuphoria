-- Phase 10: Advanced AI & Analytics Intelligence Database Schema

-- ML Predictions table for storing AI model predictions
CREATE TABLE public.ml_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  prediction_type TEXT NOT NULL, -- 'success_probability', 'dropout_risk', 'optimal_difficulty', etc.
  prediction_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  model_version TEXT,
  features_used JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Learning Analytics Events for detailed tracking
CREATE TABLE public.learning_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- 'session_start', 'content_interaction', 'quiz_attempt', etc.
  event_data JSONB NOT NULL,
  session_id UUID,
  content_id UUID,
  learning_context JSONB, -- Current learning state, difficulty level, etc.
  performance_metrics JSONB, -- Accuracy, speed, engagement, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Generated Insights
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id),
  teacher_id UUID REFERENCES auth.users(id),
  insight_type TEXT NOT NULL, -- 'learning_pattern', 'recommendation', 'warning', etc.
  insight_content TEXT NOT NULL,
  insight_data JSONB,
  priority_level INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=critical
  is_actionable BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Learning Patterns for pattern recognition
CREATE TABLE public.learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  pattern_type TEXT NOT NULL, -- 'study_time', 'difficulty_preference', 'content_type', etc.
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  observation_count INTEGER DEFAULT 1
);

-- Intervention Triggers and Actions
CREATE TABLE public.learning_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  teacher_id UUID REFERENCES auth.users(id),
  trigger_type TEXT NOT NULL, -- 'low_engagement', 'poor_performance', 'streak_break', etc.
  intervention_type TEXT NOT NULL, -- 'reminder', 'content_suggestion', 'difficulty_adjustment', etc.
  intervention_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'acknowledged', 'completed'
  effectiveness_score DECIMAL(3,2),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced AI Conversation Sessions
CREATE TABLE public.advanced_ai_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  session_context JSONB NOT NULL, -- Learning goals, current topic, mood, etc.
  conversation_history JSONB DEFAULT '[]'::jsonb,
  ai_personality TEXT DEFAULT 'encouraging', -- 'encouraging', 'challenging', 'analytical', etc.
  emotional_state JSONB, -- Detected student emotional state
  learning_objectives JSONB,
  session_quality_score DECIMAL(3,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content Performance Analytics
CREATE TABLE public.content_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'lesson', 'quiz', 'exercise', etc.
  analytics_data JSONB NOT NULL, -- Completion rates, difficulty scores, engagement metrics
  student_cohort TEXT, -- 'beginner', 'intermediate', 'advanced'
  time_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  performance_metrics JSONB,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Smart Recommendations Engine
CREATE TABLE public.smart_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  recommendation_type TEXT NOT NULL, -- 'content', 'study_schedule', 'learning_path', etc.
  recommendation_data JSONB NOT NULL,
  reasoning JSONB, -- Why this recommendation was made
  priority_score DECIMAL(3,2),
  accepted BOOLEAN,
  feedback_score INTEGER, -- 1-5 rating from student
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  acted_upon_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ML Predictions
CREATE POLICY "Users can view their own ML predictions" ON public.ml_predictions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can insert ML predictions" ON public.ml_predictions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS Policies for Learning Analytics Events
CREATE POLICY "Users can view their own analytics events" ON public.learning_analytics_events
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own analytics events" ON public.learning_analytics_events
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS Policies for AI Insights
CREATE POLICY "Users can view their own insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "System can create insights" ON public.ai_insights
  FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "Users can update insights they can view" ON public.ai_insights
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = teacher_id);

-- RLS Policies for Learning Patterns
CREATE POLICY "Users can view their own learning patterns" ON public.learning_patterns
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can manage learning patterns" ON public.learning_patterns
  FOR ALL USING (auth.uid() = student_id);

-- RLS Policies for Learning Interventions
CREATE POLICY "Users can view their own interventions" ON public.learning_interventions
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "System can create interventions" ON public.learning_interventions
  FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "Users can update intervention status" ON public.learning_interventions
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = teacher_id);

-- RLS Policies for Advanced AI Sessions
CREATE POLICY "Users can manage their own AI sessions" ON public.advanced_ai_sessions
  FOR ALL USING (auth.uid() = student_id);

-- RLS Policies for Content Analytics (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view content analytics" ON public.content_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage content analytics" ON public.content_analytics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for Smart Recommendations
CREATE POLICY "Users can view their own recommendations" ON public.smart_recommendations
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can update their own recommendations" ON public.smart_recommendations
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "System can create recommendations" ON public.smart_recommendations
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Indexes for performance
CREATE INDEX idx_ml_predictions_student_type ON public.ml_predictions(student_id, prediction_type);
CREATE INDEX idx_ml_predictions_expires ON public.ml_predictions(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_learning_analytics_student_event ON public.learning_analytics_events(student_id, event_type);
CREATE INDEX idx_learning_analytics_session ON public.learning_analytics_events(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_learning_analytics_created ON public.learning_analytics_events(created_at);

CREATE INDEX idx_ai_insights_student_priority ON public.ai_insights(student_id, priority_level);
CREATE INDEX idx_ai_insights_teacher ON public.ai_insights(teacher_id) WHERE teacher_id IS NOT NULL;
CREATE INDEX idx_ai_insights_actionable ON public.ai_insights(is_actionable, action_taken);

CREATE INDEX idx_learning_patterns_student_type ON public.learning_patterns(student_id, pattern_type);
CREATE INDEX idx_learning_patterns_confidence ON public.learning_patterns(confidence_score);

CREATE INDEX idx_interventions_student_status ON public.learning_interventions(student_id, status);
CREATE INDEX idx_interventions_scheduled ON public.learning_interventions(scheduled_for) WHERE scheduled_for IS NOT NULL;

CREATE INDEX idx_ai_sessions_student ON public.advanced_ai_sessions(student_id);
CREATE INDEX idx_ai_sessions_active ON public.advanced_ai_sessions(student_id, ended_at) WHERE ended_at IS NULL;

CREATE INDEX idx_content_analytics_content_period ON public.content_analytics(content_id, time_period);
CREATE INDEX idx_content_analytics_date ON public.content_analytics(date_recorded);

CREATE INDEX idx_recommendations_student_type ON public.smart_recommendations(student_id, recommendation_type);
CREATE INDEX idx_recommendations_priority ON public.smart_recommendations(priority_score);
CREATE INDEX idx_recommendations_expires ON public.smart_recommendations(expires_at) WHERE expires_at IS NOT NULL;

-- Functions for ML and Analytics

-- Function to record learning analytics event
CREATE OR REPLACE FUNCTION public.record_learning_event(
  p_student_id UUID,
  p_event_type TEXT,
  p_event_data JSONB,
  p_session_id UUID DEFAULT NULL,
  p_content_id UUID DEFAULT NULL,
  p_learning_context JSONB DEFAULT NULL,
  p_performance_metrics JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.learning_analytics_events (
    student_id,
    event_type,
    event_data,
    session_id,
    content_id,
    learning_context,
    performance_metrics
  ) VALUES (
    p_student_id,
    p_event_type,
    p_event_data,
    p_session_id,
    p_content_id,
    p_learning_context,
    p_performance_metrics
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Function to create AI insight
CREATE OR REPLACE FUNCTION public.create_ai_insight(
  p_student_id UUID,
  p_teacher_id UUID DEFAULT NULL,
  p_insight_type TEXT,
  p_insight_content TEXT,
  p_insight_data JSONB DEFAULT NULL,
  p_priority_level INTEGER DEFAULT 1,
  p_is_actionable BOOLEAN DEFAULT false,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  insight_id UUID;
BEGIN
  INSERT INTO public.ai_insights (
    student_id,
    teacher_id,
    insight_type,
    insight_content,
    insight_data,
    priority_level,
    is_actionable,
    expires_at
  ) VALUES (
    p_student_id,
    p_teacher_id,
    p_insight_type,
    p_insight_content,
    p_insight_data,
    p_priority_level,
    p_is_actionable,
    p_expires_at
  ) RETURNING id INTO insight_id;
  
  RETURN insight_id;
END;
$$;

-- Function to trigger learning intervention
CREATE OR REPLACE FUNCTION public.trigger_intervention(
  p_student_id UUID,
  p_teacher_id UUID DEFAULT NULL,
  p_trigger_type TEXT,
  p_intervention_type TEXT,
  p_intervention_data JSONB,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  intervention_id UUID;
BEGIN
  INSERT INTO public.learning_interventions (
    student_id,
    teacher_id,
    trigger_type,
    intervention_type,
    intervention_data,
    scheduled_for
  ) VALUES (
    p_student_id,
    p_teacher_id,
    p_trigger_type,
    p_intervention_type,
    p_intervention_data,
    COALESCE(p_scheduled_for, now())
  ) RETURNING id INTO intervention_id;
  
  RETURN intervention_id;
END;
$$;

-- Function to generate smart recommendation
CREATE OR REPLACE FUNCTION public.create_smart_recommendation(
  p_student_id UUID,
  p_recommendation_type TEXT,
  p_recommendation_data JSONB,
  p_reasoning JSONB DEFAULT NULL,
  p_priority_score DECIMAL DEFAULT 0.5,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recommendation_id UUID;
BEGIN
  INSERT INTO public.smart_recommendations (
    student_id,
    recommendation_type,
    recommendation_data,
    reasoning,
    priority_score,
    expires_at
  ) VALUES (
    p_student_id,
    p_recommendation_type,
    p_recommendation_data,
    p_reasoning,
    p_priority_score,
    COALESCE(p_expires_at, now() + INTERVAL '7 days')
  ) RETURNING id INTO recommendation_id;
  
  RETURN recommendation_id;
END;
$$;

-- Function to analyze learning patterns
CREATE OR REPLACE FUNCTION public.analyze_learning_patterns(p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  patterns JSONB := '[]'::jsonb;
  study_time_pattern JSONB;
  performance_pattern JSONB;
  engagement_pattern JSONB;
BEGIN
  -- Analyze study time patterns
  SELECT jsonb_build_object(
    'type', 'study_time',
    'peak_hours', array_agg(DISTINCT EXTRACT(HOUR FROM created_at)),
    'average_session_length', AVG(EXTRACT(EPOCH FROM (lag(created_at) OVER (ORDER BY created_at) - created_at))),
    'consistency_score', COUNT(*) / EXTRACT(DAYS FROM (MAX(created_at) - MIN(created_at)))
  ) INTO study_time_pattern
  FROM public.learning_analytics_events
  WHERE student_id = p_student_id
    AND event_type = 'session_start'
    AND created_at >= now() - INTERVAL '30 days';
  
  -- Analyze performance patterns
  SELECT jsonb_build_object(
    'type', 'performance',
    'average_accuracy', AVG((performance_metrics->>'accuracy')::decimal),
    'improvement_trend', (
      SELECT AVG((performance_metrics->>'accuracy')::decimal)
      FROM public.learning_analytics_events le2
      WHERE le2.student_id = p_student_id
        AND le2.created_at >= now() - INTERVAL '7 days'
    ) - (
      SELECT AVG((performance_metrics->>'accuracy')::decimal)
      FROM public.learning_analytics_events le3
      WHERE le3.student_id = p_student_id
        AND le3.created_at BETWEEN now() - INTERVAL '30 days' AND now() - INTERVAL '23 days'
    )
  ) INTO performance_pattern
  FROM public.learning_analytics_events
  WHERE student_id = p_student_id
    AND performance_metrics ? 'accuracy'
    AND created_at >= now() - INTERVAL '30 days';
  
  -- Combine patterns
  patterns := patterns || study_time_pattern || performance_pattern;
  
  RETURN patterns;
END;
$$;

-- Triggers for automatic pattern detection
CREATE OR REPLACE FUNCTION public.detect_learning_patterns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Detect low engagement pattern
  IF NEW.event_type = 'session_end' AND (NEW.performance_metrics->>'engagement_score')::decimal < 0.3 THEN
    PERFORM public.trigger_intervention(
      NEW.student_id,
      NULL,
      'low_engagement',
      'motivational_message',
      jsonb_build_object('message', 'We noticed you might be struggling. Would you like some help?'),
      now() + INTERVAL '1 hour'
    );
  END IF;
  
  -- Detect poor performance pattern
  IF NEW.event_type = 'quiz_completed' AND (NEW.performance_metrics->>'accuracy')::decimal < 0.5 THEN
    PERFORM public.create_ai_insight(
      NEW.student_id,
      NULL,
      'performance_concern',
      'Student may need additional support in this topic area',
      jsonb_build_object('topic', NEW.learning_context->>'topic', 'accuracy', NEW.performance_metrics->>'accuracy'),
      2,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_detect_learning_patterns
  AFTER INSERT ON public.learning_analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_learning_patterns();

-- Update updated_at trigger for ai_insights
CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_interventions;