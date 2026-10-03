-- Family accounts, step 3a: the family PIN that guards the way back from a child's learning
-- space to the parent's account.
--
-- RLS is enabled with NO policies on purpose: the hash and attempt counters are only ever read
-- and written by the switch-profile edge function using the service role. Clients (including a
-- child's own session on a shared device) cannot see or touch this table.

CREATE TABLE IF NOT EXISTS public.family_pins (
  parent_id       uuid PRIMARY KEY REFERENCES public.parent_profiles(user_id) ON DELETE CASCADE,
  salt            text NOT NULL,
  pin_hash        text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.family_pins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.family_pins FROM anon, authenticated;
