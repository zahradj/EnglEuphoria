-- Complete remaining security fixes
-- Address remaining RLS policy gaps and function search path issues

-- 1. Add missing RLS policies for tables that have RLS enabled but no policies

-- Add policies for security_audit_logs table (missing policies)
CREATE POLICY "System can insert audit logs"
ON public.security_audit_logs
FOR INSERT
WITH CHECK (true); -- Allow system to insert audit logs

-- Add policies for any other tables with RLS enabled but no policies
-- Check if student_xp table exists and add policies if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_xp' AND table_schema = 'public') THEN
    -- Add RLS policies for student_xp table
    DROP POLICY IF EXISTS "Users can view their own XP" ON public.student_xp;
    CREATE POLICY "Users can view their own XP"
    ON public.student_xp
    FOR SELECT
    USING (student_id = auth.uid());
    
    DROP POLICY IF EXISTS "System can update student XP" ON public.student_xp;
    CREATE POLICY "System can update student XP"
    ON public.student_xp
    FOR ALL
    USING (student_id = auth.uid());
  END IF;
END $$;

-- 2. Fix functions with mutable search_path

-- Update all existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_student_success_prediction(student_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.get_approved_teachers()
RETURNS TABLE(id uuid, user_id uuid, full_name text, bio text, video_url text, profile_image_url text, specializations text[], accent text, languages_spoken text[], years_experience integer, rating numeric, total_reviews integer, hourly_rate_dzd integer, hourly_rate_eur integer, timezone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.user_id,
    u.full_name,
    tp.bio,
    tp.video_url,
    tp.profile_image_url,
    tp.specializations,
    tp.accent,
    tp.languages_spoken,
    tp.years_experience,
    tp.rating,
    tp.total_reviews,
    tp.hourly_rate_dzd,
    tp.hourly_rate_eur,
    tp.timezone
  FROM public.teacher_profiles tp
  JOIN public.users u ON tp.user_id = u.id
  WHERE tp.profile_complete = true 
    AND tp.can_teach = true 
    AND tp.is_available = true;
END;
$function$;

-- 3. Add comprehensive RLS policies for all AI-related tables
CREATE POLICY "Users can manage own AI learning models"
ON public.ai_learning_models
FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Users can manage own learning events"
ON public.ai_learning_events
FOR ALL
USING (auth.uid() = student_id);

-- 4. Secure teacher performance metrics
CREATE POLICY "Admins can view all teacher metrics"
ON public.teacher_performance_metrics
FOR SELECT
USING (public.is_user_admin());

CREATE POLICY "System can manage teacher metrics"
ON public.teacher_performance_metrics
FOR INSERT
WITH CHECK (true);

-- 5. Add policies for class_bookings if missing
CREATE POLICY "Admins can manage all bookings"
ON public.class_bookings
FOR ALL
USING (public.is_user_admin());

-- 6. Ensure teacher earnings are properly secured
CREATE POLICY "Admins can view all teacher earnings"
ON public.teacher_earnings
FOR SELECT
USING (public.is_user_admin());

-- 7. Add comprehensive audit trail for sensitive operations
CREATE OR REPLACE FUNCTION public.enhanced_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get current user role safely
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Log the security event with enhanced metadata
  PERFORM public.log_security_event(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'user_role', user_role,
      'timestamp', now(),
      'changes', CASE 
        WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
          'old', to_jsonb(OLD),
          'new', to_jsonb(NEW)
        )
        WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
        WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        ELSE '{}'::jsonb
      END
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add enhanced audit triggers to additional sensitive tables
DROP TRIGGER IF EXISTS enhanced_audit_teacher_profiles ON public.teacher_profiles;
CREATE TRIGGER enhanced_audit_teacher_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

DROP TRIGGER IF EXISTS enhanced_audit_users ON public.users;
CREATE TRIGGER enhanced_audit_users
  AFTER UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

-- 8. Create secure admin verification function
CREATE OR REPLACE FUNCTION public.verify_admin_access(required_permission text DEFAULT 'admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  
  -- Log admin access attempt
  PERFORM public.log_security_event(
    'admin_access_check',
    'security',
    auth.uid()::text,
    jsonb_build_object(
      'required_permission', required_permission,
      'user_role', user_role,
      'granted', (user_role = 'admin')
    )
  );
  
  RETURN (user_role = 'admin');
END;
$$;