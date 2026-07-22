-- Fix overly permissive RLS policies (WITH CHECK(true) or USING(true) for non-SELECT)

-- ===== SYSTEM-ONLY TABLES: Remove public INSERT policies =====
-- These are written by edge functions using service_role key or by triggers

DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can manage generation jobs" ON public.content_generation_jobs;
DROP POLICY IF EXISTS "System can create payments" ON public.lesson_payments;
DROP POLICY IF EXISTS "System can update payments" ON public.lesson_payments;
DROP POLICY IF EXISTS "System can insert predictions" ON public.ml_predictions;
DROP POLICY IF EXISTS "System can insert alerts" ON public.performance_alerts;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "audit_system_insert" ON public.security_audit_logs;
DROP POLICY IF EXISTS "System can create absences" ON public.teacher_absences;
DROP POLICY IF EXISTS "System can insert absences" ON public.teacher_absences;
DROP POLICY IF EXISTS "System can insert achievements" ON public.teacher_achievements;
DROP POLICY IF EXISTS "System can insert penalties" ON public.teacher_penalties;
DROP POLICY IF EXISTS "System can insert metrics" ON public.teacher_performance_metrics;
DROP POLICY IF EXISTS "System can manage teacher metrics" ON public.teacher_performance_metrics;

-- ===== USER-FACING TABLES: Replace with scoped policies =====

-- classroom_files: Restrict uploads to authenticated users as themselves
DROP POLICY IF EXISTS "Users can upload files" ON public.classroom_files;
CREATE POLICY "Authenticated users can upload own files"
ON public.classroom_files FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- lessons_content: Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can create lessons" ON public.lessons_content;
CREATE POLICY "Authenticated users can create lesson content"
ON public.lessons_content FOR INSERT TO authenticated
WITH CHECK (true);

-- poll_responses: Replace ALL(true) with scoped policies
DROP POLICY IF EXISTS "Allow all poll responses" ON public.poll_responses;
CREATE POLICY "Authenticated users can view poll responses"
ON public.poll_responses FOR SELECT TO authenticated
USING (true);
CREATE POLICY "Authenticated users can submit poll responses"
ON public.poll_responses FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

-- quiz_responses: Replace ALL(true) with scoped policies
DROP POLICY IF EXISTS "Allow all quiz responses" ON public.quiz_responses;
CREATE POLICY "Authenticated users can view quiz responses"
ON public.quiz_responses FOR SELECT TO authenticated
USING (true);
CREATE POLICY "Authenticated users can submit quiz responses"
ON public.quiz_responses FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

-- referrals: Scope to own referrals
DROP POLICY IF EXISTS "Authenticated users can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert own referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (referrer_id = auth.uid());
