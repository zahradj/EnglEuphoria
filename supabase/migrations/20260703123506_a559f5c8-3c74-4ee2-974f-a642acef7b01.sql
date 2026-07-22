
select cron.schedule(
  'send-teacher-kpi-digest-weekly',
  '0 9 * * 1',
  $$
  select net.http_post(
    url:='https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/send-teacher-kpi-digest',
    headers:='{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s"}'::jsonb,
    body:=concat('{"time":"', now(), '"}')::jsonb
  ) as request_id;
  $$
);
