-- Create teacher_availability table for managing teacher time slots that students can book
CREATE TABLE public.teacher_availability (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- Duration in minutes
    is_available BOOLEAN NOT NULL DEFAULT true,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL, -- If booked, reference to the lesson
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Ensure no overlapping time slots for the same teacher on the same date
    CONSTRAINT no_overlapping_slots EXCLUDE USING gist (
        teacher_id WITH =,
        date WITH =,
        tsrange(
            (date + start_time)::timestamp,
            (date + end_time)::timestamp,
            '[)'
        ) WITH &&
    )
);

-- Enable Row Level Security
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher availability
CREATE POLICY "Teachers can view their own availability" 
ON public.teacher_availability 
FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create their own availability slots" 
ON public.teacher_availability 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own availability slots" 
ON public.teacher_availability 
FOR UPDATE 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own availability slots" 
ON public.teacher_availability 
FOR DELETE 
USING (auth.uid() = teacher_id);

-- Students can view available slots from all teachers
CREATE POLICY "Students can view available teacher slots" 
ON public.teacher_availability 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.role = 'student'
    )
    AND is_available = true
    AND date >= CURRENT_DATE
);

-- Create indexes for better performance
CREATE INDEX idx_teacher_availability_teacher_date ON public.teacher_availability(teacher_id, date);
CREATE INDEX idx_teacher_availability_available ON public.teacher_availability(is_available, date) WHERE is_available = true;
CREATE INDEX idx_teacher_availability_date_time ON public.teacher_availability(date, start_time);

-- Create function to update timestamps
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