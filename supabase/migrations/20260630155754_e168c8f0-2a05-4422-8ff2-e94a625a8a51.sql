
-- Schedule nightly TTL sweep for the QA judge cache at 03:17 UTC.
DO $$
DECLARE
  project_url text := current_setting('app.settings.project_url', true);
  service_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Unschedule previous run if it exists (idempotent re-runs).
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'qa-judge-cache-sweep-nightly';
END $$;

SELECT cron.schedule(
  'qa-judge-cache-sweep-nightly',
  '17 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://' || (SELECT split_part(current_setting('app.settings.supabase_url', true), '//', 2)) || '/functions/v1/qa-judge-cache-sweep',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
