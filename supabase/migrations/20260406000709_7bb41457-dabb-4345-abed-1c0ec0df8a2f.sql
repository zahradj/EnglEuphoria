
-- 1. Add hub_specialty column to teacher_availability
ALTER TABLE public.teacher_availability 
ADD COLUMN IF NOT EXISTS hub_specialty TEXT CHECK (hub_specialty IN ('Playground', 'Academy', 'Professional'));

-- 2. Create the appointments table (the booking handshake)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  availability_id UUID REFERENCES public.teacher_availability(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  hub_type TEXT CHECK (hub_type IN ('Playground', 'Academy', 'Professional')),
  lesson_id TEXT,
  meeting_link TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 30,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Students can view their own appointments
CREATE POLICY "Students can view own appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- 5. RLS: Teachers can view their own appointments
CREATE POLICY "Teachers can view own appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());

-- 6. RLS: Students can create appointments (book slots)
CREATE POLICY "Students can create appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- 7. RLS: Students can cancel their own appointments
CREATE POLICY "Students can update own appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (student_id = auth.uid());

-- 8. RLS: Teachers can update appointment status
CREATE POLICY "Teachers can update own appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid());

-- 9. Admins can do everything
CREATE POLICY "Admins full access appointments"
ON public.appointments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Trigger: auto-mark availability as booked when appointment created
CREATE OR REPLACE FUNCTION public.mark_slot_booked_on_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.availability_id IS NOT NULL THEN
    UPDATE public.teacher_availability
    SET is_booked = true, updated_at = now()
    WHERE id = NEW.availability_id AND is_booked = false;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mark_slot_booked
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_slot_booked_on_appointment();

-- 11. Trigger: free slot when appointment cancelled
CREATE OR REPLACE FUNCTION public.free_slot_on_appointment_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.availability_id IS NOT NULL THEN
    UPDATE public.teacher_availability
    SET is_booked = false, updated_at = now()
    WHERE id = NEW.availability_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_free_slot_on_cancel
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.free_slot_on_appointment_cancel();

-- 12. Index for fast availability lookups
CREATE INDEX IF NOT EXISTS idx_teacher_availability_hub ON public.teacher_availability(hub_specialty, is_booked, is_available);
CREATE INDEX IF NOT EXISTS idx_appointments_student ON public.appointments(student_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_teacher ON public.appointments(teacher_id, status);
