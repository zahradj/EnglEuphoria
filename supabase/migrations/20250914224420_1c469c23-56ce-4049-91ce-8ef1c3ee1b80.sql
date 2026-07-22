-- Phase 2 Final: Complete remaining database function security fixes

-- Fix remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_student_success_prediction(student_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  prediction_result JSONB;
  recent_performance JSONB;
  engagement_score DECIMAL;
BEGIN
  -- Get recent performance metrics
  SELECT jsonb_agg(
    jsonb_build_object(
      'metric_type', metric_type,
      'value', metric_value,
      'date', date_recorded
    )
  ) INTO recent_performance
  FROM public.performance_metrics 
  WHERE student_id = student_uuid 
    AND date_recorded >= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate engagement score
  SELECT COALESCE(AVG(session_duration), 0) / 3600.0 INTO engagement_score
  FROM public.learning_analytics 
  WHERE student_id = student_uuid 
    AND recorded_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Build prediction result
  prediction_result := jsonb_build_object(
    'success_probability', LEAST(GREATEST(engagement_score * 0.7 + 0.3, 0), 1),
    'engagement_level', CASE 
      WHEN engagement_score > 2 THEN 'high'
      WHEN engagement_score > 1 THEN 'medium'
      ELSE 'low'
    END,
    'recent_performance', recent_performance,
    'recommendations', jsonb_build_array(
      'Increase practice frequency',
      'Focus on weaker skill areas',
      'Schedule regular lessons'
    )
  );

  RETURN prediction_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_organization_analytics(org_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
  total_users INTEGER;
  active_users INTEGER;
  total_lessons INTEGER;
  avg_satisfaction DECIMAL;
BEGIN
  -- Get user counts
  SELECT COUNT(*) INTO total_users
  FROM public.organization_members 
  WHERE organization_id = org_uuid AND status = 'active';

  -- Get active users (logged in last 30 days)
  SELECT COUNT(DISTINCT om.user_id) INTO active_users
  FROM public.organization_members om
  JOIN public.users u ON om.user_id = u.id
  WHERE om.organization_id = org_uuid 
    AND u.updated_at >= CURRENT_DATE - INTERVAL '30 days';

  -- Get total lessons
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons l
  JOIN public.organization_members om ON l.student_id = om.user_id
  WHERE om.organization_id = org_uuid;

  -- Get average satisfaction (from teacher reviews)
  SELECT COALESCE(AVG(rating), 0) INTO avg_satisfaction
  FROM public.teacher_reviews tr
  JOIN public.organization_members om ON tr.student_id = om.user_id
  WHERE om.organization_id = org_uuid;

  result := jsonb_build_object(
    'total_users', total_users,
    'active_users', active_users,
    'engagement_rate', CASE WHEN total_users > 0 THEN active_users::DECIMAL / total_users ELSE 0 END,
    'total_lessons', total_lessons,
    'average_satisfaction', avg_satisfaction,
    'generated_at', now()
  );

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;