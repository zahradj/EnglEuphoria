
-- 1. Enum
DO $$ BEGIN
  CREATE TYPE public.market_region AS ENUM ('DZ','INTL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Columns
ALTER TABLE public.users                ADD COLUMN IF NOT EXISTS market_region public.market_region NOT NULL DEFAULT 'INTL';
ALTER TABLE public.teacher_profiles     ADD COLUMN IF NOT EXISTS market_region public.market_region NOT NULL DEFAULT 'INTL';
ALTER TABLE public.class_bookings       ADD COLUMN IF NOT EXISTS market_region public.market_region NOT NULL DEFAULT 'INTL';
ALTER TABLE public.classroom_sessions   ADD COLUMN IF NOT EXISTS market_region public.market_region NOT NULL DEFAULT 'INTL';
ALTER TABLE public.teacher_applications ADD COLUMN IF NOT EXISTS market_region public.market_region NOT NULL DEFAULT 'INTL';

CREATE INDEX IF NOT EXISTS idx_users_market_region            ON public.users(market_region);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_market_region ON public.teacher_profiles(market_region);
CREATE INDEX IF NOT EXISTS idx_class_bookings_market_region   ON public.class_bookings(market_region);

-- 3. Helper
CREATE OR REPLACE FUNCTION public.current_market_region()
RETURNS public.market_region
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT market_region FROM public.users WHERE id = auth.uid()
$$;

-- 4. Restrict teacher discovery to same market (preserve admin access)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='teacher_profiles' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.teacher_profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "teacher_profiles_select_same_market"
ON public.teacher_profiles FOR SELECT
TO authenticated
USING (
  public.is_user_admin()
  OR user_id = auth.uid()
  OR market_region = public.current_market_region()
);

-- 5. Booking market enforcement trigger
CREATE OR REPLACE FUNCTION public.enforce_booking_market()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s_region public.market_region;
  t_region public.market_region;
BEGIN
  SELECT market_region INTO s_region FROM public.users WHERE id = NEW.student_id;
  SELECT market_region INTO t_region FROM public.users WHERE id = NEW.teacher_id;

  IF s_region IS NOT NULL AND t_region IS NOT NULL AND s_region <> t_region THEN
    RAISE EXCEPTION 'Cross-market bookings are not allowed (student=% teacher=%)', s_region, t_region;
  END IF;

  NEW.market_region := COALESCE(s_region, t_region, NEW.market_region, 'INTL');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_class_bookings_market ON public.class_bookings;
CREATE TRIGGER trg_class_bookings_market
BEFORE INSERT OR UPDATE ON public.class_bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_market();
