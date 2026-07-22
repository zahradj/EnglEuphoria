-- Phase 3: Complete all remaining database function security fixes

-- Fix more functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_learning_model(student_uuid uuid, model_type_param text, new_model_data jsonb, confidence numeric DEFAULT 0.8)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_adaptive_learning_path(student_uuid uuid, target_cefr_level text, learning_style_param text DEFAULT 'mixed'::text, difficulty_pref text DEFAULT 'adaptive'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.process_learning_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.save_placement_test_result(p_user_id uuid, p_cefr_level text, p_score integer, p_total integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update student profile with test results
  UPDATE public.student_profiles 
  SET 
    cefr_level = p_cefr_level,
    placement_test_completed_at = now(),
    placement_test_score = p_score,
    placement_test_total = p_total,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- If no profile exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.student_profiles (
      user_id, 
      cefr_level, 
      placement_test_completed_at,
      placement_test_score,
      placement_test_total
    )
    VALUES (
      p_user_id, 
      p_cefr_level, 
      now(),
      p_score,
      p_total
    );
  END IF;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_group_participant_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;