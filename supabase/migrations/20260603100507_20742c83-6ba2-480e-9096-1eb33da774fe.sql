
-- Interview Arena: bind interviews to a live classroom session and add scorecard
ALTER TABLE public.interviews
  ADD COLUMN IF NOT EXISTS classroom_session_id text,
  ADD COLUMN IF NOT EXISTS mock_lesson_key text DEFAULT 'playground_sampler',
  ADD COLUMN IF NOT EXISTS scorecard jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS applicant_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_interviews_classroom_session_id ON public.interviews(classroom_session_id);
CREATE INDEX IF NOT EXISTS idx_interviews_applicant_user_id ON public.interviews(applicant_user_id);

-- classroom_states: flag interview-mode sessions and store mock-lesson key
ALTER TABLE public.classroom_states
  ADD COLUMN IF NOT EXISTS is_interview boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mock_lesson_key text;
