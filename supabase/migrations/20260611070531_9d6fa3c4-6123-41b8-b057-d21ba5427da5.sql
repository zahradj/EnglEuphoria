CREATE TABLE public.academy_coin_ledger (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  delta integer not null,
  reason text not null,
  lesson_id uuid,
  block_id text,
  created_at timestamptz not null default now()
);
CREATE INDEX academy_coin_ledger_student_idx ON public.academy_coin_ledger(student_id, created_at DESC);
CREATE UNIQUE INDEX academy_coin_ledger_block_unique
  ON public.academy_coin_ledger(student_id, lesson_id, block_id)
  WHERE block_id IS NOT NULL;

GRANT SELECT, INSERT ON public.academy_coin_ledger TO authenticated;
GRANT ALL ON public.academy_coin_ledger TO service_role;
ALTER TABLE public.academy_coin_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read own coins"
  ON public.academy_coin_ledger FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "students insert own coins"
  ON public.academy_coin_ledger FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND delta > 0 AND delta <= 50);

CREATE OR REPLACE VIEW public.academy_coin_balances AS
  SELECT student_id, COALESCE(SUM(delta), 0)::int AS coins
  FROM public.academy_coin_ledger GROUP BY student_id;
GRANT SELECT ON public.academy_coin_balances TO authenticated;