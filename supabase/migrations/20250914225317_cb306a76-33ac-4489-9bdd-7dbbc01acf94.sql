-- Final Phase: Fix remaining 6 functions with mutable search paths only

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

-- 2. Fix trigger_update_teacher_metrics function
CREATE OR REPLACE FUNCTION public.trigger_update_teacher_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.update_teacher_performance_metrics(NEW.teacher_id);
  RETURN NEW;
END;
$function$;

-- 3. Fix process_learning_event function
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

-- 4. Fix update_teacher_performance_metrics function
CREATE OR REPLACE FUNCTION public.update_teacher_performance_metrics(teacher_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  feedback_rate DECIMAL(5,2);
  avg_quality DECIMAL(3,2);
  attendance DECIMAL(5,2);
BEGIN
  -- Calculate feedback completion rate
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(*) FILTER (WHERE feedback_submitted = true) * 100.0 / COUNT(*))
    END INTO feedback_rate
  FROM public.lessons 
  WHERE teacher_id = teacher_uuid 
    AND scheduled_at >= NOW() - INTERVAL '30 days';

  -- Calculate average lesson quality
  SELECT COALESCE(AVG(quality_rating), 0) INTO avg_quality
  FROM public.lessons 
  WHERE teacher_id = teacher_uuid 
    AND quality_rating IS NOT NULL
    AND scheduled_at >= NOW() - INTERVAL '30 days';

  -- Calculate attendance rate (assuming status 'completed' means attended)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))
    END INTO attendance
  FROM public.lessons 
  WHERE teacher_id = teacher_uuid 
    AND scheduled_at >= NOW() - INTERVAL '30 days';

  -- Insert or update performance metrics
  INSERT INTO public.teacher_performance_metrics (
    teacher_id, 
    feedback_completion_rate, 
    lesson_quality_score, 
    attendance_rate,
    overall_kpi_score
  ) VALUES (
    teacher_uuid, 
    feedback_rate, 
    avg_quality, 
    attendance,
    (feedback_rate + (avg_quality * 20) + attendance) / 3
  )
  ON CONFLICT (teacher_id) 
  DO UPDATE SET
    feedback_completion_rate = EXCLUDED.feedback_completion_rate,
    lesson_quality_score = EXCLUDED.lesson_quality_score,
    attendance_rate = EXCLUDED.attendance_rate,
    overall_kpi_score = EXCLUDED.overall_kpi_score,
    updated_at = NOW();
END;
$function$;

-- 5. Fix record_learning_analytics function
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

-- 6. Fix update_speaking_progress function
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