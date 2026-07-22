-- Phase 1 Final: Add missing RLS policies for existing tables only

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

-- Add missing policies for systematic_lessons (if exists)
DROP POLICY IF EXISTS "Teachers and admins can access systematic lessons" ON public.systematic_lessons;
CREATE POLICY "Teachers and admins can access systematic lessons" ON public.systematic_lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'admin')
  )
);

-- Secure speaking_groups
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