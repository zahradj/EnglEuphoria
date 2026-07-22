-- Comprehensive Security Hardening Migration
-- This addresses multiple critical security vulnerabilities

-- 1. Enable RLS on tables that don't have it
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_curriculum_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reward_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_community_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Secure Users Table - Most Critical
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Users can only view their own profile and basic public info of others
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only admins can create/delete users
CREATE POLICY "Only admins can create users" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can delete users" 
ON public.users 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 3. Secure Teacher Profiles
DROP POLICY IF EXISTS "Teacher profiles are public" ON public.teacher_profiles;

-- Public can view approved teacher profiles only
CREATE POLICY "Public can view approved teacher profiles" 
ON public.teacher_profiles 
FOR SELECT 
TO public
USING (profile_complete = true AND can_teach = true AND profile_approved_by_admin = true);

-- Authenticated users can view more teacher details
CREATE POLICY "Authenticated users can view teacher profiles" 
ON public.teacher_profiles 
FOR SELECT 
TO authenticated
USING (profile_complete = true AND can_teach = true);

-- Teachers can view and update their own profiles
CREATE POLICY "Teachers can manage own profile" 
ON public.teacher_profiles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can manage all teacher profiles
CREATE POLICY "Admins can manage all teacher profiles" 
ON public.teacher_profiles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 4. Secure Student Profiles
-- Students can only view/update their own profiles
CREATE POLICY "Students can manage own profile" 
ON public.student_profiles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Teachers can view student profiles for their lessons only
CREATE POLICY "Teachers can view student profiles for lessons" 
ON public.student_profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE lessons.teacher_id = auth.uid() 
    AND lessons.student_id = student_profiles.user_id
  )
);

-- Admins can view all student profiles
CREATE POLICY "Admins can view all student profiles" 
ON public.student_profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 5. Secure Lessons
-- Users can only see lessons they're involved in
CREATE POLICY "Users can view own lessons" 
ON public.lessons 
FOR SELECT 
TO authenticated
USING (teacher_id = auth.uid() OR student_id = auth.uid());

-- Teachers and students can create lessons
CREATE POLICY "Users can create lessons" 
ON public.lessons 
FOR INSERT 
TO authenticated
WITH CHECK (teacher_id = auth.uid() OR student_id = auth.uid());

-- Teachers can update their lessons, students can update their lessons
CREATE POLICY "Users can update own lessons" 
ON public.lessons 
FOR UPDATE 
TO authenticated
USING (teacher_id = auth.uid() OR student_id = auth.uid())
WITH CHECK (teacher_id = auth.uid() OR student_id = auth.uid());

-- 6. Secure Homework
-- Students and teachers can only see homework for their lessons
CREATE POLICY "Users can view own homework" 
ON public.homework 
FOR SELECT 
TO authenticated
USING (teacher_id = auth.uid() OR student_id = auth.uid());

-- Teachers can create homework
CREATE POLICY "Teachers can create homework" 
ON public.homework 
FOR INSERT 
TO authenticated
WITH CHECK (teacher_id = auth.uid());

-- Teachers and students can update homework
CREATE POLICY "Users can update own homework" 
ON public.homework 
FOR UPDATE 
TO authenticated
USING (teacher_id = auth.uid() OR student_id = auth.uid())
WITH CHECK (teacher_id = auth.uid() OR student_id = auth.uid());

-- 7. Secure Teacher Reviews
-- Only authenticated users can view reviews
CREATE POLICY "Authenticated users can view reviews" 
ON public.teacher_reviews 
FOR SELECT 
TO authenticated
USING (is_public = true);

-- Students can create reviews for their lessons
CREATE POLICY "Students can create reviews" 
ON public.teacher_reviews 
FOR INSERT 
TO authenticated
WITH CHECK (
  student_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE lessons.teacher_id = teacher_reviews.teacher_id 
    AND lessons.student_id = auth.uid()
    AND lessons.status = 'completed'
  )
);

-- Students can update their own reviews
CREATE POLICY "Students can update own reviews" 
ON public.teacher_reviews 
FOR UPDATE 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 8. Secure Financial Data
-- Users can only see their own payments
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can create own payments" 
ON public.payments 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Secure Teacher Availability
-- Teachers can manage their own availability
CREATE POLICY "Teachers can manage own availability" 
ON public.teacher_availability 
FOR ALL 
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Students can view available slots
CREATE POLICY "Students can view available slots" 
ON public.teacher_availability 
FOR SELECT 
TO authenticated
USING (is_available = true AND is_booked = false);

-- 10. Secure Speaking Sessions and Progress
CREATE POLICY "Users can manage own speaking sessions" 
ON public.speaking_sessions 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can view own speaking progress" 
ON public.speaking_progress 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 11. Secure Learning Data
CREATE POLICY "Users can manage own curriculum progress" 
ON public.student_curriculum_progress 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can view own lesson completions" 
ON public.lesson_completions 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can view own assessments" 
ON public.weekly_assessments 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 12. Secure Gamification Data
CREATE POLICY "Users can manage own learning currency" 
ON public.learning_currency 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can manage own learning streaks" 
ON public.student_learning_streaks 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can manage own XP" 
ON public.student_xp 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can manage own reward purchases" 
ON public.student_reward_purchases 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 13. Secure Learning Paths
CREATE POLICY "Users can view own learning paths" 
ON public.personalized_learning_paths 
FOR ALL 
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 14. Allow public viewing of lesson packages and subscription plans
CREATE POLICY "Anyone can view active lesson packages" 
ON public.lesson_packages 
FOR SELECT 
TO public
USING (is_active = true);

CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
TO public
USING (is_active = true);

-- 15. Allow public viewing of virtual rewards
CREATE POLICY "Anyone can view available virtual rewards" 
ON public.virtual_rewards 
FOR SELECT 
TO public
USING (is_available = true);

-- 16. Allow public viewing of adaptive content
CREATE POLICY "Anyone can view active adaptive content" 
ON public.adaptive_content 
FOR SELECT 
TO public
USING (is_active = true);

-- 17. Secure Community Features
CREATE POLICY "Users can view own community stats" 
ON public.user_community_stats 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 18. Secure Speaking Groups
CREATE POLICY "Users can view speaking groups" 
ON public.speaking_groups 
FOR SELECT 
TO authenticated
USING (is_active = true);

CREATE POLICY "Teachers can manage speaking groups" 
ON public.speaking_groups 
FOR ALL 
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Users can manage own group participation" 
ON public.group_participants 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 19. Secure Classroom Sessions
CREATE POLICY "Users can view own classroom sessions" 
ON public.classroom_sessions 
FOR SELECT 
TO authenticated
USING (
  teacher_id = auth.uid() OR 
  student_id = auth.uid() OR
  auth.uid() = ANY(participants)
);

CREATE POLICY "Teachers can manage classroom sessions" 
ON public.classroom_sessions 
FOR ALL 
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- 20. Secure Financial Records
CREATE POLICY "Users can view own lesson payments" 
ON public.lesson_payments 
FOR SELECT 
TO authenticated
USING (
  student_id = auth.uid() OR 
  teacher_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Teachers can view own absences and penalties" 
ON public.teacher_absences 
FOR SELECT 
TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can view own penalties" 
ON public.teacher_penalties 
FOR SELECT 
TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage own withdrawals" 
ON public.teacher_withdrawals 
FOR ALL 
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- 21. Secure Audit Logs (Admin only)
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Add security comments to critical tables
COMMENT ON TABLE public.users IS 'Contains sensitive user data. Access strictly controlled by RLS policies.';
COMMENT ON TABLE public.teacher_profiles IS 'Contains teacher personal and professional data. Public access limited to approved profiles only.';
COMMENT ON TABLE public.student_profiles IS 'Contains student personal data. Private access only.';
COMMENT ON TABLE public.payments IS 'Contains sensitive financial data. Private access only.';
COMMENT ON TABLE public.subscriptions IS 'Contains subscription data. Private access only.';
COMMENT ON TABLE public.lesson_payments IS 'Contains payment transaction data. Access restricted to involved parties and admins.';
COMMENT ON TABLE public.teacher_withdrawals IS 'Contains teacher financial data. Private access only.';
COMMENT ON TABLE public.audit_logs IS 'Contains security audit data. Admin access only.';