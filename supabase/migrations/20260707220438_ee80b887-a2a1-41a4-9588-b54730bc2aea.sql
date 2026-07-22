
-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any prior schedule so this migration is idempotent
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-playground-videos-weekly') THEN
    PERFORM cron.unschedule('cleanup-playground-videos-weekly');
  END IF;
END $$;

-- Weekly: Sundays at 03:00 UTC
SELECT cron.schedule(
  'cleanup-playground-videos-weekly',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/cleanup-playground-videos',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
