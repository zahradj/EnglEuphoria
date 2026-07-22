
-- ============================================================
-- Fix foreign key constraints to allow user deletion
-- CASCADE = delete user-owned data with the user
-- SET NULL = keep the record but clear the user reference
-- ============================================================

-- ======================== CASCADE ========================

-- ai_learning_events.student_id
ALTER TABLE public.ai_learning_events
  DROP CONSTRAINT IF EXISTS ai_learning_events_student_id_fkey,
  ADD CONSTRAINT ai_learning_events_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ai_learning_models.student_id
ALTER TABLE public.ai_learning_models
  DROP CONSTRAINT IF EXISTS ai_learning_models_student_id_fkey,
  ADD CONSTRAINT ai_learning_models_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ai_tutoring_sessions.student_id
ALTER TABLE public.ai_tutoring_sessions
  DROP CONSTRAINT IF EXISTS ai_tutoring_sessions_student_id_fkey,
  ADD CONSTRAINT ai_tutoring_sessions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- speaking_progress.student_id
ALTER TABLE public.speaking_progress
  DROP CONSTRAINT IF EXISTS speaking_progress_student_id_fkey,
  ADD CONSTRAINT speaking_progress_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- speaking_sessions.student_id
ALTER TABLE public.speaking_sessions
  DROP CONSTRAINT IF EXISTS speaking_sessions_student_id_fkey,
  ADD CONSTRAINT speaking_sessions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- speaking_classroom_sessions.student_id
ALTER TABLE public.speaking_classroom_sessions
  DROP CONSTRAINT IF EXISTS speaking_classroom_sessions_student_id_fkey,
  ADD CONSTRAINT speaking_classroom_sessions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- speaking_group_participants.student_id
ALTER TABLE public.speaking_group_participants
  DROP CONSTRAINT IF EXISTS speaking_group_participants_student_id_fkey,
  ADD CONSTRAINT speaking_group_participants_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- student_speaking_profiles.student_id
ALTER TABLE public.student_speaking_profiles
  DROP CONSTRAINT IF EXISTS student_speaking_profiles_student_id_fkey,
  ADD CONSTRAINT student_speaking_profiles_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- student_credits.student_id
ALTER TABLE public.student_credits
  DROP CONSTRAINT IF EXISTS student_credits_student_id_fkey,
  ADD CONSTRAINT student_credits_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- student_curriculum_progress.student_id
ALTER TABLE public.student_curriculum_progress
  DROP CONSTRAINT IF EXISTS student_curriculum_progress_student_id_fkey,
  ADD CONSTRAINT student_curriculum_progress_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- lesson_completions.student_id
ALTER TABLE public.lesson_completions
  DROP CONSTRAINT IF EXISTS lesson_completions_student_id_fkey,
  ADD CONSTRAINT lesson_completions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- weekly_assessments.student_id
ALTER TABLE public.weekly_assessments
  DROP CONSTRAINT IF EXISTS weekly_assessments_student_id_fkey,
  ADD CONSTRAINT weekly_assessments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- early_learners_progress.student_id
ALTER TABLE public.early_learners_progress
  DROP CONSTRAINT IF EXISTS early_learners_progress_student_id_fkey,
  ADD CONSTRAINT early_learners_progress_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- personalized_learning_paths.student_id
ALTER TABLE public.personalized_learning_paths
  DROP CONSTRAINT IF EXISTS personalized_learning_paths_student_id_fkey,
  ADD CONSTRAINT personalized_learning_paths_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ml_predictions.student_id
ALTER TABLE public.ml_predictions
  DROP CONSTRAINT IF EXISTS ml_predictions_student_id_fkey,
  ADD CONSTRAINT ml_predictions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- analytics_events.user_id
ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_user_id_fkey,
  ADD CONSTRAINT analytics_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- credit_purchases.student_id
ALTER TABLE public.credit_purchases
  DROP CONSTRAINT IF EXISTS credit_purchases_student_id_fkey,
  ADD CONSTRAINT credit_purchases_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- support_tickets.user_id
ALTER TABLE public.support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey,
  ADD CONSTRAINT support_tickets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- teacher_applications.user_id
ALTER TABLE public.teacher_applications
  DROP CONSTRAINT IF EXISTS teacher_applications_user_id_fkey,
  ADD CONSTRAINT teacher_applications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- teacher_absences.teacher_id
ALTER TABLE public.teacher_absences
  DROP CONSTRAINT IF EXISTS teacher_absences_teacher_id_fkey,
  ADD CONSTRAINT teacher_absences_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- teacher_earnings.teacher_id
ALTER TABLE public.teacher_earnings
  DROP CONSTRAINT IF EXISTS teacher_earnings_teacher_id_fkey,
  ADD CONSTRAINT teacher_earnings_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- teacher_payouts.teacher_id
ALTER TABLE public.teacher_payouts
  DROP CONSTRAINT IF EXISTS teacher_payouts_teacher_id_fkey,
  ADD CONSTRAINT teacher_payouts_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- teacher_penalties.teacher_id
ALTER TABLE public.teacher_penalties
  DROP CONSTRAINT IF EXISTS teacher_penalties_teacher_id_fkey,
  ADD CONSTRAINT teacher_penalties_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- referrals.referrer_id
ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey,
  ADD CONSTRAINT referrals_referrer_id_fkey
    FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- referrals.friend_id
ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_friend_id_fkey,
  ADD CONSTRAINT referrals_friend_id_fkey
    FOREIGN KEY (friend_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- post_class_feedback.student_id
ALTER TABLE public.post_class_feedback
  DROP CONSTRAINT IF EXISTS post_class_feedback_student_id_fkey,
  ADD CONSTRAINT post_class_feedback_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- post_class_feedback.teacher_id
ALTER TABLE public.post_class_feedback
  DROP CONSTRAINT IF EXISTS post_class_feedback_teacher_id_fkey,
  ADD CONSTRAINT post_class_feedback_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- lesson_payments.student_id
ALTER TABLE public.lesson_payments
  DROP CONSTRAINT IF EXISTS lesson_payments_student_id_fkey,
  ADD CONSTRAINT lesson_payments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- lesson_payments.teacher_id
ALTER TABLE public.lesson_payments
  DROP CONSTRAINT IF EXISTS lesson_payments_teacher_id_fkey,
  ADD CONSTRAINT lesson_payments_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- certificates.teacher_id
ALTER TABLE public.certificates
  DROP CONSTRAINT IF EXISTS certificates_teacher_id_fkey,
  ADD CONSTRAINT certificates_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- certificates.student_id
ALTER TABLE public.certificates
  DROP CONSTRAINT IF EXISTS certificates_student_id_fkey,
  ADD CONSTRAINT certificates_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ======================== SET NULL ========================

-- adaptive_content.created_by
ALTER TABLE public.adaptive_content
  DROP CONSTRAINT IF EXISTS adaptive_content_created_by_fkey,
  ADD CONSTRAINT adaptive_content_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- audit_logs.user_id
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey,
  ADD CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- communities.created_by
ALTER TABLE public.communities
  DROP CONSTRAINT IF EXISTS communities_created_by_fkey,
  ADD CONSTRAINT communities_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- community_challenges.created_by
ALTER TABLE public.community_challenges
  DROP CONSTRAINT IF EXISTS community_challenges_created_by_fkey,
  ADD CONSTRAINT community_challenges_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- community_events.organizer_id
ALTER TABLE public.community_events
  DROP CONSTRAINT IF EXISTS community_events_organizer_id_fkey,
  ADD CONSTRAINT community_events_organizer_id_fkey
    FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- curriculum_exports.admin_id
ALTER TABLE public.curriculum_exports
  DROP CONSTRAINT IF EXISTS curriculum_exports_admin_id_fkey,
  ADD CONSTRAINT curriculum_exports_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- curriculum_materials.uploaded_by
ALTER TABLE public.curriculum_materials
  DROP CONSTRAINT IF EXISTS curriculum_materials_uploaded_by_fkey,
  ADD CONSTRAINT curriculum_materials_uploaded_by_fkey
    FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- curriculum_programs.created_by
ALTER TABLE public.curriculum_programs
  DROP CONSTRAINT IF EXISTS curriculum_programs_created_by_fkey,
  ADD CONSTRAINT curriculum_programs_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- curriculum_units.created_by
ALTER TABLE public.curriculum_units
  DROP CONSTRAINT IF EXISTS curriculum_units_created_by_fkey,
  ADD CONSTRAINT curriculum_units_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- early_learners_lessons.created_by
ALTER TABLE public.early_learners_lessons
  DROP CONSTRAINT IF EXISTS early_learners_lessons_created_by_fkey,
  ADD CONSTRAINT early_learners_lessons_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- eca_assessments.created_by
ALTER TABLE public.eca_assessments
  DROP CONSTRAINT IF EXISTS eca_assessments_created_by_fkey,
  ADD CONSTRAINT eca_assessments_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- eca_templates.created_by
ALTER TABLE public.eca_templates
  DROP CONSTRAINT IF EXISTS eca_templates_created_by_fkey,
  ADD CONSTRAINT eca_templates_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- generated_curriculums.created_by
ALTER TABLE public.generated_curriculums
  DROP CONSTRAINT IF EXISTS generated_curriculums_created_by_fkey,
  ADD CONSTRAINT generated_curriculums_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- interactive_lessons.created_by
ALTER TABLE public.interactive_lessons
  DROP CONSTRAINT IF EXISTS interactive_lessons_created_by_fkey,
  ADD CONSTRAINT interactive_lessons_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- iron_curriculums.created_by
ALTER TABLE public.iron_curriculums
  DROP CONSTRAINT IF EXISTS iron_curriculums_created_by_fkey,
  ADD CONSTRAINT iron_curriculums_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- iron_games.created_by
ALTER TABLE public.iron_games
  DROP CONSTRAINT IF EXISTS iron_games_created_by_fkey,
  ADD CONSTRAINT iron_games_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- learning_missions.created_by
ALTER TABLE public.learning_missions
  DROP CONSTRAINT IF EXISTS learning_missions_created_by_fkey,
  ADD CONSTRAINT learning_missions_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- lessons_content.created_by
ALTER TABLE public.lessons_content
  DROP CONSTRAINT IF EXISTS lessons_content_created_by_fkey,
  ADD CONSTRAINT lessons_content_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- library_assets.created_by
ALTER TABLE public.library_assets
  DROP CONSTRAINT IF EXISTS library_assets_created_by_fkey,
  ADD CONSTRAINT library_assets_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- resource_library.created_by
ALTER TABLE public.resource_library
  DROP CONSTRAINT IF EXISTS resource_library_created_by_fkey,
  ADD CONSTRAINT resource_library_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- security_audit_logs.user_id
ALTER TABLE public.security_audit_logs
  DROP CONSTRAINT IF EXISTS security_audit_logs_user_id_fkey,
  ADD CONSTRAINT security_audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- speaking_groups.created_by
ALTER TABLE public.speaking_groups
  DROP CONSTRAINT IF EXISTS speaking_groups_created_by_fkey,
  ADD CONSTRAINT speaking_groups_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- system_transitions.triggered_by
ALTER TABLE public.system_transitions
  DROP CONSTRAINT IF EXISTS system_transitions_triggered_by_fkey,
  ADD CONSTRAINT system_transitions_triggered_by_fkey
    FOREIGN KEY (triggered_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- teacher_interviews.interviewer_id
ALTER TABLE public.teacher_interviews
  DROP CONSTRAINT IF EXISTS teacher_interviews_interviewer_id_fkey,
  ADD CONSTRAINT teacher_interviews_interviewer_id_fkey
    FOREIGN KEY (interviewer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- organization_members.invited_by
ALTER TABLE public.organization_members
  DROP CONSTRAINT IF EXISTS organization_members_invited_by_fkey,
  ADD CONSTRAINT organization_members_invited_by_fkey
    FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- assessment_answers.graded_by
ALTER TABLE public.assessment_answers
  DROP CONSTRAINT IF EXISTS assessment_answers_graded_by_fkey,
  ADD CONSTRAINT assessment_answers_graded_by_fkey
    FOREIGN KEY (graded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- user_roles.assigned_by
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_assigned_by_fkey,
  ADD CONSTRAINT user_roles_assigned_by_fkey
    FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- users.referred_by
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_referred_by_fkey,
  ADD CONSTRAINT users_referred_by_fkey
    FOREIGN KEY (referred_by) REFERENCES auth.users(id) ON DELETE SET NULL;
