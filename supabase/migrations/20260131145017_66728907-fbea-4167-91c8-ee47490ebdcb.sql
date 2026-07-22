-- ============================================
-- Admin Notification System for User Registration
-- ============================================

-- Create function to notify admins when a new user registers
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
  user_role TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Get the user's role from the new record
  user_role := COALESCE(NEW.role, 'student');
  
  -- Set notification content based on role
  IF user_role = 'teacher' THEN
    notification_type := 'new_teacher';
    notification_title := 'New Teacher Registration';
    notification_message := format('Teacher %s (%s) has registered and is awaiting profile completion.', 
                                   COALESCE(NEW.full_name, 'Unknown'), NEW.email);
  ELSE
    notification_type := 'new_student';
    notification_title := 'New Student Registration';
    notification_message := format('Student %s (%s) has joined the platform.', 
                                   COALESCE(NEW.full_name, 'Unknown'), NEW.email);
  END IF;
  
  -- Create notification for all admins
  FOR admin_user IN 
    SELECT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role = 'admin'
  LOOP
    INSERT INTO admin_notifications (
      admin_id,
      notification_type,
      title,
      message,
      metadata,
      is_read
    ) VALUES (
      admin_user.user_id,
      notification_type,
      notification_title,
      notification_message,
      jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'full_name', NEW.full_name,
        'role', user_role,
        'registered_at', NEW.created_at
      ),
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_new_user_notify_admin ON users;
CREATE TRIGGER on_new_user_notify_admin
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_user();

-- ============================================
-- Notify Admin when Teacher Completes Profile
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_admin_teacher_ready_for_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
  teacher_name TEXT;
  teacher_email TEXT;
BEGIN
  -- Only trigger when profile_complete changes from false to true
  IF NEW.profile_complete = true AND (OLD.profile_complete IS NULL OR OLD.profile_complete = false) THEN
    -- Get teacher details
    SELECT full_name, email INTO teacher_name, teacher_email
    FROM users
    WHERE id = NEW.user_id;
    
    -- Create notification for all admins
    FOR admin_user IN 
      SELECT ur.user_id 
      FROM user_roles ur 
      WHERE ur.role = 'admin'
    LOOP
      INSERT INTO admin_notifications (
        admin_id,
        notification_type,
        title,
        message,
        metadata,
        is_read
      ) VALUES (
        admin_user.user_id,
        'teacher_pending_approval',
        'Teacher Ready for Review',
        format('Teacher %s (%s) has completed their profile and is awaiting approval.', 
               COALESCE(teacher_name, 'Unknown'), COALESCE(teacher_email, 'N/A')),
        jsonb_build_object(
          'teacher_profile_id', NEW.id,
          'user_id', NEW.user_id,
          'teacher_name', teacher_name,
          'teacher_email', teacher_email,
          'completed_at', now()
        ),
        false
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_teacher_profile_complete ON teacher_profiles;
CREATE TRIGGER on_teacher_profile_complete
  AFTER UPDATE ON teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_teacher_ready_for_review();

-- ============================================
-- Update handle_new_user to properly set roles
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract role from metadata, default to 'student'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  
  -- Insert into users table
  INSERT INTO users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role);
  
  -- Insert into user_roles table for secure role storage
  -- Only insert valid roles (student, teacher, admin, moderator, user)
  IF user_role IN ('student', 'teacher', 'admin', 'moderator', 'user') THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, user_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default to student if invalid role
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'student'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- If teacher, create empty teacher_profiles record for onboarding
  IF user_role = 'teacher' THEN
    INSERT INTO teacher_profiles (user_id, profile_complete, can_teach, profile_approved_by_admin)
    VALUES (NEW.id, false, false, false)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;