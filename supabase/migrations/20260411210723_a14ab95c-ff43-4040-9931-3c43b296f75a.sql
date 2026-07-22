
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  unit_id UUID,
  recipient_email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  email_sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and admins can view all notification logs"
ON public.notification_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'teacher')
  )
);

CREATE POLICY "Students can view own notification logs"
ON public.notification_logs FOR SELECT TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Authenticated users can insert notification logs"
ON public.notification_logs FOR INSERT TO authenticated
WITH CHECK (true);

CREATE INDEX idx_notification_logs_student_id ON public.notification_logs (student_id);
CREATE INDEX idx_notification_logs_status ON public.notification_logs (status);
CREATE INDEX idx_notification_logs_created_at ON public.notification_logs (created_at DESC);
