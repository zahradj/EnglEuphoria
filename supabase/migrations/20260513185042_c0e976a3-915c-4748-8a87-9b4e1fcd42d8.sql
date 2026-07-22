
-- Add content column for the AI-generated 3-part homework JSON
ALTER TABLE public.homework_assignments
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Make sure the Map of Sounds table can hold image + audio
ALTER TABLE public.student_phonics_progress
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS audio_url text;

-- And the vocabulary vault — sticker_image_url already covers visuals,
-- add a generic image_url alias for parity with phonics.
ALTER TABLE public.student_vocabulary_progress
  ADD COLUMN IF NOT EXISTS image_url text;

-- Uniqueness so the post-class sync is idempotent (no duplicates per learner)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_student_vocab_word
  ON public.student_vocabulary_progress (student_id, word);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_student_phonics_phoneme
  ON public.student_phonics_progress (student_id, phoneme);
