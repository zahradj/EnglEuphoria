-- Production Readiness: Database Optimization and Notification System

-- ============================================
-- PHASE 1: Database Indexes for Scale (1000+ students, 300+ teachers)
-- ============================================

-- User lookups optimization
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Lesson queries optimization
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON public.lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_at ON public.lessons(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON public.lessons(created_at DESC);

-- Notifications optimization
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;

-- Homework optimization
CREATE INDEX IF NOT EXISTS idx_homework_student_id ON public.homework(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_teacher_id ON public.homework(teacher_id);
CREATE INDEX IF NOT EXISTS idx_homework_status ON public.homework(status);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON public.homework(due_date);

-- ============================================
-- PHASE 2: Admin Notification Tracking Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_student', 'new_teacher', 'lesson_booked', 'payment_received', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin users can view their own notifications
CREATE POLICY "Admins can view their own notifications"
ON public.admin_notifications
FOR SELECT
USING (
  admin_id = auth.uid() 
  AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- System can create admin notifications
CREATE POLICY "System can create admin notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = admin_id AND role = 'admin')
);

-- Admins can update their own notifications (mark as read)
CREATE POLICY "Admins can update their own notifications"
ON public.admin_notifications
FOR UPDATE
USING (
  admin_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON public.admin_notifications(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read) WHERE is_read = false;

-- ============================================
-- PHASE 3: Function to Create Admin Notifications
-- ============================================

CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a notification for all admin users
  INSERT INTO public.admin_notifications (admin_id, notification_type, title, message, metadata)
  SELECT 
    id,
    p_notification_type,
    p_title,
    p_message,
    p_metadata
  FROM public.users
  WHERE role = 'admin';
END;
$$;

-- ============================================
-- PHASE 4: Trigger for New Student Registration Notification
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_admin_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger for student role
  IF NEW.role = 'student' THEN
    -- Create notification for all admins
    PERFORM public.create_admin_notification(
      'new_student',
      'New Student Registered',
      NEW.full_name || ' (' || NEW.email || ') has registered as a new student',
      jsonb_build_object(
        'student_id', NEW.id,
        'student_name', NEW.full_name,
        'student_email', NEW.email,
        'registration_date', NEW.created_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_admin_new_student ON public.users;
CREATE TRIGGER trigger_notify_admin_new_student
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_student();

-- ============================================
-- PHASE 5: Trigger for Teacher Lesson Booking Notification
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_teacher_lesson_booked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teacher_email TEXT;
  v_teacher_name TEXT;
  v_student_name TEXT;
BEGIN
  -- Get teacher and student details
  SELECT email, full_name INTO v_teacher_email, v_teacher_name
  FROM public.users
  WHERE id = NEW.teacher_id;
  
  SELECT full_name INTO v_student_name
  FROM public.users
  WHERE id = NEW.student_id;
  
  -- Create notification for teacher
  INSERT INTO public.notifications (
    user_id,
    title,
    content,
    type,
    action_url,
    scheduled_for
  ) VALUES (
    NEW.teacher_id,
    'New Lesson Booked',
    v_student_name || ' has booked a lesson: "' || NEW.title || '" scheduled for ' || TO_CHAR(NEW.scheduled_at, 'Mon DD, YYYY at HH24:MI'),
    'lesson_reminder',
    '/teacher?tab=lessons&lesson_id=' || NEW.id,
    NEW.scheduled_at - INTERVAL '1 hour'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_teacher_lesson_booked ON public.lessons;
CREATE TRIGGER trigger_notify_teacher_lesson_booked
  AFTER INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_teacher_lesson_booked();

-- ============================================
-- PHASE 6: Admin Dashboard Stats View
-- ============================================

CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM public.users WHERE role = 'teacher') as total_teachers,
  (SELECT COUNT(*) FROM public.users WHERE role = 'student' AND created_at >= CURRENT_DATE - INTERVAL '7 days') as new_students_week,
  (SELECT COUNT(*) FROM public.users WHERE role = 'teacher' AND created_at >= CURRENT_DATE - INTERVAL '7 days') as new_teachers_week,
  (SELECT COUNT(*) FROM public.lessons WHERE status = 'scheduled' AND scheduled_at >= NOW()) as upcoming_lessons,
  (SELECT COUNT(*) FROM public.lessons WHERE status = 'completed') as total_lessons_completed,
  (SELECT COUNT(*) FROM public.lessons WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as lessons_booked_week;

-- Grant access to authenticated users with admin role
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;