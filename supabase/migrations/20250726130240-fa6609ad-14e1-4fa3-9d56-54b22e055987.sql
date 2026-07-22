-- Update lessons table for new pricing structure
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS lesson_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS booking_cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_policy_violated BOOLEAN DEFAULT false;

-- Create lesson packages table
CREATE TABLE IF NOT EXISTS public.lesson_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lesson_count INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  savings_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create student package purchases table
CREATE TABLE IF NOT EXISTS public.student_package_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  package_id UUID REFERENCES public.lesson_packages(id),
  lessons_remaining INTEGER NOT NULL,
  total_lessons INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create package lesson redemptions table  
CREATE TABLE IF NOT EXISTS public.package_lesson_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_purchase_id UUID REFERENCES public.student_package_purchases(id),
  lesson_id UUID REFERENCES public.lessons(id),
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Create teacher penalties table
CREATE TABLE IF NOT EXISTS public.teacher_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id),
  penalty_type TEXT NOT NULL, -- 'no_show', 'technical_issues', 'late_cancellation'
  amount_deducted DECIMAL(10,2) DEFAULT 0.00,
  reason TEXT,
  resolved BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create teacher absences table (for tracking violations)
CREATE TABLE IF NOT EXISTS public.teacher_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id),
  absence_date TIMESTAMPTZ DEFAULT now(),
  absence_type TEXT NOT NULL, -- 'no_show', 'technical_failure', 'emergency'
  student_refunded BOOLEAN DEFAULT false,
  penalty_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create lesson payments table for detailed tracking
CREATE TABLE IF NOT EXISTS public.lesson_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id),
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  amount_charged DECIMAL(10,2) NOT NULL,
  teacher_payout DECIMAL(10,2) NOT NULL,
  platform_profit DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_gateway_id TEXT,
  refund_amount DECIMAL(10,2) DEFAULT 0.00,
  refund_reason TEXT,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_lesson_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_packages
CREATE POLICY "Everyone can view active packages" ON public.lesson_packages
  FOR SELECT USING (is_active = true);

-- RLS Policies for student_package_purchases
CREATE POLICY "Students can view their own packages" ON public.student_package_purchases
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can purchase packages" ON public.student_package_purchases
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their packages" ON public.student_package_purchases
  FOR UPDATE USING (student_id = auth.uid());

-- RLS Policies for package_lesson_redemptions
CREATE POLICY "Users can view their package redemptions" ON public.package_lesson_redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_package_purchases spp
      WHERE spp.id = package_lesson_redemptions.package_purchase_id
      AND spp.student_id = auth.uid()
    )
  );

CREATE POLICY "System can create redemptions" ON public.package_lesson_redemptions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for teacher_penalties
CREATE POLICY "Teachers can view their own penalties" ON public.teacher_penalties
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "System can insert penalties" ON public.teacher_penalties
  FOR INSERT WITH CHECK (true);

-- RLS Policies for teacher_absences  
CREATE POLICY "Teachers can view their own absences" ON public.teacher_absences
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "System can insert absences" ON public.teacher_absences
  FOR INSERT WITH CHECK (true);

-- RLS Policies for lesson_payments
CREATE POLICY "Users can view their own lesson payments" ON public.lesson_payments
  FOR SELECT USING (student_id = auth.uid() OR teacher_id = auth.uid());

CREATE POLICY "System can insert payments" ON public.lesson_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON public.lesson_payments
  FOR UPDATE USING (true);

-- Insert default lesson packages
INSERT INTO public.lesson_packages (name, lesson_count, duration_minutes, total_price, savings_amount) VALUES
('5 x 30-min lessons', 5, 30, 28.00, 2.00),
('10 x 30-min lessons', 10, 30, 55.00, 5.00),
('5 x 60-min lessons', 5, 60, 55.00, 5.00),
('10 x 60-min lessons', 10, 60, 110.00, 10.00)
ON CONFLICT DO NOTHING;