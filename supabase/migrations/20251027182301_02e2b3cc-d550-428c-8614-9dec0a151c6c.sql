-- Drop the incomplete INSERT policy that has no WITH CHECK clause
DROP POLICY IF EXISTS "Teachers can create own availability" ON teacher_availability;

-- The existing "Teachers can manage their own availability" (ALL) policy 
-- already covers INSERT operations with proper auth checks:
-- USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id)

-- Verify the remaining policies are correct
COMMENT ON POLICY "Teachers can manage their own availability" ON teacher_availability 
IS 'Handles ALL operations (SELECT, INSERT, UPDATE, DELETE) for teachers managing their own availability';