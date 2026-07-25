-- Lets teachers attach a connection-diagnostics snapshot to a technical
-- support ticket, and lets admins leave a reply the teacher sees in their
-- own ticket history (no new table/RLS needed — admins already have
-- UPDATE on support_tickets).

ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS diagnostics text;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS admin_response text;
