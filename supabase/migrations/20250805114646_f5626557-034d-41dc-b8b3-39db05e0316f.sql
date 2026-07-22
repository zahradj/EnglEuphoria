-- Create teacher withdrawals table
CREATE TABLE public.teacher_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payoneer_account_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teacher_withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher withdrawals
CREATE POLICY "Teachers can view their own withdrawals" 
ON public.teacher_withdrawals 
FOR SELECT 
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create their own withdrawals" 
ON public.teacher_withdrawals 
FOR INSERT 
WITH CHECK (teacher_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_teacher_withdrawals_updated_at
BEFORE UPDATE ON public.teacher_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get teacher available balance
CREATE OR REPLACE FUNCTION public.get_teacher_available_balance(teacher_uuid uuid)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_earned DECIMAL(10,2);
  pending_withdrawals DECIMAL(10,2);
  completed_withdrawals DECIMAL(10,2);
  available_balance DECIMAL(10,2);
BEGIN
  -- Get total earnings
  SELECT COALESCE(SUM(teacher_amount), 0.00)
  INTO total_earned
  FROM public.teacher_earnings
  WHERE teacher_id = teacher_uuid AND status = 'paid';
  
  -- Get pending withdrawals
  SELECT COALESCE(SUM(amount), 0.00)
  INTO pending_withdrawals
  FROM public.teacher_withdrawals
  WHERE teacher_id = teacher_uuid AND status IN ('pending', 'approved');
  
  -- Get completed withdrawals
  SELECT COALESCE(SUM(amount), 0.00)
  INTO completed_withdrawals
  FROM public.teacher_withdrawals
  WHERE teacher_id = teacher_uuid AND status = 'completed';
  
  available_balance := total_earned - pending_withdrawals - completed_withdrawals;
  
  RETURN GREATEST(available_balance, 0.00);
END;
$$;