-- Phase 1: Database Structure Enhancement for Revenue Split System

-- Create revenue_splits table to configure platform/teacher percentages
CREATE TABLE public.revenue_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_percentage DECIMAL(5,2) NOT NULL CHECK (teacher_percentage >= 0 AND teacher_percentage <= 100),
  platform_percentage DECIMAL(5,2) NOT NULL CHECK (platform_percentage >= 0 AND platform_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all', -- 'all', 'premium', 'new_teachers', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_percentage_split CHECK ((teacher_percentage + platform_percentage) = 100.00)
);

-- Create teacher_earnings table to track individual lesson payouts
CREATE TABLE public.teacher_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) NOT NULL,
  lesson_id UUID REFERENCES lessons(id) NOT NULL,
  payment_id UUID REFERENCES payments(id),
  revenue_split_id UUID REFERENCES revenue_splits(id),
  gross_amount DECIMAL(10,2) NOT NULL,
  teacher_amount DECIMAL(10,2) NOT NULL,
  platform_amount DECIMAL(10,2) NOT NULL,
  split_percentage DECIMAL(5,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'disputed')) DEFAULT 'pending',
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_amounts CHECK ((teacher_amount + platform_amount) = gross_amount)
);

-- Create teacher_payouts table for managing payment cycles
CREATE TABLE public.teacher_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) NOT NULL,
  payout_period_start TIMESTAMPTZ NOT NULL,
  payout_period_end TIMESTAMPTZ NOT NULL,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing payments table for revenue split tracking
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS teacher_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS revenue_split_id UUID REFERENCES revenue_splits(id);

-- Enable RLS on new tables
ALTER TABLE public.revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revenue_splits (readable by all authenticated users)
CREATE POLICY "revenue_splits_select" ON revenue_splits 
FOR SELECT TO authenticated USING (is_active = true);

-- RLS Policies for teacher_earnings (teachers can only see their own)
CREATE POLICY "teacher_earnings_select" ON teacher_earnings 
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "teacher_earnings_insert" ON teacher_earnings 
FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teacher_earnings_update" ON teacher_earnings 
FOR UPDATE USING (teacher_id = auth.uid());

-- RLS Policies for teacher_payouts (teachers can only see their own)
CREATE POLICY "teacher_payouts_select" ON teacher_payouts 
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "teacher_payouts_insert" ON teacher_payouts 
FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teacher_payouts_update" ON teacher_payouts 
FOR UPDATE USING (teacher_id = auth.uid());

-- Insert default revenue split configuration (€4 teacher / €6 platform = 40%/60%)
INSERT INTO revenue_splits (name, teacher_percentage, platform_percentage, applies_to) VALUES
('Standard Split', 40.00, 60.00, 'all'),
('Premium Teacher Split', 45.00, 55.00, 'premium'),
('New Teacher Split', 35.00, 65.00, 'new_teachers');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_revenue_splits_updated_at
  BEFORE UPDATE ON public.revenue_splits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_earnings_updated_at
  BEFORE UPDATE ON public.teacher_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_payouts_updated_at
  BEFORE UPDATE ON public.teacher_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();