-- First, let's modify the validation function to be more flexible for new teachers
-- and reduce the minimum requirement to 3 slots instead of 5

DROP FUNCTION IF EXISTS public.validate_teacher_minimum_slots() CASCADE;

CREATE OR REPLACE FUNCTION public.validate_teacher_minimum_slots()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  weekly_slot_count INTEGER;
  week_start DATE;
  week_end DATE;
  teacher_total_slots INTEGER;
BEGIN
  -- Calculate the start and end of the current week for the slot being inserted/updated
  week_start := date_trunc('week', COALESCE(NEW.start_time, OLD.start_time)::date);
  week_end := week_start + INTERVAL '6 days';
  
  -- First check if teacher has any slots at all (grace period for new teachers)
  SELECT COUNT(*) INTO teacher_total_slots
  FROM public.teacher_availability
  WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id);
  
  -- If teacher is completely new (has 0 slots), allow them to create their first slots
  IF teacher_total_slots = 0 AND TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Count available slots for this teacher in the same week
  SELECT COUNT(*) INTO weekly_slot_count
  FROM public.teacher_availability
  WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
    AND start_time::date BETWEEN week_start AND week_end
    AND is_available = true
    AND (TG_OP = 'DELETE' OR id != COALESCE(NEW.id, OLD.id)); -- Exclude current record for updates
  
  -- Add 1 if this is an insert or update of an available slot
  IF TG_OP != 'DELETE' AND NEW.is_available = true THEN
    weekly_slot_count := weekly_slot_count + 1;
  END IF;
  
  -- Enforce minimum 3 slots per week requirement (reduced from 5 for easier management)
  -- But only after the teacher has created their initial batch
  IF weekly_slot_count < 3 AND teacher_total_slots >= 3 THEN
    RAISE EXCEPTION 'Teachers should maintain at least 3 available slots per week. Current count: %. You can use bulk actions to create multiple slots quickly.', weekly_slot_count;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate the trigger with the updated function
DROP TRIGGER IF EXISTS validate_teacher_weekly_slots ON public.teacher_availability;
CREATE TRIGGER validate_teacher_weekly_slots
  BEFORE INSERT OR UPDATE OR DELETE ON public.teacher_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_teacher_minimum_slots();