-- Phase 1 Essential: Add missing RLS policies for core security

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