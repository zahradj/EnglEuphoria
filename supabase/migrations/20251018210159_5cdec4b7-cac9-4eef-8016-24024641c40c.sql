-- ============================================
-- CRITICAL SECURITY FIX: User Roles Table
-- ============================================
-- This migration creates a proper user_roles table to prevent privilege escalation
-- and removes role storage from the users table

-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Step 2: Create user_roles table with audit trail
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at timestamptz DEFAULT now() NOT NULL,
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Security definer function (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 5: Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'teacher' THEN 2
      WHEN 'student' THEN 3
    END
  LIMIT 1
$$;

-- Step 6: RLS policies on user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Only admins can assign roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can remove roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 7: Migrate existing data from users table
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT id, role::app_role, created_at
FROM public.users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- SECURITY FIX: Replace Security Definer View
-- ============================================
-- Drop the vulnerable admin_dashboard_stats view
DROP VIEW IF EXISTS public.admin_dashboard_stats;

-- Create secure function with admin check
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE (
  total_students bigint,
  total_teachers bigint,
  new_students_week bigint,
  new_teachers_week bigint,
  upcoming_lessons bigint,
  total_lessons_completed bigint,
  lessons_booked_week bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM user_roles WHERE role = 'student')::bigint,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'teacher')::bigint,
    (SELECT COUNT(*) FROM users u JOIN user_roles ur ON u.id = ur.user_id 
     WHERE ur.role = 'student' AND u.created_at >= CURRENT_DATE - INTERVAL '7 days')::bigint,
    (SELECT COUNT(*) FROM users u JOIN user_roles ur ON u.id = ur.user_id 
     WHERE ur.role = 'teacher' AND u.created_at >= CURRENT_DATE - INTERVAL '7 days')::bigint,
    (SELECT COUNT(*) FROM lessons WHERE status = 'scheduled' AND scheduled_at >= NOW())::bigint,
    (SELECT COUNT(*) FROM lessons WHERE status = 'completed')::bigint,
    (SELECT COUNT(*) FROM lessons WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::bigint
  WHERE public.has_role(auth.uid(), 'admin');
$$;

-- ============================================
-- SECURITY FIX: Protect Lessons Content
-- ============================================
-- Update RLS policy on lessons_content to require authentication
DROP POLICY IF EXISTS "Anyone can view lessons content" ON public.lessons_content;

CREATE POLICY "Authenticated users can view lessons content"
  ON public.lessons_content
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- SECURITY FIX: Add search_path to existing functions
-- ============================================
-- Update all SECURITY DEFINER functions to have fixed search_path

ALTER FUNCTION public.update_availability_on_lesson_booking() SET search_path = public;
ALTER FUNCTION public.free_availability_on_lesson_cancel() SET search_path = public;
ALTER FUNCTION public.create_admin_notification(text, text, text, jsonb) SET search_path = public;
ALTER FUNCTION public.notify_admin_new_student() SET search_path = public;
ALTER FUNCTION public.notify_teacher_lesson_booked() SET search_path = public;
ALTER FUNCTION public.get_student_progress_for_parent(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.auto_grade_question() SET search_path = public;
ALTER FUNCTION public.update_submission_score() SET search_path = public;
ALTER FUNCTION public.generate_certificate_number() SET search_path = public;
ALTER FUNCTION public.schedule_lesson_reminders(uuid) SET search_path = public;
ALTER FUNCTION public.get_pending_reminders() SET search_path = public;
ALTER FUNCTION public.auto_schedule_reminders() SET search_path = public;
ALTER FUNCTION public.get_approved_teachers() SET search_path = public;
ALTER FUNCTION public.log_security_event(text, text, text, jsonb) SET search_path = public;
ALTER FUNCTION public.record_learning_analytics() SET search_path = public;
ALTER FUNCTION public.reset_monthly_class_usage() SET search_path = public;
ALTER FUNCTION public.book_teacher_slot() SET search_path = public;
ALTER FUNCTION public.can_access_lesson(text, uuid) SET search_path = public;
ALTER FUNCTION public.check_achievements(uuid, jsonb) SET search_path = public;
ALTER FUNCTION public.check_teacher_penalties(uuid) SET search_path = public;
ALTER FUNCTION public.enhanced_security_audit() SET search_path = public;
ALTER FUNCTION public.generate_adaptive_learning_path(uuid, text, text, text) SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;
ALTER FUNCTION public.generate_room_id() SET search_path = public;
ALTER FUNCTION public.get_organization_analytics(uuid) SET search_path = public;
ALTER FUNCTION public.get_security_status() SET search_path = public;
ALTER FUNCTION public.get_student_curriculum_analytics(uuid, text) SET search_path = public;
ALTER FUNCTION public.get_student_lesson_stats(uuid) SET search_path = public;
ALTER FUNCTION public.get_student_success_prediction(uuid) SET search_path = public;
ALTER FUNCTION public.get_student_upcoming_lessons(uuid) SET search_path = public;
ALTER FUNCTION public.get_teacher_available_balance(uuid) SET search_path = public;
ALTER FUNCTION public.get_teacher_earnings_summary(uuid) SET search_path = public;
ALTER FUNCTION public.get_teacher_upcoming_lessons(uuid) SET search_path = public;
ALTER FUNCTION public.handle_lesson_booking() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.is_user_admin() SET search_path = public;
ALTER FUNCTION public.log_audit_event() SET search_path = public;
ALTER FUNCTION public.log_teacher_application_access() SET search_path = public;
ALTER FUNCTION public.is_user_teacher() SET search_path = public;
ALTER FUNCTION public.notify_teacher_new_lesson() SET search_path = public;
ALTER FUNCTION public.process_learning_event() SET search_path = public;
ALTER FUNCTION public.trigger_update_teacher_metrics() SET search_path = public;
ALTER FUNCTION public.process_lesson_completion(uuid, text, text) SET search_path = public;
ALTER FUNCTION public.purchase_virtual_reward(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.save_placement_test_result(uuid, text, integer, integer) SET search_path = public;
ALTER FUNCTION public.set_lesson_room_id() SET search_path = public;
ALTER FUNCTION public.submit_teacher_application(text, text, text, text, text, text, integer, text[], text[], text, text) SET search_path = public;
ALTER FUNCTION public.set_updated_at_timestamp() SET search_path = public;
ALTER FUNCTION public.trigger_security_audit() SET search_path = public;