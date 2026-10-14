-- "Your lesson is about to start" push notifications for BOTH the student and the teacher (phone and tablet).
--
-- The send-lesson-push-reminders edge function runs every minute. For every booking starting within the next hour it
-- gives each side a push at about 1 hour and again at 15 minutes, once only (this table remembers what was sent, so a
-- missed minute simply sends on the next run). The notification row it creates is turned into the push by the
-- push_on_notification trigger (see 20261011100000_push_notifications.sql).

CREATE TABLE IF NOT EXISTS public.lesson_push_reminders (
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('1h', '15m')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (booking_id, user_id, kind)
);

ALTER TABLE public.lesson_push_reminders ENABLE ROW LEVEL SECURITY; -- service role only: no policies

DO $$ BEGIN PERFORM cron.unschedule('send-lesson-push-reminders'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'send-lesson-push-reminders',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/send-lesson-push-reminders',
    -- Same shared secret as the other cron jobs (see 20260721211711_reschedule_cron_jobs_with_internal_secret.sql).
    headers := '{"Content-Type": "application/json", "x-internal-secret": "e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509"}'::jsonb,
    body := '{"automated": true}'::jsonb
  );
  $$
);
