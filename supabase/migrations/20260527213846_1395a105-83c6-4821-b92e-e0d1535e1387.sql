ALTER TABLE public.curriculum_units
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS target_grammar text,
  ADD COLUMN IF NOT EXISTS target_vocabulary_pool text[],
  ADD COLUMN IF NOT EXISTS hub text;

COMMENT ON COLUMN public.curriculum_units.theme IS 'Cycle 3 unit-lock: single canonical theme slug from THEME_MATRIX[hub][cefr].';
COMMENT ON COLUMN public.curriculum_units.target_grammar IS 'Cycle 3 unit-lock: exactly one grammar rule the lesson generator is allowed to teach.';
COMMENT ON COLUMN public.curriculum_units.target_vocabulary_pool IS 'Cycle 3 unit-lock: 5-10 vocabulary words the lesson generator MUST use.';
COMMENT ON COLUMN public.curriculum_units.hub IS 'Cycle 3 unit-lock: playground | academy | success (denormalized for lesson-time lookup).';