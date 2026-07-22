
-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotent: drop existing schedule then recreate
DO $$
BEGIN
  PERFORM cron.unschedule('classroom-verdict-scan-every-minute');
EXCEPTION WHEN OTHERS THEN
  -- nothing to unschedule
  NULL;
END $$;

SELECT cron.schedule(
  'classroom-verdict-scan-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/classroom-telemetry-verdict',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s"}'::jsonb,
    body := jsonb_build_object('trigger', 'cron', 'at', now())
  ) AS request_id;
  $$
);
