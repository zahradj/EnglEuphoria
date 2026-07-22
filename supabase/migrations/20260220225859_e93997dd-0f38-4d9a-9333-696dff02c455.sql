
-- Step 12A: Add session_id and meeting_link to class_bookings
ALTER TABLE public.class_bookings
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- Create unique index on session_id
CREATE UNIQUE INDEX IF NOT EXISTS class_bookings_session_id_idx
  ON public.class_bookings (session_id)
  WHERE session_id IS NOT NULL;

-- Trigger function: auto-generate session_id + meeting_link on INSERT
CREATE OR REPLACE FUNCTION public.generate_booking_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate a 12-char alphanumeric session ID
  NEW.session_id := substring(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  -- Student-facing meeting link
  NEW.meeting_link := '/student-classroom/' || NEW.session_id;
  RETURN NEW;
END;
$$;

-- Attach trigger BEFORE INSERT on class_bookings
DROP TRIGGER IF EXISTS trg_generate_booking_session ON public.class_bookings;
CREATE TRIGGER trg_generate_booking_session
  BEFORE INSERT ON public.class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_booking_session();

-- Backfill existing rows that lack a session_id
UPDATE public.class_bookings
SET
  session_id = substring(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  meeting_link = '/student-classroom/' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 12)
WHERE session_id IS NULL;

-- Step 13C: RLS cleanup — add explicit INSERT policy on class_bookings for students
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'class_bookings'
      AND policyname = 'students_can_insert_own_bookings'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "students_can_insert_own_bookings"
      ON public.class_bookings
      FOR INSERT
      TO authenticated
      WITH CHECK (student_id = auth.uid())
    $policy$;
  END IF;
END $$;

-- Step 13C: Add function to check classroom session access for students
CREATE OR REPLACE FUNCTION public.can_access_booking_session(p_session_id TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.class_bookings
    WHERE session_id = p_session_id
      AND (student_id = p_user_id OR teacher_id = p_user_id)
      AND status IN ('confirmed', 'in_progress', 'completed')
  );
END;
$$;
