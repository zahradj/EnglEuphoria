-- end_lesson() does `INSERT INTO teacher_earnings (...) ... ON CONFLICT (booking_id) DO UPDATE ...`
-- to make ending a lesson idempotent, but teacher_earnings.booking_id has never had a
-- unique constraint — only a plain FK. Verified live: the INSERT throws
-- 42P10 "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- on every call, meaning end_lesson() has never successfully completed a lesson.
-- A plain UNIQUE constraint is safe here: booking_id is nullable (FK is ON DELETE SET NULL)
-- and Postgres treats NULLs as distinct under UNIQUE, so non-booking-linked earnings rows
-- are unaffected — this only enforces "at most one earnings row per booking", which is
-- exactly what end_lesson's own idempotency logic already assumes.
ALTER TABLE public.teacher_earnings
  ADD CONSTRAINT teacher_earnings_booking_id_key UNIQUE (booking_id);
