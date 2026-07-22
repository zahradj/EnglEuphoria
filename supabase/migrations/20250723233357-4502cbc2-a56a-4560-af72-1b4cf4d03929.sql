-- Create teacher availability slots table
CREATE TABLE public.teacher_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  price_per_hour DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  recurring_pattern JSONB DEFAULT NULL, -- For recurring slots
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher availability
CREATE POLICY "Teachers can manage their own availability" 
ON public.teacher_availability 
FOR ALL 
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view available teacher slots" 
ON public.teacher_availability 
FOR SELECT 
USING (is_available = true AND is_booked = false);

-- Create indexes for better performance
CREATE INDEX idx_teacher_availability_teacher_id ON public.teacher_availability(teacher_id);
CREATE INDEX idx_teacher_availability_time_range ON public.teacher_availability(start_time, end_time);
CREATE INDEX idx_teacher_availability_available ON public.teacher_availability(is_available, is_booked);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_teacher_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_teacher_availability_updated_at
BEFORE UPDATE ON public.teacher_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_teacher_availability_updated_at();

-- Create function to automatically mark slot as booked when lesson is created
CREATE OR REPLACE FUNCTION public.book_teacher_slot()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the availability slot if it exists
  UPDATE public.teacher_availability 
  SET 
    is_booked = true,
    lesson_id = NEW.id,
    updated_at = now()
  WHERE teacher_id = NEW.teacher_id 
    AND start_time <= NEW.scheduled_at 
    AND end_time > NEW.scheduled_at
    AND is_available = true 
    AND is_booked = false;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;