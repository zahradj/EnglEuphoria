-- Add duration and lesson_type support to teacher_availability
ALTER TABLE public.teacher_availability 
ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS lesson_type TEXT NOT NULL DEFAULT 'free_slot',
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lesson_title TEXT;

-- Add check constraint for valid durations (25 or 55 minutes)
ALTER TABLE public.teacher_availability 
ADD CONSTRAINT valid_duration CHECK (duration IN (25, 55));

-- Add check constraint for valid lesson types
ALTER TABLE public.teacher_availability 
ADD CONSTRAINT valid_lesson_type CHECK (lesson_type IN ('free_slot', 'direct_booking'));

-- Update existing records to have proper duration
UPDATE public.teacher_availability 
SET duration = 30 
WHERE duration IS NULL;

-- Create index for better performance on duration queries
CREATE INDEX IF NOT EXISTS idx_teacher_availability_duration ON public.teacher_availability(duration);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_lesson_type ON public.teacher_availability(lesson_type);