-- Phase 3 Ultimate: Fix the last remaining database functions

-- Complete final functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_student_curriculum_analytics(p_student_id uuid, p_curriculum_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overall_progress', COALESCE(scp.completion_percentage, 0),
    'current_week', COALESCE(scp.current_week, 1),
    'current_lesson', COALESCE(scp.current_lesson, 1),
    'vocabulary_mastered_count', COALESCE(array_length(scp.vocabulary_mastered, 1), 0),
    'grammar_patterns_count', COALESCE(array_length(scp.grammar_patterns_learned, 1), 0),
    'conversation_milestones_count', COALESCE(array_length(scp.conversation_milestones_achieved, 1), 0),
    'lessons_completed', COALESCE(lessons_stats.completed_count, 0),
    'total_study_time_hours', COALESCE(lessons_stats.total_study_time, 0),
    'average_engagement_score', COALESCE(lessons_stats.avg_engagement, 0),
    'average_memory_score', COALESCE(lessons_stats.avg_memory, 0),
    'average_attention_score', COALESCE(lessons_stats.avg_attention, 0),
    'weeks_assessed', COALESCE(assessment_stats.weeks_assessed, 0),
    'average_conversation_fluency', COALESCE(assessment_stats.avg_conversation_fluency, 0),
    'average_sentence_construction', COALESCE(assessment_stats.avg_sentence_construction, 0)
  ) INTO result
  FROM public.student_curriculum_progress scp
  LEFT JOIN (
    SELECT 
      COUNT(*) as completed_count,
      ROUND(AVG(conversation_time_seconds) / 3600.0, 2) as total_study_time,
      ROUND(AVG(neuroscience_engagement_score), 2) as avg_engagement,
      ROUND(AVG(memory_consolidation_score), 2) as avg_memory,
      ROUND(AVG(attention_optimization_score), 2) as avg_attention
    FROM public.lesson_completions 
    WHERE student_id = p_student_id AND curriculum_id = p_curriculum_id
  ) lessons_stats ON true
  LEFT JOIN (
    SELECT 
      COUNT(*) as weeks_assessed,
      ROUND(AVG(conversation_fluency_score), 2) as avg_conversation_fluency,
      ROUND(AVG(sentence_construction_score), 2) as avg_sentence_construction
    FROM public.weekly_assessments 
    WHERE student_id = p_student_id AND curriculum_id = p_curriculum_id
  ) assessment_stats ON true
  WHERE scp.student_id = p_student_id AND scp.curriculum_id = p_curriculum_id;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_teacher_minimum_slots()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  weekly_slot_count INTEGER;
  week_start DATE;
  week_end DATE;
  teacher_total_slots INTEGER;
  required_minimum CONSTANT INTEGER := 20;
BEGIN
  -- Calculate the start and end of the current week for the slot being inserted/updated
  week_start := date_trunc('week', COALESCE(NEW.start_time, OLD.start_time)::date);
  week_end := week_start + INTERVAL '6 days';
  
  -- Check total slots for grace period (allow new teachers to build up their schedule)
  SELECT COUNT(*) INTO teacher_total_slots
  FROM public.teacher_availability
  WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id);
  
  -- Grace period: Allow teachers to create their first 20 slots without validation
  IF teacher_total_slots < required_minimum AND TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Count available slots for this teacher in the same week
  SELECT COUNT(*) INTO weekly_slot_count
  FROM public.teacher_availability
  WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
    AND start_time::date BETWEEN week_start AND week_end
    AND is_available = true
    AND (TG_OP = 'DELETE' OR id != COALESCE(NEW.id, OLD.id)); -- Exclude current record for updates
  
  -- Add 1 if this is an insert or update of an available slot
  IF TG_OP != 'DELETE' AND NEW.is_available = true THEN
    weekly_slot_count := weekly_slot_count + 1;
  END IF;
  
  -- Enforce minimum requirement only after grace period
  IF weekly_slot_count < required_minimum AND teacher_total_slots >= required_minimum THEN
    RAISE EXCEPTION 'Teachers must maintain at least % available slots per week. Current count for week starting %: %. You need % more slots. Use bulk creation to add multiple slots efficiently.', 
      required_minimum, 
      week_start, 
      weekly_slot_count, 
      (required_minimum - weekly_slot_count);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_currency(student_uuid uuid, coins_to_add integer, currency_source text DEFAULT 'general'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_record RECORD;
  new_total INTEGER;
BEGIN
  -- Get or create currency record
  SELECT * INTO current_record FROM public.learning_currency WHERE student_id = student_uuid;
  
  IF current_record IS NULL THEN
    INSERT INTO public.learning_currency (student_id, total_coins)
    VALUES (student_uuid, coins_to_add)
    RETURNING * INTO current_record;
    new_total := coins_to_add;
  ELSE
    new_total := current_record.total_coins + coins_to_add;
    
    UPDATE public.learning_currency 
    SET 
      total_coins = new_total,
      streak_bonus_coins = CASE WHEN currency_source = 'streak' THEN streak_bonus_coins + coins_to_add ELSE streak_bonus_coins END,
      achievement_bonus_coins = CASE WHEN currency_source = 'achievement' THEN achievement_bonus_coins + coins_to_add ELSE achievement_bonus_coins END,
      updated_at = now()
    WHERE student_id = student_uuid;
  END IF;
  
  RETURN jsonb_build_object(
    'total_coins', new_total,
    'coins_added', coins_to_add,
    'source', currency_source
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_streak(student_uuid uuid, streak_type_param text DEFAULT 'daily'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_record RECORD;
  new_streak INTEGER;
  streak_multiplier DECIMAL(3,2);
  bonus_coins INTEGER;
BEGIN
  SELECT * INTO current_record FROM public.student_learning_streaks 
  WHERE student_id = student_uuid AND streak_type = streak_type_param;
  
  IF current_record IS NULL THEN
    INSERT INTO public.student_learning_streaks (student_id, streak_type, current_streak, longest_streak)
    VALUES (student_uuid, streak_type_param, 1, 1)
    RETURNING * INTO current_record;
    new_streak := 1;
  ELSE
    -- Check if streak should continue or reset
    IF current_record.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
      new_streak := current_record.current_streak + 1;
    ELSIF current_record.last_activity_date = CURRENT_DATE THEN
      new_streak := current_record.current_streak; -- Same day, no change
    ELSE
      new_streak := 1; -- Reset streak
    END IF;
    
    UPDATE public.student_learning_streaks
    SET 
      current_streak = new_streak,
      longest_streak = GREATEST(longest_streak, new_streak),
      last_activity_date = CURRENT_DATE,
      updated_at = now()
    WHERE student_id = student_uuid AND streak_type = streak_type_param;
  END IF;
  
  -- Calculate bonus coins based on streak
  bonus_coins := CASE 
    WHEN new_streak >= 30 THEN 50
    WHEN new_streak >= 14 THEN 25
    WHEN new_streak >= 7 THEN 10
    WHEN new_streak >= 3 THEN 5
    ELSE 0
  END;
  
  -- Award bonus coins if applicable
  IF bonus_coins > 0 THEN
    PERFORM public.update_learning_currency(student_uuid, bonus_coins, 'streak');
  END IF;
  
  RETURN jsonb_build_object(
    'current_streak', new_streak,
    'longest_streak', GREATEST(current_record.longest_streak, new_streak),
    'bonus_coins', bonus_coins,
    'streak_type', streak_type_param
  );
END;
$function$;