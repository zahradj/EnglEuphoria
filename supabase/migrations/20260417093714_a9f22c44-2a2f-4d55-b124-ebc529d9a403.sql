-- ============================================================
-- A. Classroom ID resolver + backfill
-- ============================================================

-- Backfill: link existing class_bookings to lessons by (teacher, student, scheduled_at)
UPDATE public.class_bookings cb
SET lesson_id = l.id
FROM public.lessons l
WHERE cb.lesson_id IS NULL
  AND cb.teacher_id = l.teacher_id
  AND cb.student_id = l.student_id
  AND cb.scheduled_at = l.scheduled_at;

-- Resolver: accepts class_bookings.id, class_bookings.classroom_id, or lessons.id
-- and returns the canonical class_bookings.id
CREATE OR REPLACE FUNCTION public.resolve_classroom_id(any_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved uuid;
BEGIN
  -- Direct match on class_bookings.id
  SELECT id INTO resolved FROM public.class_bookings WHERE id = any_id LIMIT 1;
  IF resolved IS NOT NULL THEN
    RETURN resolved;
  END IF;

  -- Match on class_bookings.classroom_id
  SELECT id INTO resolved FROM public.class_bookings WHERE classroom_id = any_id LIMIT 1;
  IF resolved IS NOT NULL THEN
    RETURN resolved;
  END IF;

  -- Match via lessons.id -> class_bookings.lesson_id
  SELECT cb.id INTO resolved
  FROM public.class_bookings cb
  WHERE cb.lesson_id = any_id
  LIMIT 1;
  IF resolved IS NOT NULL THEN
    RETURN resolved;
  END IF;

  -- Last resort: lesson exists but no booking row — match by teacher/student/time
  SELECT cb.id INTO resolved
  FROM public.lessons l
  JOIN public.class_bookings cb
    ON cb.teacher_id = l.teacher_id
   AND cb.student_id = l.student_id
   AND cb.scheduled_at = l.scheduled_at
  WHERE l.id = any_id
  LIMIT 1;

  RETURN resolved;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_classroom_id(uuid) TO authenticated, anon;

-- ============================================================
-- B. Hub payout settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hub_payout_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub text NOT NULL UNIQUE,
  payout_amount_eur numeric(6,2) NOT NULL DEFAULT 0,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hub_payout_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage hub payout settings" ON public.hub_payout_settings;
CREATE POLICY "Admins manage hub payout settings"
ON public.hub_payout_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can read hub payout settings" ON public.hub_payout_settings;
CREATE POLICY "Authenticated can read hub payout settings"
ON public.hub_payout_settings
FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER hub_payout_settings_set_updated_at
BEFORE UPDATE ON public.hub_payout_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hub_payout_settings (hub, payout_amount_eur) VALUES
  ('playground', 3.50),
  ('academy', 7.00),
  ('professional', 7.00)
ON CONFLICT (hub) DO NOTHING;