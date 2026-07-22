-- Create function to validate minimum weekly slots requirement
CREATE OR REPLACE FUNCTION public.validate_teacher_weekly_slots()
RETURNS TRIGGER AS $$
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
  
  -- Enforce minimum 20 slots per week requirement
  IF weekly_slot_count < 20 THEN
    RAISE EXCEPTION 'Teachers must maintain at least 20 available slots per week. Current count: %', weekly_slot_count;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce weekly slot minimum
CREATE TRIGGER enforce_weekly_slot_minimum
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_teacher_weekly_slots();