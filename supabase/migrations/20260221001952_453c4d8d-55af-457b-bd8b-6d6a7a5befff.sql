
-- 1. Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  user_email TEXT NOT NULL,
  user_name TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('technical', 'billing', 'general')),
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add connection_health column to classroom_sessions
ALTER TABLE public.classroom_sessions 
ADD COLUMN IF NOT EXISTS connection_health TEXT DEFAULT 'connected' 
CHECK (connection_health IN ('connected', 'unstable', 'disconnected'));

-- 3. Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tickets
CREATE POLICY "Users can create their own support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can read their own tickets
CREATE POLICY "Users can view their own support tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can read all tickets
CREATE POLICY "Admins can view all support tickets"
ON public.support_tickets
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update ticket status
CREATE POLICY "Admins can update support tickets"
ON public.support_tickets
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));
