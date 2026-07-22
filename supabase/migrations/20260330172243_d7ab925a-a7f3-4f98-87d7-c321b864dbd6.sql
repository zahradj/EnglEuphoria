
-- Fix overly permissive RLS policies on 3 tables

-- 1. TEACHER_APPLICATIONS: Drop USING(true) SELECT and WITH CHECK(true) INSERT
DROP POLICY IF EXISTS "Applicants can view own application by email" ON public.teacher_applications;
DROP POLICY IF EXISTS "Anyone can submit teacher applications" ON public.teacher_applications;

-- 2. LESSON_REMINDERS: Drop open ALL policy
DROP POLICY IF EXISTS "System can manage reminders" ON public.lesson_reminders;

-- 3. CHAT_MESSAGES: Drop open SELECT and INSERT, replace with scoped policies
DROP POLICY IF EXISTS "Users can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;

-- Authenticated users can read messages they sent or in rooms they participate in
CREATE POLICY "Authenticated users can view room messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.classroom_sessions cs
    WHERE cs.room_id = chat_messages.room_id
    AND cs.teacher_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.room_id = chat_messages.room_id
    AND (l.teacher_id = auth.uid() OR l.student_id = auth.uid())
  )
);

-- Authenticated users can only insert messages as themselves
CREATE POLICY "Authenticated users can send own messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);
