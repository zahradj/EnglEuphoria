-- The cron-triggered edge functions (auto-complete-lessons, send-lesson-reminders,
-- send-interview-reminders, process-email-queue) now require the shared
-- x-internal-secret header (see supabase/functions/_shared/internalAuth.ts) instead
-- of relying on verify_jwt=false + the public anon key, which anyone could replay
-- directly against the function URL. Reschedule each job to send the new header.
--
-- IMPORTANT: set the matching secret before this takes effect:
--   supabase secrets set INTERNAL_FUNCTION_SECRET=e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509
-- (rotate this value if it has been shared anywhere outside this migration).

DO $$ BEGIN PERFORM cron.unschedule('auto-complete-lessons'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('send-lesson-reminders-cron'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('send-interview-reminders'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('process-email-queue-v2'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'auto-complete-lessons',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/auto-complete-lessons',
    headers := '{"Content-Type": "application/json", "x-internal-secret": "e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509"}'::jsonb,
    body := '{"automated": true}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-lesson-reminders-cron',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/send-lesson-reminders',
    headers := '{"Content-Type": "application/json", "x-internal-secret": "e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509"}'::jsonb,
    body := concat('{"scheduled_run": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'send-interview-reminders',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/send-interview-reminders',
    headers := '{"Content-Type": "application/json", "x-internal-secret": "e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'process-email-queue-v2',
  '*/1 * * * *',
  $cron$
    SELECT net.http_post(
      url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/process-email-queue',
      headers := '{"Content-Type": "application/json", "x-internal-secret": "e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $cron$
);

-- Note: an older job literally named "process-email-queue" (not "-v2") is owned by
-- supabase_read_only_user per migration 20260530001517 and can't be unscheduled from
-- here. It will now get a 403 from process-email-queue until someone with sufficient
-- privilege drops it via the Supabase dashboard SQL editor — harmless (just log
-- noise), since process-email-queue-v2 above carries the real traffic.
