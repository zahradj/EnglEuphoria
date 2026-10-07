-- Family packs: bigger lesson packs bought from the family dashboard and shared between children
-- with "Move lessons". Same price per lesson as the Mastery pack of each hub (no extra discount).
-- family_only keeps them off the ordinary pricing pages; create-pack-checkout refuses them unless a
-- parent buys for one of their children. Prices can be edited here later.
ALTER TABLE public.credit_packs ADD COLUMN IF NOT EXISTS family_only boolean NOT NULL DEFAULT false;

INSERT INTO public.credit_packs (name, student_level, session_count, price_eur, original_price_eur, savings_eur, is_active, sort_order, family_only)
SELECT v.name, v.level, v.lessons, v.price, v.price, 0, true, v.sort, true
FROM (VALUES
  ('Family 30', 'playground', 30, 225.00, 10),
  ('Family 40', 'playground', 40, 300.00, 11),
  ('Family 30', 'academy', 30, 217.50, 12),
  ('Family 40', 'academy', 40, 290.00, 13),
  ('Family 30', 'professional', 30, 292.50, 14),
  ('Family 40', 'professional', 40, 390.00, 15)
) AS v(name, level, lessons, price, sort)
WHERE NOT EXISTS (SELECT 1 FROM public.credit_packs p WHERE p.name = v.name AND p.student_level = v.level);
