-- Security Fixes Phase 2 - Corrected approach with proper table structures

-- 1. Fix critical anonymous access policies with correct column references

-- Virtual rewards - require authentication (check if table exists first)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'virtual_rewards' AND table_schema = 'public') THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'virtual_rewards' AND policyname = 'Anyone can view available rewards') THEN
      DROP POLICY "Anyone can view available rewards" ON public.virtual_rewards;
      CREATE POLICY "Authenticated users can view available rewards" 
      ON public.virtual_rewards 
      FOR SELECT 
      TO authenticated
      USING (is_available = true);
    END IF;
  END IF;
END $$;

-- Achievement tiers - require authentication (no is_active column, so just require auth)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievement_tiers' AND policyname = 'Anyone can view achievement tiers') THEN
    DROP POLICY "Anyone can view achievement tiers" ON public.achievement_tiers;
    CREATE POLICY "Authenticated users can view achievement tiers" 
    ON public.achievement_tiers 
    FOR SELECT 
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Subscription plans - require authentication (check table structure first)
DO $$
DECLARE
    has_is_active boolean;
BEGIN
  -- Check if is_active column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'is_active' 
    AND table_schema = 'public'
  ) INTO has_is_active;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'subscription_plans_public_read') THEN
    DROP POLICY "subscription_plans_public_read" ON public.subscription_plans;
    IF has_is_active THEN
      CREATE POLICY "Authenticated users can view subscription plans" 
      ON public.subscription_plans 
      FOR SELECT 
      TO authenticated
      USING (is_active = true);
    ELSE
      CREATE POLICY "Authenticated users can view subscription plans" 
      ON public.subscription_plans 
      FOR SELECT 
      TO authenticated
      USING (true);
    END IF;
  END IF;
END $$;

-- Systematic lessons - require authentication (check if status column exists)
DO $$
DECLARE
    has_status boolean;
BEGIN
  -- Check if status column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'systematic_lessons' 
    AND column_name = 'status' 
    AND table_schema = 'public'
  ) INTO has_status;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'systematic_lessons' AND policyname = 'Anyone can view published lessons') THEN
    DROP POLICY "Anyone can view published lessons" ON public.systematic_lessons;
    IF has_status THEN
      CREATE POLICY "Authenticated users can view published lessons" 
      ON public.systematic_lessons 
      FOR SELECT 
      TO authenticated
      USING (status = 'published');
    ELSE
      CREATE POLICY "Authenticated users can view published lessons" 
      ON public.systematic_lessons 
      FOR SELECT 
      TO authenticated
      USING (true);
    END IF;
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
      WHEN anon_policies.count > 50 THEN 'FAIL'
      WHEN anon_policies.count > 25 THEN 'WARN'
      ELSE 'PASS'
    END as status,
    'Anonymous policies found: ' || anon_policies.count as details,
    CASE 
      WHEN anon_policies.count > 50 THEN 'HIGH'
      WHEN anon_policies.count > 25 THEN 'MEDIUM'
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

-- 4. Create security dashboard function for admins
CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  metrics jsonb;
  recent_alerts jsonb;
  config_status jsonb;
BEGIN
  -- Only allow admins to access this
  IF NOT is_user_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Get security metrics
  SELECT public.get_security_metrics() INTO metrics;
  
  -- Get recent security alerts
  SELECT jsonb_agg(
    jsonb_build_object(
      'timestamp', created_at,
      'action', action,
      'user_id', user_id,
      'resource_type', resource_type,
      'classification', metadata->>'classification'
    )
  ) INTO recent_alerts
  FROM public.security_audit_logs
  WHERE created_at >= NOW() - INTERVAL '24 hours'
    AND action IN ('high_risk_activity_detected', 'critical_security_alert')
  ORDER BY created_at DESC
  LIMIT 10;
  
  -- Get configuration status
  SELECT jsonb_agg(
    jsonb_build_object(
      'check_name', check_name,
      'status', status,
      'details', details,
      'risk_level', risk_level
    )
  ) INTO config_status
  FROM public.validate_security_config();
  
  result := jsonb_build_object(
    'metrics', metrics,
    'recent_alerts', COALESCE(recent_alerts, '[]'::jsonb),
    'configuration_status', COALESCE(config_status, '[]'::jsonb),
    'generated_at', NOW()
  );
  
  RETURN result;
END;
$$;

-- 5. Create function for security incident response
CREATE OR REPLACE FUNCTION public.handle_security_incident(
  incident_type text,
  severity text DEFAULT 'MEDIUM',
  description text DEFAULT '',
  affected_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  incident_id uuid;
BEGIN
  -- Only allow admins to create incidents
  IF NOT is_user_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Generate incident ID
  incident_id := gen_random_uuid();
  
  -- Log the security incident
  PERFORM public.log_security_event(
    'security_incident_created',
    'security_incidents',
    incident_id::text,
    jsonb_build_object(
      'incident_id', incident_id,
      'incident_type', incident_type,
      'severity', severity,
      'description', description,
      'affected_user_id', affected_user_id,
      'created_by', auth.uid(),
      'status', 'open'
    )
  );
  
  RETURN incident_id;
END;
$$;