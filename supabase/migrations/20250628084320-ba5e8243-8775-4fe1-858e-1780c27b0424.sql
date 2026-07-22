
-- Create XP tracking table
CREATE TABLE public.student_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_in_current_level INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirements JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student achievements table
CREATE TABLE public.student_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB DEFAULT '{}',
  UNIQUE(student_id, achievement_id)
);

-- Create learning analytics table
CREATE TABLE public.learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  skill_area TEXT NOT NULL,
  session_duration INTEGER NOT NULL DEFAULT 0,
  accuracy_score DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance metrics table
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  time_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_xp
CREATE POLICY "Users can view their own XP" ON public.student_xp
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can update their own XP" ON public.student_xp
  FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "System can insert XP records" ON public.student_xp
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (is_active = true);

-- RLS policies for student_achievements
CREATE POLICY "Users can view their own achievements" ON public.student_achievements
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "System can insert student achievements" ON public.student_achievements
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS policies for learning_analytics
CREATE POLICY "Users can view their own analytics" ON public.learning_analytics
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "System can insert analytics" ON public.learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS policies for performance_metrics
CREATE POLICY "Users can view their own metrics" ON public.performance_metrics
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "System can insert metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, category, xp_reward, requirements) VALUES
('First Steps', 'Complete your first lesson', '🎯', 'milestone', 50, '{"lessons_completed": 1}'),
('Week Warrior', 'Complete 7 days of learning', '🔥', 'streak', 100, '{"consecutive_days": 7}'),
('Vocabulary Master', 'Learn 100 new words', '📚', 'vocabulary', 150, '{"words_learned": 100}'),
('Grammar Guru', 'Master 10 grammar rules', '📝', 'grammar', 200, '{"grammar_rules": 10}'),
('Speaking Star', 'Complete 5 speaking exercises', '🗣️', 'speaking', 75, '{"speaking_exercises": 5}'),
('Perfect Score', 'Get 100% on any quiz', '⭐', 'achievement', 125, '{"perfect_scores": 1}'),
('Study Streak', 'Study for 30 days straight', '📅', 'streak', 300, '{"consecutive_days": 30}'),
('Quick Learner', 'Complete a lesson in under 10 minutes', '⚡', 'speed', 80, '{"fast_completion": 1}');

-- Function to update XP and check for level ups
CREATE OR REPLACE FUNCTION public.update_student_xp(student_uuid UUID, xp_to_add INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_record RECORD;
  new_total_xp INTEGER;
  new_level INTEGER;
  new_xp_in_level INTEGER;
  level_up BOOLEAN := FALSE;
  xp_per_level CONSTANT INTEGER := 500;
BEGIN
  -- Get current XP record or create if doesn't exist
  SELECT * INTO current_record FROM public.student_xp WHERE student_id = student_uuid;
  
  IF current_record IS NULL THEN
    INSERT INTO public.student_xp (student_id, total_xp, current_level, xp_in_current_level)
    VALUES (student_uuid, xp_to_add, 1, xp_to_add)
    RETURNING * INTO current_record;
    
    new_total_xp := xp_to_add;
    new_level := 1;
    new_xp_in_level := xp_to_add;
  ELSE
    new_total_xp := current_record.total_xp + xp_to_add;
    new_xp_in_level := current_record.xp_in_current_level + xp_to_add;
    new_level := current_record.current_level;
    
    -- Check for level up
    WHILE new_xp_in_level >= xp_per_level LOOP
      new_xp_in_level := new_xp_in_level - xp_per_level;
      new_level := new_level + 1;
      level_up := TRUE;
    END LOOP;
    
    -- Update the record
    UPDATE public.student_xp 
    SET 
      total_xp = new_total_xp,
      current_level = new_level,
      xp_in_current_level = new_xp_in_level,
      last_activity_date = CURRENT_DATE,
      updated_at = now()
    WHERE student_id = student_uuid;
  END IF;
  
  RETURN jsonb_build_object(
    'total_xp', new_total_xp,
    'current_level', new_level,
    'xp_in_current_level', new_xp_in_level,
    'level_up', level_up,
    'xp_added', xp_to_add
  );
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements(student_uuid UUID, activity_data JSONB)
RETURNS JSONB[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement RECORD;
  earned_achievements JSONB[] := '{}';
  requirement_key TEXT;
  requirement_value INTEGER;
  student_progress JSONB;
  current_value INTEGER;
BEGIN
  -- Loop through all active achievements
  FOR achievement IN SELECT * FROM public.achievements WHERE is_active = true LOOP
    -- Check if student already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM public.student_achievements 
      WHERE student_id = student_uuid AND achievement_id = achievement.id
    ) THEN
      -- Check if requirements are met
      FOR requirement_key, requirement_value IN SELECT * FROM jsonb_each_text(achievement.requirements) LOOP
        current_value := COALESCE((activity_data ->> requirement_key)::INTEGER, 0);
        
        IF current_value >= requirement_value::INTEGER THEN
          -- Award the achievement
          INSERT INTO public.student_achievements (student_id, achievement_id)
          VALUES (student_uuid, achievement.id);
          
          -- Add XP reward
          PERFORM public.update_student_xp(student_uuid, achievement.xp_reward);
          
          -- Add to earned achievements array
          earned_achievements := earned_achievements || jsonb_build_object(
            'id', achievement.id,
            'name', achievement.name,
            'description', achievement.description,
            'icon', achievement.icon,
            'xp_reward', achievement.xp_reward
          );
        END IF;
      END LOOP;
    END IF;
  END LOOP;
  
  RETURN earned_achievements;
END;
$$;

-- Trigger to update analytics after speaking sessions
CREATE OR REPLACE FUNCTION public.record_learning_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.learning_analytics (
    student_id,
    activity_type,
    skill_area,
    session_duration,
    accuracy_score,
    xp_earned,
    metadata
  ) VALUES (
    NEW.student_id,
    'speaking_practice',
    'speaking',
    NEW.duration_seconds,
    COALESCE(NEW.overall_rating * 20, 0), -- Convert 1-5 rating to 0-100 scale
    NEW.xp_earned,
    jsonb_build_object(
      'scenario_name', NEW.scenario_name,
      'cefr_level', NEW.cefr_level,
      'pronunciation_score', NEW.pronunciation_score,
      'grammar_score', NEW.grammar_score,
      'fluency_score', NEW.fluency_score
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER speaking_analytics_trigger
  AFTER INSERT ON public.speaking_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.record_learning_analytics();
