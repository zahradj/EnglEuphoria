
-- Staff Contracts table
CREATE TABLE public.staff_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL DEFAULT 'employment',
  base_rate_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  bonus_structure JSONB DEFAULT '{}',
  contract_status TEXT NOT NULL DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  contract_pdf_url TEXT,
  teacher_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all contracts"
ON public.staff_contracts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view own contracts"
ON public.staff_contracts FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

-- Payroll Records table
CREATE TABLE public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_name TEXT,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  total_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  base_pay NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, month, year)
);

ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all payroll"
ON public.payroll_records FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view own payroll"
ON public.payroll_records FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

-- Triggers for updated_at
CREATE TRIGGER update_staff_contracts_updated_at
BEFORE UPDATE ON public.staff_contracts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_records_updated_at
BEFORE UPDATE ON public.payroll_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for contracts
INSERT INTO storage.buckets (id, name, public) VALUES ('staff_contracts', 'staff_contracts', false);

CREATE POLICY "Admins can manage contract files"
ON storage.objects FOR ALL
USING (bucket_id = 'staff_contracts' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'staff_contracts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view own contract files"
ON storage.objects FOR SELECT
USING (bucket_id = 'staff_contracts' AND auth.uid()::text = (storage.foldername(name))[1]);
