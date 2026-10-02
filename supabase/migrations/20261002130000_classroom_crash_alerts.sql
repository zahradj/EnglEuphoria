-- Automatic alerting for live-classroom crashes.
-- The classroom writes every crash to system_errors; the classroom-crash-alert edge
-- function (run every 10 minutes by pg_cron below) emails the admin when one scene
-- keeps crashing, and records it here so the same scene isn't re-reported for 6 hours.

CREATE TABLE IF NOT EXISTS public.classroom_crash_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_key text NOT NULL,
  crash_count integer NOT NULL,
  alerted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classroom_crash_alerts_recent
  ON public.classroom_crash_alerts (alerted_at DESC, scene_key);

-- Service role only (the edge function). No policies = no access for anon/authenticated.
ALTER TABLE public.classroom_crash_alerts ENABLE ROW LEVEL SECURITY;

-- Speeds up the function's "last hour of classroom crashes" scan.
CREATE INDEX IF NOT EXISTS idx_system_errors_component_created
  ON public.system_errors (created_at DESC)
  WHERE component_name LIKE 'ClassroomScenePlayer >%';

DO $$ BEGIN PERFORM cron.unschedule('classroom-crash-alert'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'classroom-crash-alert',
  '*/10 * * * *',
  $cron$
    SELECT net.http_post(
      url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/classroom-crash-alert',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $cron$
);
