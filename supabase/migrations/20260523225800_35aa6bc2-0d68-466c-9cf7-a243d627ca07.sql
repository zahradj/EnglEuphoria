
-- 1. Set search_path on remaining mutable functions
ALTER FUNCTION public.hub_role_slot_profile(text) SET search_path = public;
ALTER FUNCTION public.jsonb_array_append(jsonb, jsonb) SET search_path = public;
ALTER FUNCTION public.tg_storybook_touch_updated_at() SET search_path = public;
ALTER FUNCTION public.update_iron_updated_at() SET search_path = public;
ALTER FUNCTION public.update_lesson_progress_timestamp() SET search_path = public;
ALTER FUNCTION public.update_lesson_progress_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Recreate views with security_invoker so RLS of querying user is enforced
ALTER VIEW public.teacher_profiles_public SET (security_invoker = true);
ALTER VIEW public.lesson_library_view SET (security_invoker = true);
ALTER VIEW public.notification_logs_teacher_safe SET (security_invoker = true);

-- 3. Add explicit admin-only policies to RLS-enabled tables with no policies
DROP POLICY IF EXISTS "Admins manage community_challenges" ON public.community_challenges;
CREATE POLICY "Admins manage community_challenges" ON public.community_challenges
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Authenticated can read community_challenges" ON public.community_challenges;
CREATE POLICY "Authenticated can read community_challenges" ON public.community_challenges
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users manage own challenge participation" ON public.community_challenge_participations;
CREATE POLICY "Users manage own challenge participation" ON public.community_challenge_participations
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Users manage own event participation" ON public.community_event_participants;
CREATE POLICY "Users manage own event participation" ON public.community_event_participants
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Service role only: email_send_state" ON public.email_send_state;
CREATE POLICY "Service role only: email_send_state" ON public.email_send_state
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 4. Tighten always-true mutation policies on service-only tables
DROP POLICY IF EXISTS "pqr_service_write" ON public.pedagogical_quality_reports;
CREATE POLICY "pqr_service_write" ON public.pedagogical_quality_reports
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'content_creator'));

DROP POLICY IF EXISTS "css_service_write" ON public.curriculum_stabilization_signals;
CREATE POLICY "css_service_write" ON public.curriculum_stabilization_signals
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'content_creator'));

DROP POLICY IF EXISTS "css_service_update" ON public.curriculum_stabilization_signals;
CREATE POLICY "css_service_update" ON public.curriculum_stabilization_signals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_creator'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_creator'));
