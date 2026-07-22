-- Phase 1 Continued: Add missing RLS policies and fix remaining tables

-- Add missing policies for audit_logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- Add missing policies for lesson_payments
CREATE POLICY "Users can view their own lesson payments" ON public.lesson_payments
FOR SELECT USING (
  auth.uid() = student_id OR 
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add missing policies for teacher_withdrawals
CREATE POLICY "Teachers can manage their own withdrawals" ON public.teacher_withdrawals
FOR ALL USING (
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add missing policies for systematic_lessons
CREATE POLICY "Teachers and admins can access systematic lessons" ON public.systematic_lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'admin')
  )
);

-- Secure speaking_practice_sessions - only allow users to access their own sessions
CREATE POLICY "Users can view their own speaking sessions" ON public.speaking_practice_sessions
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own speaking sessions" ON public.speaking_practice_sessions
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own speaking sessions" ON public.speaking_practice_sessions
FOR UPDATE USING (auth.uid() = student_id);

-- Secure speaking_groups - basic access control
CREATE POLICY "Users can view speaking groups" ON public.speaking_groups
FOR SELECT USING (
  privacy_level = 'public' OR 
  EXISTS (
    SELECT 1 FROM public.speaking_group_participants 
    WHERE group_id = speaking_groups.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create speaking groups" ON public.speaking_groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can manage their groups" ON public.speaking_groups
FOR UPDATE USING (auth.uid() = created_by);

-- Secure speaking_group_participants
CREATE POLICY "Users can view group participants" ON public.speaking_group_participants
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.speaking_groups 
    WHERE id = speaking_group_participants.group_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can join groups" ON public.speaking_group_participants
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.speaking_group_participants
FOR DELETE USING (auth.uid() = user_id);

-- Secure lesson_completions
CREATE POLICY "Users can view their own lesson completions" ON public.lesson_completions
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own lesson completions" ON public.lesson_completions
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Secure weekly_assessments  
CREATE POLICY "Users can view their own assessments" ON public.weekly_assessments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own assessments" ON public.weekly_assessments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Secure student_curriculum_progress
CREATE POLICY "Students can view their own curriculum progress" ON public.student_curriculum_progress
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own curriculum progress" ON public.student_curriculum_progress
FOR ALL USING (auth.uid() = student_id);