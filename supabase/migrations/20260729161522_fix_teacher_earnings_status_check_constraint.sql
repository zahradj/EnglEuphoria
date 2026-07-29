-- teacher_earnings_status_check only allowed ('pending','approved','paid','disputed'),
-- but both end_lesson() and the trg_accrue_teacher_earnings trigger write
-- status='pending_clearance' (later promoted to 'payable' by the hourly
-- clear_pending_earnings() cron). Verified live: every insert of a
-- 'pending_clearance' row currently throws a check-constraint violation,
-- meaning end_lesson has been failing (caught client-side, but the booking
-- never actually completes) for every lesson since that status rename.
-- teacher_earnings is empty in production right now, confirming this has
-- never once succeeded.
ALTER TABLE public.teacher_earnings DROP CONSTRAINT teacher_earnings_status_check;
ALTER TABLE public.teacher_earnings ADD CONSTRAINT teacher_earnings_status_check
  CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text, 'disputed'::text, 'pending_clearance'::text, 'payable'::text]));
