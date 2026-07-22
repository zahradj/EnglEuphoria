-- Security hardening: several "System can ..." policies were written with
-- USING(true)/WITH CHECK(true), intended for service-role writes but actually
-- granting every authenticated (and in some cases anonymous) client the same
-- access. Service-role callers (edge functions) bypass RLS entirely, so none
-- of these ever needed a permissive client-facing policy in the first place.
-- Replace each with a policy scoped to who legitimately writes that row today.

-- 1. lesson_payments — only the student or teacher on the referenced lesson
-- may insert a payment row (covers both self-booking and teacher-initiated
-- booking flows in lessonPricingService.bookLessonWithPayment).
DROP POLICY IF EXISTS "System can insert payments" ON public.lesson_payments;
CREATE POLICY "Lesson participants can insert payments"
ON public.lesson_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.id = lesson_payments.lesson_id
      AND (l.student_id = auth.uid() OR l.teacher_id = auth.uid())
  )
);

-- 2. package_lesson_redemptions — same participant check, via the lesson
-- the redemption is for.
DROP POLICY IF EXISTS "System can create redemptions" ON public.package_lesson_redemptions;
CREATE POLICY "Lesson participants can insert redemptions"
ON public.package_lesson_redemptions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.id = package_lesson_redemptions.lesson_id
      AND (l.student_id = auth.uid() OR l.teacher_id = auth.uid())
  )
);

-- 3. notifications — the only live callers that insert on behalf of another
-- user are admin-only screens (SuperAdminControlCenter, AdminBroadcastCenter).
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. teacher_penalties — no live caller today; admin-only is the correct
-- default for a punitive record against a teacher.
DROP POLICY IF EXISTS "System can insert teacher penalties" ON public.teacher_penalties;
CREATE POLICY "Admins can insert teacher penalties"
ON public.teacher_penalties
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. teacher_absences — same reasoning as teacher_penalties.
DROP POLICY IF EXISTS "System can insert teacher absences" ON public.teacher_absences;
CREATE POLICY "Admins can insert teacher absences"
ON public.teacher_absences
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. security_audit_logs — SecurityAuditLogger.tsx always logs the caller's
-- own user_id (or null for pre-auth events); never someone else's.
DROP POLICY IF EXISTS "System can create audit logs" ON public.security_audit_logs;
CREATE POLICY "Users can insert their own audit logs"
ON public.security_audit_logs
FOR INSERT
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 7 & 8. content_generation_jobs / content_generation_tasks — never read or
-- written from the frontend (backend content pipeline only, via service
-- role). Client-facing access should be admin-only, not "anyone".
DROP POLICY IF EXISTS "System can manage generation jobs" ON public.content_generation_jobs;
CREATE POLICY "Admins can manage generation jobs"
ON public.content_generation_jobs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "System can manage generation tasks" ON public.content_generation_tasks;
CREATE POLICY "Admins can manage generation tasks"
ON public.content_generation_tasks
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 9. storage 'slides-media' bucket — upload/update had no auth check at all
-- (not even "authenticated"), letting anyone write to a public bucket.
DROP POLICY IF EXISTS "System can upload slides media" ON storage.objects;
CREATE POLICY "Authenticated users can upload slides media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'slides-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "System can update slides media" ON storage.objects;
CREATE POLICY "Authenticated users can update slides media"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'slides-media' AND auth.role() = 'authenticated');
