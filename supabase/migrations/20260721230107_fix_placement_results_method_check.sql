-- placement_results.method has been CHECK-constrained to only
-- ('beginner_bypass', 'lean_cat') since the table's creation
-- (20260606160656) — but neither value is ever actually used by the live
-- product. The real, currently-running code paths write:
--   - 'ai_full'        (usePlacementTest.ts completeTest() — the actual
--                        placement test every student takes)
--   - 'self_beginner'  (OnboardingPlacementLean.tsx selfPlaceBeginner())
--   - 'trial_lesson'   (backfill_trial_placement_on_end() trigger, added in
--                        20260703192630 — whose EXCEPTION WHEN OTHERS
--                        handler silently swallowed this same violation)
-- Every one of these has been silently rejected since day one: verified
-- live against the running database (empty placement_results table despite
-- multiple completed placement tests). This starved every downstream
-- consumer — including useStudentSkills.ts's freshness check — of data it
-- was designed to read.

ALTER TABLE public.placement_results DROP CONSTRAINT IF EXISTS placement_results_method_check;
ALTER TABLE public.placement_results ADD CONSTRAINT placement_results_method_check
  CHECK (method IN ('beginner_bypass', 'lean_cat', 'ai_full', 'self_beginner', 'trial_lesson'));
