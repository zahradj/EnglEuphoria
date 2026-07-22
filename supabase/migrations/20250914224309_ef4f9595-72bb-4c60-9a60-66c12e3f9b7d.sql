-- Phase 2: Database Function Security Hardening
-- Fix search_path security issues for all database functions

-- Fix functions without proper search_path settings
CREATE OR REPLACE FUNCTION public.update_teacher_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE teacher_profiles 
  SET 
    rating = (
      SELECT ROUND(AVG(rating::numeric), 2)
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    updated_at = now()
  WHERE user_id = NEW.teacher_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_monthly_class_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE user_subscriptions 
  SET classes_used_this_month = 0, updated_at = now()
  WHERE DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', now());
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_teacher_application_stage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-update stage based on completed steps
  IF NEW.equipment_test_passed = true AND OLD.equipment_test_passed = false THEN
    NEW.current_stage = 'interview_scheduled';
  ELSIF NEW.interview_passed = true AND OLD.interview_passed = false THEN
    NEW.current_stage = 'final_review';
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_teacher_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if required fields are filled
  NEW.profile_complete = (
    NEW.bio IS NOT NULL AND NEW.bio != '' AND 
    NEW.video_url IS NOT NULL AND NEW.video_url != ''
  );
  
  -- Auto-approve for now (admin can change this later)
  IF NEW.profile_complete = true AND OLD.profile_complete = false THEN
    NEW.can_teach = true;
    NEW.profile_approved_by_admin = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_teacher_application_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access attempts to teacher applications for security monitoring
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    'teacher_applications',
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    jsonb_build_object(
      'timestamp', now(),
      'user_email', auth.jwt() ->> 'email',
      'ip_address', inet_client_addr()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;