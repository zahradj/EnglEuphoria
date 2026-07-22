-- =====================================================================
-- Security Hardening — Phase 2
-- =====================================================================
-- Three approved fixes from the security audit:
--   1. Remove lesson_payments from realtime publication (financial privacy)
--   2. Drop denormalized email columns from parent_teacher_messages
--   3. Revoke direct EXECUTE on trigger-only SECURITY DEFINER functions
--      so they can only run via their owning triggers (never via PostgREST RPC)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. REALTIME PRIVACY: stop broadcasting financial events
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'lesson_payments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.lesson_payments';
  END IF;
END $$;


-- ---------------------------------------------------------------------
-- 2. DATA NORMALIZATION: drop denormalized email columns
--    (app code uses profile joins instead — verified in ParentMessages.tsx)
-- ---------------------------------------------------------------------
ALTER TABLE public.parent_teacher_messages
  DROP COLUMN IF EXISTS parent_email,
  DROP COLUMN IF EXISTS teacher_email;


-- ---------------------------------------------------------------------
-- 3. FUNCTION HARDENING: revoke EXECUTE on trigger-only SECURITY DEFINER funcs
--    Triggers fire as table owner regardless of EXECUTE grants, so revoking
--    public/anon/authenticated EXECUTE prevents misuse via PostgREST RPC
--    while keeping all trigger behaviour intact.
-- ---------------------------------------------------------------------

-- New user / role / admin notification triggers
REVOKE EXECUTE ON FUNCTION public.notify_admin_new_user()                       FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admin_new_student()                    FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admin_teacher_ready_for_review()       FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admin_low_rating()                     FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_teacher_lesson_booked()                FROM anon, authenticated, PUBLIC;

-- Assessment & grading triggers
REVOKE EXECUTE ON FUNCTION public.auto_grade_question()                         FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_submission_score()                     FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_certificate_number()                 FROM anon, authenticated, PUBLIC;

-- Reminder scheduling triggers
REVOKE EXECUTE ON FUNCTION public.auto_schedule_reminders()                     FROM anon, authenticated, PUBLIC;

-- Security audit triggers
REVOKE EXECUTE ON FUNCTION public.trigger_security_audit()                      FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enhanced_security_audit()                     FROM anon, authenticated, PUBLIC;

-- Booking / availability triggers
REVOKE EXECUTE ON FUNCTION public.check_future_booking()                        FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_booking_session()                    FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mark_slot_booked_on_appointment()             FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.free_slot_on_appointment_cancel()             FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_availability_on_lesson_booking()       FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.free_availability_on_lesson_cancel()          FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.release_cancelled_lesson_slot()               FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.book_teacher_slot()                           FROM anon, authenticated, PUBLIC;

-- Credits / referrals triggers
REVOKE EXECUTE ON FUNCTION public.add_credits_on_purchase()                     FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_generate_referral_code()                 FROM anon, authenticated, PUBLIC;

-- Analytics & progress triggers
REVOKE EXECUTE ON FUNCTION public.record_learning_analytics()                   FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_phonics_on_lesson_complete()           FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_vocabulary_on_lesson_complete()        FROM anon, authenticated, PUBLIC;

-- Updated_at / housekeeping triggers
REVOKE EXECUTE ON FUNCTION public.set_email_send_state_updated_at()             FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_lesson_progress_updated_at()           FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_lesson_progress_timestamp()            FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_iron_updated_at()                      FROM anon, authenticated, PUBLIC;

-- Admin notification helper (called only from other SECURITY DEFINER funcs / triggers)
REVOKE EXECUTE ON FUNCTION public.create_admin_notification(text, text, text, jsonb) FROM anon, authenticated, PUBLIC;

-- Penalty enforcement (called from triggers / admin context only)
REVOKE EXECUTE ON FUNCTION public.check_teacher_penalties(uuid)                 FROM anon, authenticated, PUBLIC;

-- Reminder scheduler helper (called by auto_schedule_reminders trigger)
REVOKE EXECUTE ON FUNCTION public.schedule_lesson_reminders(uuid)               FROM anon, authenticated, PUBLIC;

-- =====================================================================
-- NOTE: The following functions remain callable via RPC because the
-- application or edge functions invoke them directly:
--   has_role, get_user_role, get_current_user_role,
--   get_admin_dashboard_stats, get_approved_teachers,
--   get_teacher_profile_with_payment, get_teacher_upcoming_lessons,
--   get_student_upcoming_lessons, get_pending_reminders,
--   get_global_skill_averages, get_student_progress_for_parent,
--   get_organization_analytics, consume_credit, refund_credit,
--   complete_referral, ensure_user_role, can_access_lesson,
--   can_access_booking_session, resolve_classroom_id, check_achievements,
--   enqueue_email, read_email_batch, delete_email, move_to_dlq,
--   log_security_event, cleanup_stale_classroom_sessions,
--   reset_monthly_class_usage, generate_adaptive_learning_path,
--   generate_room_id, jsonb_array_append.
-- =====================================================================
