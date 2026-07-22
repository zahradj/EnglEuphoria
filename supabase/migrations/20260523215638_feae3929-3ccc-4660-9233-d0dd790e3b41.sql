
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS curriculum_framework text,
  ADD COLUMN IF NOT EXISTS learning_mode text,
  ADD COLUMN IF NOT EXISTS local_curriculum_context jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.users
   SET region = COALESCE(region, market_region::text, 'INTL')
 WHERE region IS NULL;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_region_check,
  ADD CONSTRAINT users_region_check
  CHECK (region IS NULL OR region IN ('INTL','DZ','TR','ES','AR','FR'));

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_learning_mode_check,
  ADD CONSTRAINT users_learning_mode_check
  CHECK (learning_mode IS NULL OR learning_mode IN ('international','local'));

CREATE INDEX IF NOT EXISTS users_region_idx ON public.users (region);
