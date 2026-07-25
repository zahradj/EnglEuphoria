-- CV retention policy for the teacher recruitment pipeline:
--   * Hired teachers: the CV moves onto teacher_profiles (permanent record).
--   * Rejected applicants: the CV is deleted from storage 90 days after the
--     rejection, via the new cleanup-rejected-cvs cron job below.

ALTER TABLE public.teacher_profiles ADD COLUMN IF NOT EXISTS cv_url text;

DO $$ BEGIN PERFORM cron.unschedule('cleanup-rejected-cvs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'cleanup-rejected-cvs',
  '0 4 * * *', -- once a day at 04:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/cleanup-rejected-cvs',
    headers := '{"Content-Type": "application/json", "x-internal-secret": "e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509"}'::jsonb,
    body := '{"automated": true}'::jsonb
  ) AS request_id;
  $$
);
