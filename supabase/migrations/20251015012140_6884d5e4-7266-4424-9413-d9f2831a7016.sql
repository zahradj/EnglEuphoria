-- Create lesson reminders tracking table
CREATE TABLE public.lesson_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('student', 'teacher', 'parent')),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h_before', '1h_before', '15min_before')),
  sent_at TIMESTAMPTZ,
  email_status TEXT DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL CHECK (template_type IN ('email', 'sms')),
  subject TEXT,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_reminders
CREATE POLICY "Users can view their own reminders"
  ON public.lesson_reminders FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can manage all reminders"
  ON public.lesson_reminders FOR ALL
  USING (is_user_admin());

CREATE POLICY "System can manage reminders"
  ON public.lesson_reminders FOR ALL
  USING (true);

-- RLS Policies for notification_templates
CREATE POLICY "Admins can manage notification templates"
  ON public.notification_templates FOR ALL
  USING (is_user_admin());

CREATE POLICY "Everyone can view active templates"
  ON public.notification_templates FOR SELECT
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_lesson_reminders_lesson ON public.lesson_reminders(lesson_id);
CREATE INDEX idx_lesson_reminders_recipient ON public.lesson_reminders(recipient_id);
CREATE INDEX idx_lesson_reminders_status ON public.lesson_reminders(email_status);
CREATE INDEX idx_lesson_reminders_sent ON public.lesson_reminders(sent_at);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Function to schedule lesson reminders
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
  FOR parent_record IN 
    SELECT parent_id 
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

-- Function to get pending reminders that need to be sent
CREATE OR REPLACE FUNCTION public.get_pending_reminders()
RETURNS TABLE (
  reminder_id UUID,
  lesson_id UUID,
  recipient_email TEXT,
  recipient_name TEXT,
  recipient_type TEXT,
  reminder_type TEXT,
  lesson_title TEXT,
  lesson_date TIMESTAMPTZ,
  teacher_name TEXT,
  student_name TEXT,
  room_link TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id as reminder_id,
    l.id as lesson_id,
    u.email as recipient_email,
    u.full_name as recipient_name,
    lr.recipient_type,
    lr.reminder_type,
    l.title as lesson_title,
    l.scheduled_at as lesson_date,
    t.full_name as teacher_name,
    s.full_name as student_name,
    l.room_link
  FROM public.lesson_reminders lr
  JOIN public.lessons l ON lr.lesson_id = l.id
  JOIN public.users u ON lr.recipient_id = u.id
  JOIN public.users t ON l.teacher_id = t.id
  JOIN public.users s ON l.student_id = s.id
  WHERE lr.email_status = 'pending'
    AND lr.sent_at IS NULL
    AND l.status IN ('scheduled', 'confirmed')
    AND (
      (lr.reminder_type = '24h_before' AND l.scheduled_at <= NOW() + INTERVAL '24 hours' AND l.scheduled_at > NOW() + INTERVAL '23 hours')
      OR
      (lr.reminder_type = '1h_before' AND l.scheduled_at <= NOW() + INTERVAL '1 hour' AND l.scheduled_at > NOW() + INTERVAL '50 minutes')
      OR
      (lr.reminder_type = '15min_before' AND l.scheduled_at <= NOW() + INTERVAL '15 minutes' AND l.scheduled_at > NOW() + INTERVAL '10 minutes')
    );
END;
$$;

-- Trigger to automatically schedule reminders when lesson is created
CREATE OR REPLACE FUNCTION public.auto_schedule_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only schedule if lesson is in the future
  IF NEW.scheduled_at > NOW() AND NEW.status IN ('scheduled', 'confirmed') THEN
    PERFORM public.schedule_lesson_reminders(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_schedule_reminders
  AFTER INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_schedule_reminders();

-- Insert default email templates
INSERT INTO public.notification_templates (template_name, template_type, subject, body_html, body_text, variables) VALUES
(
  'lesson_reminder_24h',
  'email',
  'Reminder: Your English lesson is tomorrow',
  '<html><body><h2>Hello {{recipient_name}}!</h2><p>This is a friendly reminder that you have an English lesson scheduled for <strong>tomorrow</strong>.</p><h3>Lesson Details:</h3><ul><li><strong>Title:</strong> {{lesson_title}}</li><li><strong>Date & Time:</strong> {{lesson_date}}</li><li><strong>Teacher:</strong> {{teacher_name}}</li><li><strong>Student:</strong> {{student_name}}</li></ul><p><a href="{{room_link}}" style="background-color:#6366f1;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">Join Lesson</a></p><p>See you tomorrow!</p><p>Best regards,<br>EnglEuphoria Team</p></body></html>',
  'Hello {{recipient_name}}! This is a reminder that you have an English lesson scheduled for tomorrow. Lesson: {{lesson_title}}, Date: {{lesson_date}}, Teacher: {{teacher_name}}. Join here: {{room_link}}',
  '["recipient_name", "lesson_title", "lesson_date", "teacher_name", "student_name", "room_link"]'::jsonb
),
(
  'lesson_reminder_1h',
  'email',
  'Reminder: Your English lesson starts in 1 hour',
  '<html><body><h2>Hello {{recipient_name}}!</h2><p>Your English lesson starts in <strong>1 hour</strong>!</p><h3>Lesson Details:</h3><ul><li><strong>Title:</strong> {{lesson_title}}</li><li><strong>Date & Time:</strong> {{lesson_date}}</li><li><strong>Teacher:</strong> {{teacher_name}}</li><li><strong>Student:</strong> {{student_name}}</li></ul><p><a href="{{room_link}}" style="background-color:#6366f1;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">Join Lesson Now</a></p><p>Make sure you have a stable internet connection and your camera/microphone ready.</p><p>Best regards,<br>EnglEuphoria Team</p></body></html>',
  'Hello {{recipient_name}}! Your English lesson starts in 1 hour. Lesson: {{lesson_title}}, Date: {{lesson_date}}, Teacher: {{teacher_name}}. Join here: {{room_link}}',
  '["recipient_name", "lesson_title", "lesson_date", "teacher_name", "student_name", "room_link"]'::jsonb
);