
-- 1. revenue_splits — admins only
DROP POLICY IF EXISTS "revenue_splits_select" ON public.revenue_splits;
CREATE POLICY "Admins can view revenue splits"
  ON public.revenue_splits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. hub_payout_settings — admins only
DROP POLICY IF EXISTS "Authenticated can read hub payout settings" ON public.hub_payout_settings;

-- 3. curriculum_exports — admins only
DROP POLICY IF EXISTS "Authenticated users can view exports" ON public.curriculum_exports;
DROP POLICY IF EXISTS "Authenticated users can create exports" ON public.curriculum_exports;
CREATE POLICY "Admins can view curriculum exports"
  ON public.curriculum_exports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can create curriculum exports"
  ON public.curriculum_exports FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. classroom_files — participants only
DROP POLICY IF EXISTS "Users can view classroom files" ON public.classroom_files;
CREATE POLICY "Participants can view classroom files"
  ON public.classroom_files FOR SELECT TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.classroom_id::text = classroom_files.room_id
        AND (cb.student_id = auth.uid() OR cb.teacher_id = auth.uid())
    )
  );

-- 5. system_emails — teachers only see their own
DROP POLICY IF EXISTS "Teachers can view related system emails" ON public.system_emails;
CREATE POLICY "Teachers can view their own system emails"
  ON public.system_emails FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher'::app_role)
    AND (
      recipient_email = (auth.jwt() ->> 'email')
      OR EXISTS (
        SELECT 1 FROM public.class_bookings cb
        WHERE cb.teacher_id = auth.uid()
          AND cb.id::text = COALESCE(system_emails.related_entity_id::text, '')
      )
    )
  );

-- 6. teacher_profiles — safe public view, tighten base SELECT
CREATE OR REPLACE VIEW public.teacher_profiles_public
WITH (security_invoker = on) AS
SELECT
  id, user_id, bio, specializations, accent, languages_spoken,
  intro_video_url, profile_image_url, hourly_rate_dzd, hourly_rate_eur,
  years_experience, rating, total_reviews, is_available, timezone,
  availability_schedule, created_at, updated_at, video_url,
  profile_complete, can_teach, profile_approved_by_admin,
  certificate_urls, video_status, welcome_shown, hub_role
FROM public.teacher_profiles
WHERE profile_complete = true AND can_teach = true AND profile_approved_by_admin = true;

GRANT SELECT ON public.teacher_profiles_public TO anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can view approved teachers" ON public.teacher_profiles;
CREATE POLICY "Owner and admin can view full teacher profile"
  ON public.teacher_profiles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 7-10. Email infrastructure tables — admin SELECT
DROP POLICY IF EXISTS "Admins can view email send log" ON public.email_send_log;
CREATE POLICY "Admins can view email send log"
  ON public.email_send_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view unsubscribe tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Admins can view unsubscribe tokens"
  ON public.email_unsubscribe_tokens FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Admins can view suppressed emails"
  ON public.suppressed_emails FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view email queue messages" ON public.email_queue_messages;
CREATE POLICY "Admins can view email queue messages"
  ON public.email_queue_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view email queue dlq" ON public.email_queue_dlq;
CREATE POLICY "Admins can view email queue dlq"
  ON public.email_queue_dlq FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 11. analytics_events — admin SELECT
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 12. teacher_availability — must own matching booking
DROP POLICY IF EXISTS "System can mark slots as booked" ON public.teacher_availability;
CREATE POLICY "Booking owner can mark slot booked"
  ON public.teacher_availability FOR UPDATE TO authenticated
  USING (
    is_available = true
    AND is_booked = false
    AND EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.teacher_id = teacher_availability.teacher_id
        AND cb.student_id = auth.uid()
        AND cb.scheduled_at = teacher_availability.start_time
    )
  )
  WITH CHECK (is_booked = true);

-- 13. teacher-applications storage — structured path required for anon
DROP POLICY IF EXISTS "Anyone can upload application files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload teacher application files" ON storage.objects;

CREATE POLICY "Anon can upload application files to applications path"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'teacher-applications'
    AND (storage.foldername(name))[1] = 'applications'
    AND array_length(storage.foldername(name), 1) >= 2
  );

-- 14. notification_logs — safe view for teachers (no recipient_email)
CREATE OR REPLACE VIEW public.notification_logs_teacher_safe
WITH (security_invoker = on) AS
SELECT
  id, student_id, unit_id, template_name, status, email_sent_at, created_at
FROM public.notification_logs;

GRANT SELECT ON public.notification_logs_teacher_safe TO authenticated;
