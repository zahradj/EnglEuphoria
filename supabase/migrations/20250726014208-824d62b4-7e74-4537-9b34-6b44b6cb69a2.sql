-- Create a trigger to automatically update teacher availability when lessons are booked
CREATE OR REPLACE FUNCTION public.handle_lesson_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When a new lesson is created, update any overlapping teacher availability slots
  IF TG_OP = 'INSERT' THEN
    -- Mark overlapping availability slots as booked
    UPDATE public.teacher_availability 
    SET 
      is_booked = true,
      lesson_id = NEW.id,
      updated_at = now()
    WHERE teacher_id = NEW.teacher_id 
      AND is_available = true 
      AND is_booked = false
      AND start_time <= NEW.scheduled_at 
      AND end_time > NEW.scheduled_at;
    
    -- If no availability slot exists, create one to track the booking
    IF NOT EXISTS (
      SELECT 1 FROM public.teacher_availability
      WHERE teacher_id = NEW.teacher_id
        AND start_time <= NEW.scheduled_at 
        AND end_time > NEW.scheduled_at
    ) THEN
      INSERT INTO public.teacher_availability (
        teacher_id,
        start_time,
        end_time,
        duration,
        is_available,
        is_booked,
        lesson_id
      ) VALUES (
        NEW.teacher_id,
        NEW.scheduled_at,
        NEW.scheduled_at + INTERVAL '1 hour' * (NEW.duration / 60.0),
        NEW.duration,
        false,
        true,
        NEW.id
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- When a lesson is cancelled or deleted, free up the availability slot
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.teacher_availability 
    SET 
      is_booked = false,
      lesson_id = NULL,
      updated_at = now()
    WHERE teacher_id = NEW.teacher_id 
      AND lesson_id = NEW.id;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.teacher_availability 
    SET 
      is_booked = false,
      lesson_id = NULL,
      updated_at = now()
    WHERE teacher_id = OLD.teacher_id 
      AND lesson_id = OLD.id;
    
    RETURN OLD;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the trigger on the lessons table
DROP TRIGGER IF EXISTS trigger_handle_lesson_booking ON public.lessons;
CREATE TRIGGER trigger_handle_lesson_booking
  AFTER INSERT OR UPDATE OR DELETE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_lesson_booking();

-- Create a function to automatically send notifications to teachers when lessons are booked
CREATE OR REPLACE FUNCTION public.notify_teacher_new_lesson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When a new lesson is created, we could send a notification to the teacher
  -- For now, this just logs the event (can be extended with email/push notifications)
  
  IF TG_OP = 'INSERT' THEN
    -- Log the lesson booking for analytics
    INSERT INTO public.learning_analytics (
      student_id,
      activity_type,
      skill_area,
      session_duration,
      xp_earned,
      metadata
    ) VALUES (
      NEW.student_id,
      'lesson_booked',
      'speaking',
      NEW.duration * 60, -- Convert minutes to seconds
      10, -- Award 10 XP for booking a lesson
      jsonb_build_object(
        'lesson_id', NEW.id,
        'teacher_id', NEW.teacher_id,
        'scheduled_at', NEW.scheduled_at,
        'lesson_title', NEW.title
      )
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create the notification trigger
DROP TRIGGER IF EXISTS trigger_notify_teacher_new_lesson ON public.lessons;
CREATE TRIGGER trigger_notify_teacher_new_lesson
  AFTER INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_teacher_new_lesson();