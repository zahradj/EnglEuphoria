
-- Add force_refresh_timestamp for the Deep Refresh panic button
ALTER TABLE public.classroom_sessions
ADD COLUMN IF NOT EXISTS force_refresh_timestamp bigint DEFAULT 0;

-- Drop existing restrictive policies and recreate with proper student access
DROP POLICY IF EXISTS "Room participants can view session data" ON public.classroom_sessions;
DROP POLICY IF EXISTS "Teachers and admins can access classroom sessions" ON public.classroom_sessions;

-- Unified SELECT: any authenticated user can read classroom sessions
-- This ensures Supabase Realtime works for students (silent fail if no SELECT access)
CREATE POLICY "Authenticated users can view classroom sessions"
ON public.classroom_sessions
FOR SELECT
TO authenticated
USING (true);

-- UPDATE: teachers can update their own sessions, admins can update any
DROP POLICY IF EXISTS "Teachers can update their sessions" ON public.classroom_sessions;
CREATE POLICY "Teachers and admins can update sessions"
ON public.classroom_sessions
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid() OR is_user_admin())
WITH CHECK (teacher_id = auth.uid() OR is_user_admin());
