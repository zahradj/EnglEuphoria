-- 1. Add hub_role to teacher_profiles
ALTER TABLE public.teacher_profiles
ADD COLUMN IF NOT EXISTS hub_role text NOT NULL DEFAULT 'academy_success_mentor';

-- Add check constraint
ALTER TABLE public.teacher_profiles
ADD CONSTRAINT teacher_profiles_hub_role_check 
CHECK (hub_role IN ('playground_specialist', 'academy_success_mentor'));

-- 2. Add hub_type and classroom_id to class_bookings
ALTER TABLE public.class_bookings
ADD COLUMN IF NOT EXISTS hub_type text NULL;

ALTER TABLE public.class_bookings
ADD COLUMN IF NOT EXISTS classroom_id uuid NOT NULL DEFAULT gen_random_uuid();

-- Add index on classroom_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_class_bookings_classroom_id ON public.class_bookings (classroom_id);

-- 3. Update the booking session trigger to also set classroom_id
CREATE OR REPLACE FUNCTION public.generate_booking_session()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  -- Generate a 12-char alphanumeric session ID
  NEW.session_id := substring(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  -- Student-facing meeting link using classroom_id
  NEW.meeting_link := '/classroom/' || NEW.classroom_id::text;
  -- Ensure classroom_id is set (should be via default, but just in case)
  IF NEW.classroom_id IS NULL THEN
    NEW.classroom_id := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$function$;