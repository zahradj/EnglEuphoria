
-- Create post_class_feedback table
CREATE TABLE public.post_class_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) NOT NULL,
  teacher_id UUID REFERENCES public.users(id) NOT NULL,
  lesson_id TEXT,
  teacher_energy_rating INTEGER NOT NULL CHECK (teacher_energy_rating BETWEEN 1 AND 5),
  material_relevance_rating INTEGER NOT NULL CHECK (material_relevance_rating BETWEEN 1 AND 5),
  feels_more_confident BOOLEAN,
  improvement_suggestion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_class_feedback ENABLE ROW LEVEL SECURITY;

-- Students can insert their own feedback
CREATE POLICY "Students can insert own feedback"
ON public.post_class_feedback FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Students can read their own feedback
CREATE POLICY "Students can read own feedback"
ON public.post_class_feedback FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback"
ON public.post_class_feedback FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function for low rating admin alerts
CREATE OR REPLACE FUNCTION public.notify_admin_low_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_user RECORD;
  teacher_name TEXT;
  student_name TEXT;
BEGIN
  IF NEW.teacher_energy_rating <= 2 OR NEW.material_relevance_rating <= 2 THEN
    SELECT full_name INTO teacher_name FROM users WHERE id = NEW.teacher_id;
    SELECT full_name INTO student_name FROM users WHERE id = NEW.student_id;

    FOR admin_user IN
      SELECT ur.user_id FROM user_roles ur WHERE ur.role = 'admin'
    LOOP
      INSERT INTO admin_notifications (
        admin_id, notification_type, title, message, metadata, is_read
      ) VALUES (
        admin_user.user_id,
        'low_rating_alert',
        'Low Session Rating Alert',
        format('%s gave a low rating after a session with %s', COALESCE(student_name, 'A student'), COALESCE(teacher_name, 'a teacher')),
        jsonb_build_object(
          'student_id', NEW.student_id,
          'teacher_id', NEW.teacher_id,
          'student_name', student_name,
          'teacher_name', teacher_name,
          'teacher_energy_rating', NEW.teacher_energy_rating,
          'material_relevance_rating', NEW.material_relevance_rating,
          'lesson_id', NEW.lesson_id
        ),
        false
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_admin_low_rating
AFTER INSERT ON public.post_class_feedback
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_low_rating();
