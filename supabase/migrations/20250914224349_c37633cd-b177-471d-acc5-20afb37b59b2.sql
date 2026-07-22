-- Phase 2 Continued: Fix remaining database functions with search_path

CREATE OR REPLACE FUNCTION public.update_material_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_speaking_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_achievements(student_uuid uuid, activity_data jsonb)
RETURNS jsonb[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.record_learning_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;