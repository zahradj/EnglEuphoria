-- Family 20: a smaller family pack (owner, 2026-10-09: "add EUR 150 the lesson count of EUR 150").
-- Same price per lesson as the Mastery pack of each hub, like Family 30 / Family 40:
--   Playground EUR 7.50 x 20 = EUR 150,  Academy EUR 7.25 x 20 = EUR 145,  Success Hub EUR 9.75 x 20 = EUR 195.
-- Safe to run twice (skips a hub that already has it). Prices can be edited here later.
INSERT INTO public.credit_packs (name, student_level, session_count, price_eur, original_price_eur, savings_eur, is_active, sort_order, family_only)
SELECT v.name, v.level, v.lessons, v.price, v.price, 0, true, v.sort, true
FROM (VALUES
  ('Family 20', 'playground',   20, 150.00,  9),
  ('Family 20', 'academy',      20, 145.00,  9),
  ('Family 20', 'professional', 20, 195.00,  9)
) AS v(name, level, lessons, price, sort)
WHERE NOT EXISTS (SELECT 1 FROM public.credit_packs p WHERE p.name = v.name AND p.student_level = v.level);
