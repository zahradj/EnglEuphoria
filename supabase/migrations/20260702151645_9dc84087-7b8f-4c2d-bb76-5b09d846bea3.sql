-- Enable required extensions (idempotent)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Unschedule any prior version so this is idempotent
do $$
begin
  if exists (select 1 from cron.job where jobname = 'analytics-rollup-nightly') then
    perform cron.unschedule('analytics-rollup-nightly');
  end if;
end $$;

-- Nightly at 03:15 UTC → invoke analytics-rollup edge function
select cron.schedule(
  'analytics-rollup-nightly',
  '15 3 * * *',
  $$
  select net.http_post(
    url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/analytics-rollup',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s"}'::jsonb,
    body := jsonb_build_object('scheduled_at', now())
  );
  $$
);