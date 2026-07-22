-- Security Fixes Phase 2 - Simplified approach to avoid deadlocks

-- 1. Fix critical anonymous access policies one by one
-- Remove policies that allow public access to sensitive data

-- Virtual rewards - require authentication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'virtual_rewards' AND policyname = 'Anyone can view available rewards') THEN
    DROP POLICY "Anyone can view available rewards" ON public.virtual_rewards;
    CREATE POLICY "Authenticated users can view available rewards" 
    ON public.virtual_rewards 
    FOR SELECT 
    TO authenticated
    USING (is_available = true);
  END IF;
END $$;

-- Achievement tiers - require authentication  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievement_tiers' AND policyname = 'Anyone can view achievement tiers') THEN
    DROP POLICY "Anyone can view achievement tiers" ON public.achievement_tiers;
    CREATE POLICY "Authenticated users can view achievement tiers" 
    ON public.achievement_tiers 
    FOR SELECT 
    TO authenticated
    USING (is_active = true);
  END IF;
END $$;

-- Subscription plans - require authentication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'subscription_plans_public_read') THEN
    DROP POLICY "subscription_plans_public_read" ON public.subscription_plans;
    CREATE POLICY "Authenticated users can view subscription plans" 
    ON public.subscription_plans 
    FOR SELECT 
    TO authenticated
    USING (is_active = true);
  END IF;
END $$;

-- Systematic lessons - tighten access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'systematic_lessons' AND policyname = 'Anyone can view published lessons') THEN
    DROP POLICY "Anyone can view published lessons" ON public.systematic_lessons;
    CREATE POLICY "Authenticated users can view published lessons" 
    ON public.systematic_lessons 
    FOR SELECT 
    TO authenticated
    USING (status = 'published');
  END IF;
END $$;

-- 2. Add comprehensive security monitoring functions
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_events integer;
  high_risk_events integer;
  failed_attempts integer;
BEGIN
  -- Get basic security metrics
  SELECT COUNT(*) INTO total_events
  FROM public.security_audit_logs
  WHERE created_at >= NOW() - INTERVAL '24 hours';
  
  SELECT COUNT(*) INTO high_risk_events
  FROM public.security_audit_logs
  WHERE created_at >= NOW() - INTERVAL '24 hours'
    AND action IN ('DELETE', 'high_risk_activity_detected');
    
  SELECT COUNT(*) INTO failed_attempts
  FROM public.security_audit_logs
  WHERE created_at >= NOW() - INTERVAL '1 hour'
    AND metadata->>'error' IS NOT NULL;
  
  result := jsonb_build_object(
    'total_events_24h', total_events,
    'high_risk_events_24h', high_risk_events,
    'failed_attempts_1h', failed_attempts,
    'security_score', CASE 
      WHEN high_risk_events > 10 THEN 'CRITICAL'
      WHEN high_risk_events > 5 THEN 'HIGH'
      WHEN high_risk_events > 2 THEN 'MEDIUM'
      ELSE 'LOW'
    END,
    'last_updated', NOW()
  );
  
  RETURN result;
END;
$$;

-- 3. Create function to validate secure configurations
CREATE OR REPLACE FUNCTION public.validate_security_config()
RETURNS TABLE (
  check_name text,
  status text,
  details text,
  risk_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check RLS coverage
  RETURN QUERY
  SELECT 
    'RLS Coverage' as check_name,
    CASE 
      WHEN rls_tables.secured_count::float / rls_tables.total_count > 0.9 THEN 'PASS'
      ELSE 'FAIL'
    END as status,
    'Tables with RLS: ' || rls_tables.secured_count || '/' || rls_tables.total_count as details,
    CASE 
      WHEN rls_tables.secured_count::float / rls_tables.total_count < 0.7 THEN 'HIGH'
      WHEN rls_tables.secured_count::float / rls_tables.total_count < 0.9 THEN 'MEDIUM'
      ELSE 'LOW'
    END as risk_level
  FROM (
    SELECT 
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE c.relrowsecurity = true) as secured_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  ) rls_tables;
  
  -- Check for anonymous access policies
  RETURN QUERY
  SELECT 
    'Anonymous Access Policies' as check_name,
    CASE 
      WHEN anon_policies.count > 20 THEN 'FAIL'
      WHEN anon_policies.count > 10 THEN 'WARN'
      ELSE 'PASS'
    END as status,
    'Anonymous policies found: ' || anon_policies.count as details,
    CASE 
      WHEN anon_policies.count > 20 THEN 'HIGH'
      WHEN anon_policies.count > 10 THEN 'MEDIUM'
      ELSE 'LOW'
    END as risk_level
  FROM (
    SELECT COUNT(*) as count
    FROM pg_policies 
    WHERE roles && ARRAY['anon']
  ) anon_policies;
  
  -- Check function security
  RETURN QUERY
  SELECT 
    'Function Security' as check_name,
    CASE 
      WHEN insecure_funcs.count = 0 THEN 'PASS'
      ELSE 'WARN'
    END as status,
    'Functions without search_path: ' || insecure_funcs.count as details,
    CASE 
      WHEN insecure_funcs.count > 5 THEN 'HIGH'
      WHEN insecure_funcs.count > 0 THEN 'MEDIUM'
      ELSE 'LOW'
    END as risk_level
  FROM (
    SELECT COUNT(*) as count
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' 
      AND p.prosecdef = true
      AND NOT EXISTS (
        SELECT 1 FROM pg_proc_config(p.oid) 
        WHERE configuration[1] = 'search_path'
      )
  ) insecure_funcs;
END;
$$;

-- 4. Create security event classification function
CREATE OR REPLACE FUNCTION public.classify_security_event(
  event_action text,
  event_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  classification text := 'LOW';
BEGIN
  -- Classify based on action type
  IF event_action IN ('DELETE', 'DROP', 'TRUNCATE') THEN
    classification := 'HIGH';
  ELSIF event_action IN ('UPDATE', 'ALTER') THEN
    classification := 'MEDIUM';
  ELSIF event_action LIKE '%_failure' OR event_action LIKE '%_denied' THEN
    classification := 'MEDIUM';
  ELSIF event_action = 'high_risk_activity_detected' THEN
    classification := 'CRITICAL';
  END IF;
  
  -- Escalate based on metadata
  IF event_metadata->>'error' IS NOT NULL THEN
    classification := CASE 
      WHEN classification = 'LOW' THEN 'MEDIUM'
      WHEN classification = 'MEDIUM' THEN 'HIGH'
      ELSE classification
    END;
  END IF;
  
  RETURN classification;
END;
$$;

-- 5. Update existing security monitoring to use classification
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text, 
  p_resource_type text, 
  p_resource_id text DEFAULT NULL, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_classification text;
BEGIN
  -- Classify the event
  event_classification := public.classify_security_event(p_action, p_metadata);
  
  -- Insert with classification
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    inet_client_addr(),
    p_metadata || jsonb_build_object('classification', event_classification)
  );
  
  -- Alert on critical events
  IF event_classification = 'CRITICAL' THEN
    -- Log additional alert
    INSERT INTO public.security_audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      auth.uid(),
      'critical_security_alert',
      'security_monitoring',
      p_resource_id,
      jsonb_build_object(
        'original_action', p_action,
        'alert_level', 'CRITICAL',
        'timestamp', NOW()
      )
    );
  END IF;
END;
$$;