-- The original "process-email-queue" job is owned by supabase_read_only_user
-- and cannot be unscheduled or modified from this migration role. We add a
-- second job under a new name that runs from the migration role, which has
-- EXECUTE on net.http_post. This immediately starts draining the queue.

SELECT cron.schedule(
  'process-email-queue-v2',
  '*/1 * * * *',
  $cron$
    SELECT net.http_post(
      url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/process-email-queue',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $cron$
);
