
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en';

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_preferred_language_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_preferred_language_check
  CHECK (preferred_language IN ('en','es','ar','fr','tr','it'));
