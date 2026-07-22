CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  user_id UUID NULL
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a contact inquiry
CREATE POLICY "Anyone can submit a contact inquiry"
ON public.contact_inquiries
FOR INSERT
WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view all inquiries"
ON public.contact_inquiries
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update inquiries (status changes)
CREATE POLICY "Admins can update inquiries"
ON public.contact_inquiries
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete inquiries
CREATE POLICY "Admins can delete inquiries"
ON public.contact_inquiries
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_contact_inquiries_updated_at
BEFORE UPDATE ON public.contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster admin sorting
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries (created_at DESC);
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries (status);