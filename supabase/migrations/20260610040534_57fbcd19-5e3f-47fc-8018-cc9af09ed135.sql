
-- Add per-class compensation + multi-hub + market access on teacher_profiles
ALTER TABLE public.teacher_profiles
  ADD COLUMN IF NOT EXISTS per_class_rate numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assigned_hubs text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS market_access text[] NOT NULL DEFAULT ARRAY['DZ']::text[];

-- Payouts ledger for monthly mark-as-paid
CREATE TABLE IF NOT EXISTS public.teacher_payouts_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  classes_count integer NOT NULL DEFAULT 0,
  rate_applied numeric(10,2) NOT NULL DEFAULT 0,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'paid',
  paid_at timestamptz NOT NULL DEFAULT now(),
  paid_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_payouts_ledger TO authenticated;
GRANT ALL ON public.teacher_payouts_ledger TO service_role;

ALTER TABLE public.teacher_payouts_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers read own payouts ledger"
  ON public.teacher_payouts_ledger FOR SELECT
  TO authenticated
  USING (teacher_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage payouts ledger"
  ON public.teacher_payouts_ledger FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS teacher_payouts_ledger_teacher_period_idx
  ON public.teacher_payouts_ledger (teacher_user_id, period_start DESC);

-- RPC: monthly owed for a teacher (current month).
-- Counts completed class_bookings since last paid period_end.
CREATE OR REPLACE FUNCTION public.get_teacher_monthly_owed(p_teacher_user_id uuid)
RETURNS TABLE (
  classes_count integer,
  rate_applied numeric,
  amount numeric,
  period_start date,
  period_end date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cfg AS (
    SELECT COALESCE(per_class_rate, 0)::numeric AS rate
    FROM public.teacher_profiles
    WHERE user_id = p_teacher_user_id
    LIMIT 1
  ),
  bounds AS (
    SELECT
      date_trunc('month', now())::date AS p_start,
      (date_trunc('month', now()) + interval '1 month - 1 day')::date AS p_end
  ),
  completed AS (
    SELECT count(*)::integer AS n
    FROM public.class_bookings cb, bounds b
    WHERE cb.teacher_id = p_teacher_user_id
      AND cb.status = 'completed'
      AND cb.scheduled_at >= b.p_start
      AND cb.scheduled_at < (b.p_end + interval '1 day')
  )
  SELECT
    completed.n,
    cfg.rate,
    (completed.n * cfg.rate)::numeric,
    bounds.p_start,
    bounds.p_end
  FROM completed, cfg, bounds;
$$;

GRANT EXECUTE ON FUNCTION public.get_teacher_monthly_owed(uuid) TO authenticated;
