-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#8b5cf6',
  branding_config JSONB DEFAULT '{}'::jsonb,
  subscription_tier TEXT DEFAULT 'basic',
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create organization_members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'active',
  UNIQUE(organization_id, user_id)
);

-- Create audit_logs table for comprehensive logging
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create feature_flags table
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  flag_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, flag_name)
);

-- Create analytics_events table for advanced tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES public.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ml_predictions table for predictive analytics
CREATE TABLE public.ml_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id),
  prediction_type TEXT NOT NULL,
  prediction_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  model_version TEXT,
  features_used JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create integration_configs table
CREATE TABLE public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  integration_type TEXT NOT NULL,
  config_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, integration_type)
);

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Organization members can view their organization" 
ON public.organizations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can update organization" 
ON public.organizations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Create RLS policies for organization_members
CREATE POLICY "Members can view organization members" 
ON public.organization_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om2 
    WHERE om2.organization_id = organization_members.organization_id 
    AND om2.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage organization members" 
ON public.organization_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = organization_members.organization_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Create RLS policies for audit_logs
CREATE POLICY "Organization admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = audit_logs.organization_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Create RLS policies for feature_flags
CREATE POLICY "Organization members can view feature flags" 
ON public.feature_flags FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = feature_flags.organization_id 
    AND user_id = auth.uid()
  )
);

-- Create RLS policies for analytics_events
CREATE POLICY "Users can view their own analytics" 
ON public.analytics_events FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert analytics events" 
ON public.analytics_events FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for ml_predictions
CREATE POLICY "Students can view their own predictions" 
ON public.ml_predictions FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "System can insert predictions" 
ON public.ml_predictions FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for integration_configs
CREATE POLICY "Organization admins can manage integrations" 
ON public.integration_configs FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = integration_configs.organization_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Create functions for advanced analytics
CREATE OR REPLACE FUNCTION public.get_student_success_prediction(student_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create function for organization analytics
CREATE OR REPLACE FUNCTION public.get_organization_analytics(org_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Add audit triggers to key tables
CREATE TRIGGER audit_organizations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_organization_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create indexes for performance
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organization_members_org_user ON public.organization_members(organization_id, user_id);
CREATE INDEX idx_audit_logs_org_created ON public.audit_logs(organization_id, created_at);
CREATE INDEX idx_analytics_events_user_created ON public.analytics_events(user_id, created_at);
CREATE INDEX idx_ml_predictions_student_type ON public.ml_predictions(student_id, prediction_type);

-- Update users table to include organization context
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS primary_organization_id UUID REFERENCES public.organizations(id);

-- Create updated timestamp triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();