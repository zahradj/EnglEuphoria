-- Phase 0 of the teacher-monitoring plan: stop the weekly jobs that turn the OLD overall KPI score into consequences.
--
-- Pauses (unschedules) three weekly jobs:
--   teacher-kpi-atrisk-weekly             flags teachers "at risk" from the old composite score
--   send-at-risk-teachers-digest-weekly   emails admins the at-risk list
--   send-teacher-kpi-digest-weekly        emails each teacher their old score and tier
--
-- NOT touched: teacher-kpi-recompute-nightly (it only keeps recording the numbers; nothing is deleted),
-- bonuses already queued, and the payout ledger.
--
-- Safe to run more than once, and safe if pg_cron or a job does not exist.
--
-- To bring a job back, run its original cron.schedule(...) statement again:
--   teacher-kpi-atrisk-weekly            -> 20260708123049_0dea5eb7-2e38-4f3e-b0ef-a4719c41a82e.sql
--   send-at-risk-teachers-digest-weekly  -> 20260703120622_a3f06fce-da9a-43ec-a7c0-30e0222f9739.sql
--   send-teacher-kpi-digest-weekly       -> 20260703123506_a559f5c8-3c74-4ee2-974f-a642acef7b01.sql

DO $$
DECLARE
  j text;
BEGIN
  IF to_regclass('cron.job') IS NULL THEN
    RAISE NOTICE 'pg_cron is not installed here; nothing to pause.';
    RETURN;
  END IF;

  FOREACH j IN ARRAY ARRAY[
    'teacher-kpi-atrisk-weekly',
    'send-at-risk-teachers-digest-weekly',
    'send-teacher-kpi-digest-weekly'
  ] LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = j) THEN
      PERFORM cron.unschedule(j);
      RAISE NOTICE 'paused %', j;
    ELSE
      RAISE NOTICE '% was not scheduled', j;
    END IF;
  END LOOP;
END
$$;
