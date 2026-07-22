-- Phase 1: Clean up existing triggers and functions
DROP TRIGGER IF EXISTS validate_teacher_slots_trigger ON public.teacher_availability;
DROP TRIGGER IF EXISTS teacher_availability_validation_trigger ON public.teacher_availability;
DROP FUNCTION IF EXISTS public.validate_teacher_minimum_slots();

-- Phase 2: Create improved function with 20-slot minimum
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
  teacher_total_slots INTEGER;
  required_minimum CONSTANT INTEGER := 20;
BEGIN
  -- Calculate the start and end of the current week for the slot being inserted/updated
  week_start := date_trunc('week', COALESCE(NEW.start_time, OLD.start_time)::date);
  week_end := week_start + INTERVAL '6 days';
  
  -- Check total slots for grace period (allow new teachers to build up their schedule)
  SELECT COUNT(*) INTO teacher_total_slots
  FROM public.teacher_availability
  WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id);
  
  -- Grace period: Allow teachers to create their first 20 slots without validation
  IF teacher_total_slots < required_minimum AND TG_OP = 'INSERT' THEN
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
  
  -- Enforce minimum requirement only after grace period
  IF weekly_slot_count < required_minimum AND teacher_total_slots >= required_minimum THEN
    RAISE EXCEPTION 'Teachers must maintain at least % available slots per week. Current count for week starting %: %. You need % more slots. Use bulk creation to add multiple slots efficiently.', 
      required_minimum, 
      week_start, 
      weekly_slot_count, 
      (required_minimum - weekly_slot_count);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Phase 3: Create single robust trigger
CREATE TRIGGER validate_teacher_minimum_slots_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.teacher_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_teacher_minimum_slots();