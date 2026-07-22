-- Create lesson packages table
CREATE TABLE public.lesson_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lesson_count INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60)),
  total_price NUMERIC(10,2) NOT NULL,
  savings_amount NUMERIC(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student package purchases table
CREATE TABLE public.student_package_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES public.lesson_packages(id),
  lessons_remaining INTEGER NOT NULL,
  total_lessons INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_id TEXT
);

-- Create package lesson redemptions table
CREATE TABLE public.package_lesson_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_purchase_id UUID NOT NULL REFERENCES public.student_package_purchases(id),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id),
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_lesson_redemptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lesson_packages
CREATE POLICY "Anyone can view active packages" ON public.lesson_packages
  FOR SELECT USING (is_active = true);

-- Create RLS policies for student_package_purchases
CREATE POLICY "Students can view their own packages" ON public.student_package_purchases
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own packages" ON public.student_package_purchases
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own packages" ON public.student_package_purchases
  FOR UPDATE USING (auth.uid() = student_id);

-- Create RLS policies for package_lesson_redemptions
CREATE POLICY "Users can view their own redemptions" ON public.package_lesson_redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_package_purchases spp
      WHERE spp.id = package_lesson_redemptions.package_purchase_id
      AND spp.student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = package_lesson_redemptions.lesson_id
      AND (l.teacher_id = auth.uid() OR l.student_id = auth.uid())
    )
  );

CREATE POLICY "Students can create redemptions" ON public.package_lesson_redemptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_package_purchases spp
      WHERE spp.id = package_lesson_redemptions.package_purchase_id
      AND spp.student_id = auth.uid()
    )
  );

-- Insert some sample lesson packages
INSERT INTO public.lesson_packages (name, lesson_count, duration_minutes, total_price, savings_amount) VALUES
('Starter Pack - 30min', 5, 30, 25.00, 5.00),
('Standard Pack - 30min', 10, 30, 45.00, 15.00),
('Premium Pack - 30min', 20, 30, 80.00, 40.00),
('Starter Pack - 60min', 5, 60, 50.00, 10.00),
('Standard Pack - 60min', 10, 60, 90.00, 30.00),
('Premium Pack - 60min', 20, 60, 160.00, 80.00);

-- Update lessons table to include fields needed for package system
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS lesson_price NUMERIC(10,2) DEFAULT 0.00;

-- Create trigger to update lesson_packages updated_at
CREATE OR REPLACE FUNCTION public.update_lesson_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_packages_updated_at
  BEFORE UPDATE ON public.lesson_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_packages_updated_at();