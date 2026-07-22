-- Fix critical data exposure issues by implementing proper RLS policies

-- Enable RLS on all tables that don't have it yet
ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reward_purchases ENABLE ROW LEVEL SECURITY;

-- Teacher Withdrawals - Teachers can only see their own withdrawals
CREATE POLICY "Teachers can view own withdrawals" ON public.teacher_withdrawals
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create own withdrawals" ON public.teacher_withdrawals
FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all withdrawals" ON public.teacher_withdrawals
FOR ALL USING (is_user_admin());

-- Teacher Penalties - Teachers can view their own, admins manage all
CREATE POLICY "Teachers can view own penalties" ON public.teacher_penalties
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all penalties" ON public.teacher_penalties
FOR ALL USING (is_user_admin());

-- Teacher Absences - Teachers can view their own, admins manage all
CREATE POLICY "Teachers can view own absences" ON public.teacher_absences
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "System can create absences" ON public.teacher_absences
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all absences" ON public.teacher_absences
FOR ALL USING (is_user_admin());

-- Lesson Payments - Participants can view their own payments
CREATE POLICY "Students can view own payments" ON public.lesson_payments
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view own payments" ON public.lesson_payments
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "System can create payments" ON public.lesson_payments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all payments" ON public.lesson_payments
FOR ALL USING (is_user_admin());

-- Student Profiles - Users can manage their own profiles
CREATE POLICY "Users can view own student profile" ON public.student_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own student profile" ON public.student_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own student profile" ON public.student_profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all student profiles" ON public.student_profiles
FOR SELECT USING (is_user_admin());

-- Teacher Profiles - Teachers can manage their own, everyone can view approved profiles
CREATE POLICY "Anyone can view approved teacher profiles" ON public.teacher_profiles
FOR SELECT USING (profile_complete = true AND can_teach = true);

CREATE POLICY "Teachers can manage own profile" ON public.teacher_profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all teacher profiles" ON public.teacher_profiles
FOR ALL USING (is_user_admin());

-- Speaking Practice Sessions - Users can only see their own sessions
CREATE POLICY "Users can manage own speaking sessions" ON public.speaking_practice_sessions
FOR ALL USING (student_id = auth.uid());

-- Student XP - Users can view their own XP
CREATE POLICY "Users can view own XP" ON public.student_xp
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "System can update XP" ON public.student_xp
FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "System can modify XP" ON public.student_xp
FOR UPDATE USING (student_id = auth.uid());

-- Learning Currency - Users can view their own currency
CREATE POLICY "Users can view own currency" ON public.learning_currency
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "System can manage currency" ON public.learning_currency
FOR ALL USING (student_id = auth.uid());

-- Student Learning Streaks - Users can view their own streaks
CREATE POLICY "Users can view own streaks" ON public.student_learning_streaks
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "System can manage streaks" ON public.student_learning_streaks
FOR ALL USING (student_id = auth.uid());

-- Virtual Rewards - Anyone can view available rewards
CREATE POLICY "Anyone can view available rewards" ON public.virtual_rewards
FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage rewards" ON public.virtual_rewards
FOR ALL USING (is_user_admin());

-- Student Reward Purchases - Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON public.student_reward_purchases
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Users can make purchases" ON public.student_reward_purchases
FOR INSERT WITH CHECK (student_id = auth.uid());

-- Create security audit triggers for all sensitive tables
CREATE TRIGGER teacher_withdrawals_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

CREATE TRIGGER teacher_penalties_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_penalties
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

CREATE TRIGGER lesson_payments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.lesson_payments
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

CREATE TRIGGER student_profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

CREATE TRIGGER teacher_profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();