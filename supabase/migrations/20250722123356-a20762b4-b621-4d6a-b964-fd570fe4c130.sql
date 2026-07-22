
-- Extend lessons table with payment tracking fields
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS student_charged_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS teacher_payout_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS platform_profit_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT CHECK (cancellation_reason IN ('teacher_absent', 'technical_problem', 'student_cancelled', 'mutual_agreement')),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create teacher penalties tracking table
CREATE TABLE IF NOT EXISTS public.teacher_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  lesson_id UUID REFERENCES public.lessons(id),
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('no_show', 'technical_failure', 'repeated_absence')),
  penalty_amount DECIMAL(10,2) DEFAULT 0.00,
  penalty_date TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lesson payments tracking table
CREATE TABLE IF NOT EXISTS public.lesson_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  amount_charged DECIMAL(10,2) NOT NULL,
  teacher_payout DECIMAL(10,2) NOT NULL,
  platform_profit DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'stripe',
  stripe_payment_intent_id TEXT,
  refund_amount DECIMAL(10,2) DEFAULT 0.00,
  refund_reason TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teacher absence tracking table
CREATE TABLE IF NOT EXISTS public.teacher_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  lesson_id UUID REFERENCES public.lessons(id),
  absence_date TIMESTAMPTZ NOT NULL,
  absence_type TEXT NOT NULL CHECK (absence_type IN ('no_show', 'technical_failure', 'late_cancellation')),
  penalty_applied BOOLEAN DEFAULT false,
  warning_given BOOLEAN DEFAULT false,
  suspension_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.teacher_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_absences ENABLE ROW LEVEL SECURITY;

-- RLS policies for teacher_penalties
CREATE POLICY "Teachers can view their own penalties" ON teacher_penalties 
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "System can insert penalties" ON teacher_penalties 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage penalties" ON teacher_penalties 
FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for lesson_payments
CREATE POLICY "Users can view their own payments" ON lesson_payments 
FOR SELECT USING (student_id = auth.uid() OR teacher_id = auth.uid());

CREATE POLICY "System can insert payments" ON lesson_payments 
FOR INSERT WITH CHECK (student_id = auth.uid() OR teacher_id = auth.uid());

CREATE POLICY "System can update payments" ON lesson_payments 
FOR UPDATE USING (true);

-- RLS policies for teacher_absences
CREATE POLICY "Teachers can view their own absences" ON teacher_absences 
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "System can insert absences" ON teacher_absences 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage absences" ON teacher_absences 
FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Function to process lesson completion and payments
CREATE OR REPLACE FUNCTION public.process_lesson_completion(
  lesson_uuid UUID,
  lesson_status TEXT,
  failure_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lesson_record RECORD;
  payment_result JSONB;
  student_charge DECIMAL(10,2) := 10.00; -- €10 per lesson
  teacher_payout DECIMAL(10,2) := 4.00;  -- €4 per lesson
  platform_profit DECIMAL(10,2) := 6.00; -- €6 per lesson
BEGIN
  -- Get lesson details
  SELECT * INTO lesson_record FROM public.lessons WHERE id = lesson_uuid;
  
  IF lesson_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lesson not found');
  END IF;
  
  -- Process based on lesson completion status
  IF lesson_status = 'completed' THEN
    -- Successful completion - charge student and pay teacher
    UPDATE public.lessons SET 
      status = 'completed',
      completed_at = NOW(),
      payment_status = 'paid',
      student_charged_amount = student_charge,
      teacher_payout_amount = teacher_payout,
      platform_profit_amount = platform_profit
    WHERE id = lesson_uuid;
    
    -- Create payment record
    INSERT INTO public.lesson_payments (
      lesson_id, student_id, teacher_id, amount_charged, 
      teacher_payout, platform_profit
    ) VALUES (
      lesson_uuid, lesson_record.student_id, lesson_record.teacher_id,
      student_charge, teacher_payout, platform_profit
    );
    
    payment_result := jsonb_build_object(
      'success', true, 
      'student_charged', student_charge,
      'teacher_paid', teacher_payout,
      'status', 'completed'
    );
    
  ELSE
    -- Failed lesson - no charges, record absence/failure
    UPDATE public.lessons SET 
      status = 'cancelled',
      payment_status = 'cancelled',
      cancellation_reason = failure_reason,
      student_charged_amount = 0.00,
      teacher_payout_amount = 0.00,
      platform_profit_amount = 0.00
    WHERE id = lesson_uuid;
    
    -- Record teacher absence/failure
    INSERT INTO public.teacher_absences (
      teacher_id, lesson_id, absence_date, absence_type
    ) VALUES (
      lesson_record.teacher_id, lesson_uuid, NOW(), failure_reason
    );
    
    -- Check for penalty application
    PERFORM public.check_teacher_penalties(lesson_record.teacher_id);
    
    payment_result := jsonb_build_object(
      'success', true,
      'student_charged', 0.00,
      'teacher_paid', 0.00,
      'status', 'cancelled',
      'reason', failure_reason
    );
  END IF;
  
  RETURN payment_result;
END;
$$;

-- Function to check and apply teacher penalties
CREATE OR REPLACE FUNCTION public.check_teacher_penalties(teacher_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  absence_count INTEGER;
  recent_absences INTEGER;
BEGIN
  -- Count absences in the last 30 days
  SELECT COUNT(*) INTO recent_absences
  FROM public.teacher_absences
  WHERE teacher_id = teacher_uuid 
    AND absence_date >= NOW() - INTERVAL '30 days';
  
  -- Apply penalties based on absence count
  IF recent_absences = 1 THEN
    -- First absence - warning only
    INSERT INTO public.teacher_penalties (teacher_id, penalty_type, penalty_amount, notes)
    VALUES (teacher_uuid, 'no_show', 0.00, '1st absence - Warning issued');
    
  ELSIF recent_absences = 2 THEN
    -- Second absence - €10 penalty
    INSERT INTO public.teacher_penalties (teacher_id, penalty_type, penalty_amount, notes)
    VALUES (teacher_uuid, 'repeated_absence', 10.00, '2nd absence in 30 days - €10 penalty');
    
  ELSIF recent_absences >= 3 THEN
    -- Third+ absence - suspension
    INSERT INTO public.teacher_penalties (teacher_id, penalty_type, penalty_amount, notes)
    VALUES (teacher_uuid, 'repeated_absence', 0.00, '3rd+ absence in 30 days - Account suspended');
    
    -- Update teacher profile to suspend account
    UPDATE public.teacher_profiles 
    SET can_teach = false, suspension_reason = 'Multiple absences'
    WHERE user_id = teacher_uuid;
  END IF;
END;
$$;

-- Function to get student lesson statistics
CREATE OR REPLACE FUNCTION public.get_student_lesson_stats(student_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_booked INTEGER;
  completed_paid INTEGER;
  cancelled_free INTEGER;
  total_spent DECIMAL(10,2);
  total_refunded DECIMAL(10,2);
BEGIN
  -- Get lesson statistics
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('scheduled', 'completed', 'cancelled')),
    COUNT(*) FILTER (WHERE status = 'completed' AND payment_status = 'paid'),
    COUNT(*) FILTER (WHERE status = 'cancelled' AND payment_status = 'cancelled')
  INTO total_booked, completed_paid, cancelled_free
  FROM public.lessons
  WHERE student_id = student_uuid;
  
  -- Get spending totals
  SELECT 
    COALESCE(SUM(amount_charged), 0.00),
    COALESCE(SUM(refund_amount), 0.00)
  INTO total_spent, total_refunded
  FROM public.lesson_payments
  WHERE student_id = student_uuid;
  
  RETURN jsonb_build_object(
    'total_booked', COALESCE(total_booked, 0),
    'completed_paid', COALESCE(completed_paid, 0),
    'cancelled_free', COALESCE(cancelled_free, 0),
    'total_spent', total_spent,
    'total_refunded', total_refunded
  );
END;
$$;

-- Function to get teacher earnings and penalties
CREATE OR REPLACE FUNCTION public.get_teacher_earnings_summary(teacher_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_earned DECIMAL(10,2);
  lessons_completed INTEGER;
  pending_penalties DECIMAL(10,2);
  absence_count INTEGER;
  can_teach_status BOOLEAN;
BEGIN
  -- Get earnings
  SELECT 
    COALESCE(SUM(teacher_payout), 0.00),
    COUNT(*)
  INTO total_earned, lessons_completed
  FROM public.lesson_payments
  WHERE teacher_id = teacher_uuid;
  
  -- Get penalties
  SELECT COALESCE(SUM(penalty_amount), 0.00)
  INTO pending_penalties
  FROM public.teacher_penalties
  WHERE teacher_id = teacher_uuid AND resolved = false;
  
  -- Get recent absences
  SELECT COUNT(*)
  INTO absence_count
  FROM public.teacher_absences
  WHERE teacher_id = teacher_uuid 
    AND absence_date >= NOW() - INTERVAL '30 days';
    
  -- Check teaching status
  SELECT COALESCE(can_teach, true)
  INTO can_teach_status
  FROM public.teacher_profiles
  WHERE user_id = teacher_uuid;
  
  RETURN jsonb_build_object(
    'total_earned', total_earned,
    'lessons_completed', lessons_completed,
    'pending_penalties', pending_penalties,
    'recent_absences', absence_count,
    'can_teach', can_teach_status,
    'net_earnings', total_earned - pending_penalties
  );
END;
$$;
