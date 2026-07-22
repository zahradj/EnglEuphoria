-- Remove the restrictive 20-slot minimum trigger that's causing issues
DROP TRIGGER IF EXISTS validate_teacher_weekly_slots_trigger ON public.teacher_availability;

-- Optionally create a more reasonable validation trigger (5 slots minimum instead of 20)
CREATE OR REPLACE FUNCTION public.validate_teacher_minimum_slots()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  weekly_slot_count INTEGER;
  week_start DATE;
  week_end DATE;
BEGIN
  -- Calculate the start and end of the current week for the slot being inserted/updated
  week_start := date_trunc('week', COALESCE(NEW.start_time, OLD.start_time)::date);
  week_end := week_start + INTERVAL '6 days';
  
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
  
  -- Enforce minimum 5 slots per week requirement (reduced from 20)
  IF weekly_slot_count < 5 THEN
    RAISE EXCEPTION 'Teachers should maintain at least 5 available slots per week. Current count: %', weekly_slot_count;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the new trigger with the reduced requirement
CREATE TRIGGER validate_teacher_minimum_slots_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.teacher_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_teacher_minimum_slots();