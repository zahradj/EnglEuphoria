-- audit_logs had SELECT-only policies (admin viewing) and no INSERT policy
-- at all, so every client-side audit insert in the app (LessonSwitcher.tsx's
-- mid-class lesson override, and the new setCurrentLesson() admin editor)
-- was being silently rejected by RLS's default-deny — non-fatal since both
-- call sites wrap the insert in a try/catch, but the audit trail those
-- features were built to produce has never actually been written.
-- Self-attributed inserts only: a client may only write a row naming
-- itself as the actor, matching this table's existing "append your own
-- action" use pattern.
CREATE POLICY "Users can insert their own audit log entries"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
