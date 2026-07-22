-- Fix critical data exposure issues - add only missing RLS policies

-- Enable RLS on tables that don't have it (skip if already enabled)
DO $$
BEGIN
    -- Enable RLS on tables that exist and might not have it
    BEGIN
        ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        -- RLS already enabled or table doesn't exist
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.teacher_penalties ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.teacher_absences ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.lesson_payments ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.learning_currency ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.student_learning_streaks ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.virtual_rewards ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.student_reward_purchases ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END
$$;

-- Teacher Withdrawals policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_withdrawals') THEN
        -- Drop existing policies if they exist to avoid conflicts
        DROP POLICY IF EXISTS "Teachers can view own withdrawals" ON public.teacher_withdrawals;
        DROP POLICY IF EXISTS "Teachers can create own withdrawals" ON public.teacher_withdrawals;
        DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON public.teacher_withdrawals;
        
        -- Create new policies
        CREATE POLICY "Teachers can view own withdrawals" ON public.teacher_withdrawals
        FOR SELECT USING (teacher_id = auth.uid());
        
        CREATE POLICY "Teachers can create own withdrawals" ON public.teacher_withdrawals
        FOR INSERT WITH CHECK (teacher_id = auth.uid());
        
        CREATE POLICY "Admins can manage all withdrawals" ON public.teacher_withdrawals
        FOR ALL USING (is_user_admin());
    END IF;
END
$$;

-- Teacher Penalties policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_penalties') THEN
        DROP POLICY IF EXISTS "Teachers can view own penalties" ON public.teacher_penalties;
        DROP POLICY IF EXISTS "Admins can manage all penalties" ON public.teacher_penalties;
        
        CREATE POLICY "Teachers can view own penalties" ON public.teacher_penalties
        FOR SELECT USING (teacher_id = auth.uid());
        
        CREATE POLICY "Admins can manage all penalties" ON public.teacher_penalties
        FOR ALL USING (is_user_admin());
    END IF;
END
$$;

-- Teacher Absences policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_absences') THEN
        DROP POLICY IF EXISTS "Teachers can view own absences" ON public.teacher_absences;
        DROP POLICY IF EXISTS "System can create absences" ON public.teacher_absences;
        DROP POLICY IF EXISTS "Admins can manage all absences" ON public.teacher_absences;
        
        CREATE POLICY "Teachers can view own absences" ON public.teacher_absences
        FOR SELECT USING (teacher_id = auth.uid());
        
        CREATE POLICY "System can create absences" ON public.teacher_absences
        FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Admins can manage all absences" ON public.teacher_absences
        FOR ALL USING (is_user_admin());
    END IF;
END
$$;

-- Lesson Payments policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_payments') THEN
        DROP POLICY IF EXISTS "Students can view own payments" ON public.lesson_payments;
        DROP POLICY IF EXISTS "Teachers can view own payments" ON public.lesson_payments;
        DROP POLICY IF EXISTS "System can create payments" ON public.lesson_payments;
        DROP POLICY IF EXISTS "Admins can manage all payments" ON public.lesson_payments;
        
        CREATE POLICY "Students can view own payments" ON public.lesson_payments
        FOR SELECT USING (student_id = auth.uid());
        
        CREATE POLICY "Teachers can view own payments" ON public.lesson_payments
        FOR SELECT USING (teacher_id = auth.uid());
        
        CREATE POLICY "System can create payments" ON public.lesson_payments
        FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Admins can manage all payments" ON public.lesson_payments
        FOR ALL USING (is_user_admin());
    END IF;
END
$$;

-- Student Profiles policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_profiles') THEN
        DROP POLICY IF EXISTS "Users can view own student profile" ON public.student_profiles;
        DROP POLICY IF EXISTS "Users can create own student profile" ON public.student_profiles;
        DROP POLICY IF EXISTS "Users can update own student profile" ON public.student_profiles;
        DROP POLICY IF EXISTS "Admins can view all student profiles" ON public.student_profiles;
        
        CREATE POLICY "Users can view own student profile" ON public.student_profiles
        FOR SELECT USING (user_id = auth.uid());
        
        CREATE POLICY "Users can create own student profile" ON public.student_profiles
        FOR INSERT WITH CHECK (user_id = auth.uid());
        
        CREATE POLICY "Users can update own student profile" ON public.student_profiles
        FOR UPDATE USING (user_id = auth.uid());
        
        CREATE POLICY "Admins can view all student profiles" ON public.student_profiles
        FOR SELECT USING (is_user_admin());
    END IF;
END
$$;

-- Student XP policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_xp') THEN
        DROP POLICY IF EXISTS "Users can view own XP" ON public.student_xp;
        DROP POLICY IF EXISTS "System can update XP" ON public.student_xp;
        DROP POLICY IF EXISTS "System can modify XP" ON public.student_xp;
        
        CREATE POLICY "Users can view own XP" ON public.student_xp
        FOR SELECT USING (student_id = auth.uid());
        
        CREATE POLICY "System can update XP" ON public.student_xp
        FOR INSERT WITH CHECK (student_id = auth.uid());
        
        CREATE POLICY "System can modify XP" ON public.student_xp
        FOR UPDATE USING (student_id = auth.uid());
    END IF;
END
$$;

-- Learning Currency policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_currency') THEN
        DROP POLICY IF EXISTS "Users can view own currency" ON public.learning_currency;
        DROP POLICY IF EXISTS "System can manage currency" ON public.learning_currency;
        
        CREATE POLICY "Users can view own currency" ON public.learning_currency
        FOR SELECT USING (student_id = auth.uid());
        
        CREATE POLICY "System can manage currency" ON public.learning_currency
        FOR ALL USING (student_id = auth.uid());
    END IF;
END
$$;

-- Student Learning Streaks policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_learning_streaks') THEN
        DROP POLICY IF EXISTS "Users can view own streaks" ON public.student_learning_streaks;
        DROP POLICY IF EXISTS "System can manage streaks" ON public.student_learning_streaks;
        
        CREATE POLICY "Users can view own streaks" ON public.student_learning_streaks
        FOR SELECT USING (student_id = auth.uid());
        
        CREATE POLICY "System can manage streaks" ON public.student_learning_streaks
        FOR ALL USING (student_id = auth.uid());
    END IF;
END
$$;

-- Virtual Rewards policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'virtual_rewards') THEN
        DROP POLICY IF EXISTS "Anyone can view available rewards" ON public.virtual_rewards;
        DROP POLICY IF EXISTS "Admins can manage rewards" ON public.virtual_rewards;
        
        CREATE POLICY "Anyone can view available rewards" ON public.virtual_rewards
        FOR SELECT USING (is_available = true);
        
        CREATE POLICY "Admins can manage rewards" ON public.virtual_rewards
        FOR ALL USING (is_user_admin());
    END IF;
END
$$;

-- Student Reward Purchases policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_reward_purchases') THEN
        DROP POLICY IF EXISTS "Users can view own purchases" ON public.student_reward_purchases;
        DROP POLICY IF EXISTS "Users can make purchases" ON public.student_reward_purchases;
        
        CREATE POLICY "Users can view own purchases" ON public.student_reward_purchases
        FOR SELECT USING (student_id = auth.uid());
        
        CREATE POLICY "Users can make purchases" ON public.student_reward_purchases
        FOR INSERT WITH CHECK (student_id = auth.uid());
    END IF;
END
$$;