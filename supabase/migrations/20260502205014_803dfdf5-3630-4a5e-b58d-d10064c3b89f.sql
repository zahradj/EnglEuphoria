
-- ============ classroom_sessions: restrict SELECT to teacher + booked students ============
DROP POLICY IF EXISTS "Authenticated users can view classroom sessions" ON public.classroom_sessions;

CREATE POLICY "Teachers and admins can view their classroom sessions"
ON public.classroom_sessions
FOR SELECT
TO authenticated
USING (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Students with bookings can view their classroom sessions"
ON public.classroom_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.class_bookings cb
    WHERE cb.student_id = auth.uid()
      AND (
        cb.classroom_id::text = classroom_sessions.room_id
        OR cb.session_id = classroom_sessions.id::text
      )
      AND cb.status NOT IN ('cancelled', 'refunded')
  )
);

-- ============ leaderboard_entries: own + admin/teacher only ============
DROP POLICY IF EXISTS "Authenticated users can view leaderboard" ON public.leaderboard_entries;

CREATE POLICY "Users can view their own leaderboard entry"
ON public.leaderboard_entries
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Admins and teachers can view leaderboard"
ON public.leaderboard_entries
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'teacher'::public.app_role)
);

-- ============ achievement_shares: scope reads ============
DROP POLICY IF EXISTS "Authenticated users can view achievement shares" ON public.achievement_shares;

CREATE POLICY "Users can view their own achievement shares"
ON public.achievement_shares
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Admins can view all achievement shares"
ON public.achievement_shares
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ============ teacher_applications: tighten anonymous insert ============
DROP POLICY IF EXISTS "Anyone can submit teacher applications" ON public.teacher_applications;

CREATE POLICY "Anonymous users can submit applications without user_id"
ON public.teacher_applications
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND admin_notes IS NULL
);

CREATE POLICY "Authenticated users can submit applications for themselves"
ON public.teacher_applications
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND admin_notes IS NULL
);

-- ============ storage: exports bucket admin-only access ============
DROP POLICY IF EXISTS "Authenticated users can read exports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload exports" ON storage.objects;

CREATE POLICY "Only admins can read exports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'exports'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Only admins can upload exports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exports'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
