-- Fix ambiguous parent_id column reference in schedule_lesson_reminders function
CREATE OR REPLACE FUNCTION public.schedule_lesson_reminders(p_lesson_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lesson_record RECORD;
  parent_record RECORD;
BEGIN
  -- Get lesson details
  SELECT * INTO lesson_record FROM public.lessons WHERE id = p_lesson_id;
  
  IF lesson_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Schedule student reminder (24h before)
  INSERT INTO public.lesson_reminders (
    lesson_id, recipient_type, recipient_id, reminder_type
  ) VALUES (
    p_lesson_id, 'student', lesson_record.student_id, '24h_before'
  ) ON CONFLICT DO NOTHING;
  
  -- Schedule student reminder (1h before)
  INSERT INTO public.lesson_reminders (
    lesson_id, recipient_type, recipient_id, reminder_type
  ) VALUES (
    p_lesson_id, 'student', lesson_record.student_id, '1h_before'
  ) ON CONFLICT DO NOTHING;
  
  -- Schedule teacher reminder (1h before)
  INSERT INTO public.lesson_reminders (
    lesson_id, recipient_type, recipient_id, reminder_type
  ) VALUES (
    p_lesson_id, 'teacher', lesson_record.teacher_id, '1h_before'
  ) ON CONFLICT DO NOTHING;
  
  -- Schedule parent reminders if parent exists
  -- FIX: Explicitly qualify parent_id with table alias spr
  FOR parent_record IN 
    SELECT spr.parent_id 
    FROM public.student_parent_relationships spr
    JOIN public.parent_notification_preferences pnp ON pnp.parent_id = spr.parent_id
    WHERE spr.student_id = lesson_record.student_id 
      AND pnp.lesson_reminders = true
  LOOP
    -- 24h before for parent
    INSERT INTO public.lesson_reminders (
      lesson_id, recipient_type, recipient_id, reminder_type
    ) VALUES (
      p_lesson_id, 'parent', parent_record.parent_id, '24h_before'
    ) ON CONFLICT DO NOTHING;
    
    -- 1h before for parent
    INSERT INTO public.lesson_reminders (
      lesson_id, recipient_type, recipient_id, reminder_type
    ) VALUES (
      p_lesson_id, 'parent', parent_record.parent_id, '1h_before'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;