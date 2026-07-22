
-- Marketing AI Agent tables

CREATE TABLE public.marketing_agent_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_agent_threads TO authenticated;
GRANT ALL ON public.marketing_agent_threads TO service_role;
ALTER TABLE public.marketing_agent_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own threads select" ON public.marketing_agent_threads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own threads insert" ON public.marketing_agent_threads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "own threads update" ON public.marketing_agent_threads FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own threads delete" ON public.marketing_agent_threads FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.marketing_agent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.marketing_agent_threads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX marketing_agent_messages_thread_idx ON public.marketing_agent_messages(thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_agent_messages TO authenticated;
GRANT ALL ON public.marketing_agent_messages TO service_role;
ALTER TABLE public.marketing_agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msgs by owner" ON public.marketing_agent_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.marketing_agent_threads t
    WHERE t.id = thread_id AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.marketing_agent_threads t
    WHERE t.id = thread_id AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE TABLE public.marketing_agent_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  automation_type text NOT NULL,
  cron_expression text NOT NULL DEFAULT '0 9 * * 1',
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_run_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_agent_automations TO authenticated;
GRANT ALL ON public.marketing_agent_automations TO service_role;
ALTER TABLE public.marketing_agent_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own automations" ON public.marketing_agent_automations FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.marketing_agent_automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES public.marketing_agent_automations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'running',
  input jsonb,
  output jsonb,
  error text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
CREATE INDEX mkt_auto_runs_auto_idx ON public.marketing_agent_automation_runs(automation_id, started_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_agent_automation_runs TO authenticated;
GRANT ALL ON public.marketing_agent_automation_runs TO service_role;
ALTER TABLE public.marketing_agent_automation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runs by owner" ON public.marketing_agent_automation_runs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.marketing_agent_automations a
    WHERE a.id = automation_id AND (a.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "runs insert service" ON public.marketing_agent_automation_runs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.marketing_agent_automations a
    WHERE a.id = automation_id AND (a.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE OR REPLACE FUNCTION public.marketing_agent_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_mkt_threads_touch BEFORE UPDATE ON public.marketing_agent_threads
  FOR EACH ROW EXECUTE FUNCTION public.marketing_agent_touch_updated_at();
CREATE TRIGGER trg_mkt_auto_touch BEFORE UPDATE ON public.marketing_agent_automations
  FOR EACH ROW EXECUTE FUNCTION public.marketing_agent_touch_updated_at();
