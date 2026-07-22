-- Allow teachers to access their classrooms at any time (remove time restrictions)
-- Students still have the 10-minute window restriction for security
CREATE OR REPLACE FUNCTION public.can_access_lesson(room_uuid text, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lesson_record RECORD;
  current_time TIMESTAMPTZ := NOW();
  user_role TEXT;
BEGIN
  -- Find the lesson by room_id
  SELECT * INTO lesson_record
  FROM public.lessons
  WHERE room_id = room_uuid;
  
  -- Return false if lesson doesn't exist
  IF lesson_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.users WHERE id = user_uuid;
  
  -- Check if user is the teacher for this lesson
  IF lesson_record.teacher_id = user_uuid AND user_role = 'teacher' THEN
    -- Teachers can access their classrooms at any time
    RETURN TRUE;
  END IF;
  
  -- Check if user is the student for this lesson
  IF lesson_record.student_id = user_uuid THEN
    -- Students can only access 10 minutes before scheduled time and up to 2 hours after
    IF current_time >= (lesson_record.scheduled_at - INTERVAL '10 minutes') 
       AND current_time <= (lesson_record.scheduled_at + INTERVAL '2 hours') THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$function$;