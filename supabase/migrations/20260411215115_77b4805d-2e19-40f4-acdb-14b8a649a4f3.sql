
-- System-wide email logging table
CREATE TABLE public.system_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  resend_count INT NOT NULL DEFAULT 0,
  related_entity_id UUID,
  related_entity_type TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_emails ENABLE ROW LEVEL SECURITY;

-- Admins can see all
CREATE POLICY "Admins can view all system emails"
ON public.system_emails
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Teachers can see emails they're related to or sent by them
CREATE POLICY "Teachers can view related system emails"
ON public.system_emails
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- Index for fast lookups
CREATE INDEX idx_system_emails_type ON public.system_emails(email_type);
CREATE INDEX idx_system_emails_status ON public.system_emails(delivery_status);
CREATE INDEX idx_system_emails_recipient ON public.system_emails(recipient_email);
CREATE INDEX idx_system_emails_entity ON public.system_emails(related_entity_id);

-- Timestamp trigger
CREATE TRIGGER update_system_emails_updated_at
BEFORE UPDATE ON public.system_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
