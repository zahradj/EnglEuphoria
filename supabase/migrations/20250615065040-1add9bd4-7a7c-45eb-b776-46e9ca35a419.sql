
-- Phase 1: Database Enhancement for Lesson Scheduling System

-- Add room_id and room_link columns to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS room_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS room_link TEXT;

-- Create function to generate unique room IDs
CREATE OR REPLACE FUNCTION public.generate_room_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'room-' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate room_id when lesson is created
CREATE OR REPLACE FUNCTION public.set_lesson_room_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.room_id IS NULL THEN
    NEW.room_id := public.generate_room_id();
  END IF;
  
  IF NEW.room_link IS NULL THEN
    NEW.room_link := 'https://engleuphoria.lovable.app/oneonone-classroom-new?roomId=' || NEW.room_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_room_id_trigger ON public.lessons;
CREATE TRIGGER set_room_id_trigger
  BEFORE INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lesson_room_id();

-- Create lesson_participants table for tracking joins
CREATE TABLE IF NOT EXISTS public.lesson_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  UNIQUE(lesson_id, user_id)
);

-- Enable RLS for lesson_participants
ALTER TABLE public.lesson_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson_participants
CREATE POLICY "Users can view their own lesson participations" 
  ON public.lesson_participants 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own lesson participations" 
  ON public.lesson_participants 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own lesson participations" 
  ON public.lesson_participants 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_room_id ON public.lessons(room_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_scheduled ON public.lessons(teacher_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_lessons_student_scheduled ON public.lessons(student_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_lesson_participants_lesson ON public.lesson_participants(lesson_id);

-- Function to get upcoming lessons for a teacher
CREATE OR REPLACE FUNCTION public.get_teacher_upcoming_lessons(teacher_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_at TIMESTAMPTZ,
  duration INTEGER,
  room_id TEXT,
  room_link TEXT,
  status TEXT,
  student_name TEXT,
  student_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.scheduled_at,
    l.duration,
    l.room_id,
    l.room_link,
    l.status,
    u.full_name as student_name,
    l.student_id
  FROM public.lessons l
  LEFT JOIN public.users u ON l.student_id = u.id
  WHERE l.teacher_id = teacher_uuid
    AND l.scheduled_at >= NOW()
    AND l.status IN ('scheduled', 'confirmed')
  ORDER BY l.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming lessons for a student
CREATE OR REPLACE FUNCTION public.get_student_upcoming_lessons(student_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_at TIMESTAMPTZ,
  duration INTEGER,
  room_id TEXT,
  room_link TEXT,
  status TEXT,
  teacher_name TEXT,
  teacher_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.scheduled_at,
    l.duration,
    l.room_id,
    l.room_link,
    l.status,
    u.full_name as teacher_name,
    l.teacher_id
  FROM public.lessons l
  LEFT JOIN public.users u ON l.teacher_id = u.id
  WHERE l.student_id = student_uuid
    AND l.scheduled_at >= NOW()
    AND l.status IN ('scheduled', 'confirmed')
  ORDER BY l.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate lesson access
CREATE OR REPLACE FUNCTION public.can_access_lesson(
  room_uuid TEXT,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  lesson_record RECORD;
  current_time TIMESTAMPTZ := NOW();
BEGIN
  -- Find the lesson by room_id
  SELECT * INTO lesson_record
  FROM public.lessons
  WHERE room_id = room_uuid;
  
  -- Return false if lesson doesn't exist
  IF lesson_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is the teacher or student for this lesson
  IF lesson_record.teacher_id = user_uuid OR lesson_record.student_id = user_uuid THEN
    -- Allow access 10 minutes before scheduled time and up to 2 hours after
    IF current_time >= (lesson_record.scheduled_at - INTERVAL '10 minutes') 
       AND current_time <= (lesson_record.scheduled_at + INTERVAL '2 hours') THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
