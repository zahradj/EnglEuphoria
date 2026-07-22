-- Create parent profiles table
CREATE TABLE public.parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  emergency_contact TEXT,
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student-parent relationships table
CREATE TABLE public.student_parent_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parent_profiles(user_id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('mother', 'father', 'guardian', 'other')),
  is_primary_contact BOOLEAN DEFAULT false,
  can_view_progress BOOLEAN DEFAULT true,
  can_book_lessons BOOLEAN DEFAULT true,
  can_communicate_teachers BOOLEAN DEFAULT true,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

-- Create parent-teacher messages table
CREATE TABLE public.parent_teacher_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.parent_profiles(user_id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('parent', 'teacher')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  parent_email TEXT,
  teacher_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create parent notification preferences table
CREATE TABLE public.parent_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL UNIQUE REFERENCES public.parent_profiles(user_id) ON DELETE CASCADE,
  lesson_reminders BOOLEAN DEFAULT true,
  progress_reports BOOLEAN DEFAULT true,
  homework_notifications BOOLEAN DEFAULT true,
  attendance_alerts BOOLEAN DEFAULT true,
  payment_reminders BOOLEAN DEFAULT true,
  teacher_messages BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_profiles
CREATE POLICY "Parents can view own profile"
  ON public.parent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can update own profile"
  ON public.parent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert own profile"
  ON public.parent_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all parent profiles"
  ON public.parent_profiles FOR ALL
  USING (is_user_admin());

-- RLS Policies for student_parent_relationships
CREATE POLICY "Parents can view their student relationships"
  ON public.student_parent_relationships FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Students can view their parent relationships"
  ON public.student_parent_relationships FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Parents can create relationships"
  ON public.student_parent_relationships FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Admins can manage all relationships"
  ON public.student_parent_relationships FOR ALL
  USING (is_user_admin());

-- RLS Policies for parent_teacher_messages
CREATE POLICY "Parents can view their messages"
  ON public.parent_teacher_messages FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Teachers can view their messages"
  ON public.parent_teacher_messages FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Parents can send messages"
  ON public.parent_teacher_messages FOR INSERT
  WITH CHECK (auth.uid() = parent_id AND sender_type = 'parent');

CREATE POLICY "Teachers can send messages"
  ON public.parent_teacher_messages FOR INSERT
  WITH CHECK (auth.uid() = teacher_id AND sender_type = 'teacher');

CREATE POLICY "Parents can update read status on their messages"
  ON public.parent_teacher_messages FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Teachers can update read status on their messages"
  ON public.parent_teacher_messages FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can manage all messages"
  ON public.parent_teacher_messages FOR ALL
  USING (is_user_admin());

-- RLS Policies for parent_notification_preferences
CREATE POLICY "Parents can manage own notification preferences"
  ON public.parent_notification_preferences FOR ALL
  USING (auth.uid() = parent_id);

-- Create indexes for performance
CREATE INDEX idx_parent_profiles_user_id ON public.parent_profiles(user_id);
CREATE INDEX idx_student_parent_relationships_student ON public.student_parent_relationships(student_id);
CREATE INDEX idx_student_parent_relationships_parent ON public.student_parent_relationships(parent_id);
CREATE INDEX idx_parent_teacher_messages_parent ON public.parent_teacher_messages(parent_id);
CREATE INDEX idx_parent_teacher_messages_teacher ON public.parent_teacher_messages(teacher_id);
CREATE INDEX idx_parent_teacher_messages_student ON public.parent_teacher_messages(student_id);

-- Create trigger for updated_at
CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER update_parent_notification_preferences_updated_at
  BEFORE UPDATE ON public.parent_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Create function to get student progress for parents
CREATE OR REPLACE FUNCTION public.get_student_progress_for_parent(p_parent_id UUID, p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  is_authorized BOOLEAN;
BEGIN
  -- Check if parent is authorized to view this student's data
  SELECT EXISTS (
    SELECT 1 FROM public.student_parent_relationships
    WHERE parent_id = p_parent_id 
      AND student_id = p_student_id 
      AND can_view_progress = true
  ) INTO is_authorized;
  
  IF NOT is_authorized THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  
  -- Gather student progress data
  SELECT jsonb_build_object(
    'total_lessons', (
      SELECT COUNT(*) FROM public.lessons 
      WHERE student_id = p_student_id AND status = 'completed'
    ),
    'upcoming_lessons', (
      SELECT COUNT(*) FROM public.lessons 
      WHERE student_id = p_student_id 
        AND status = 'scheduled' 
        AND scheduled_at >= NOW()
    ),
    'total_xp', COALESCE((
      SELECT total_xp FROM public.student_xp WHERE student_id = p_student_id
    ), 0),
    'current_level', COALESCE((
      SELECT current_level FROM public.student_xp WHERE student_id = p_student_id
    ), 1),
    'achievements_count', (
      SELECT COUNT(*) FROM public.student_achievements WHERE student_id = p_student_id
    ),
    'cefr_level', (
      SELECT cefr_level FROM public.student_profiles WHERE user_id = p_student_id
    ),
    'last_lesson_date', (
      SELECT MAX(completed_at) FROM public.lessons 
      WHERE student_id = p_student_id AND status = 'completed'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;