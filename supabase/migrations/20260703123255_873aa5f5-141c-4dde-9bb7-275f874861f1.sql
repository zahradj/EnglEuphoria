
CREATE TABLE IF NOT EXISTS public.bonus_policy (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  tier_elite_threshold numeric NOT NULL DEFAULT 95,
  tier_elite_pct numeric NOT NULL DEFAULT 15,
  tier_excellent_threshold numeric NOT NULL DEFAULT 85,
  tier_excellent_pct numeric NOT NULL DEFAULT 10,
  tier_strong_threshold numeric NOT NULL DEFAULT 70,
  tier_strong_pct numeric NOT NULL DEFAULT 6,
  tier_ontrack_threshold numeric NOT NULL DEFAULT 55,
  tier_ontrack_pct numeric NOT NULL DEFAULT 3,
  kicker_threshold numeric NOT NULL DEFAULT 90,
  kicker_pct_each numeric NOT NULL DEFAULT 1,
  kicker_max_pct numeric NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.bonus_policy TO authenticated;
GRANT ALL ON public.bonus_policy TO service_role;

ALTER TABLE public.bonus_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Any authenticated user can read bonus policy"
  ON public.bonus_policy FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update bonus policy"
  ON public.bonus_policy FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert bonus policy"
  ON public.bonus_policy FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.bonus_policy (id) VALUES (true) ON CONFLICT DO NOTHING;
