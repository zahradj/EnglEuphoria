-- Step 1: Fix the teacher_performance_metrics table constraint issue
-- Add unique constraint if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'teacher_performance_metrics_teacher_id_key'
  ) THEN
    ALTER TABLE teacher_performance_metrics 
    ADD CONSTRAINT teacher_performance_metrics_teacher_id_key UNIQUE (teacher_id);
  END IF;
END $$;

-- Step 2: Fix the handle_lesson_booking trigger to use duration_minutes and normalize to 25/55
CREATE OR REPLACE FUNCTION public.handle_lesson_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  normalized_duration INTEGER;
BEGIN
  -- Normalize duration to 25 or 55 (based on duration_minutes, fallback to duration)
  normalized_duration := CASE
    WHEN COALESCE(NEW.duration_minutes, NEW.duration) >= 55 THEN 55
    ELSE 25
  END;

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
      AND end_time > NEW.scheduled_at
      AND duration IN (25, 55);
    
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
        NEW.scheduled_at + INTERVAL '1 minute' * normalized_duration,
        normalized_duration,
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
$function$;