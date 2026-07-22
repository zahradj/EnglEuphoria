-- Create tracks table (curriculum organization by system)
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  target_system VARCHAR(20) NOT NULL CHECK (target_system IN ('kids', 'teen', 'adult')),
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add track_id to existing curriculum_levels table
ALTER TABLE public.curriculum_levels 
ADD COLUMN IF NOT EXISTS track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Rename level_order to sequence_order if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'curriculum_levels' AND column_name = 'level_order') THEN
    UPDATE public.curriculum_levels SET sequence_order = level_order WHERE sequence_order IS NULL OR sequence_order = 0;
  END IF;
END $$;

-- Add level_id and sequence_order to curriculum_lessons
ALTER TABLE public.curriculum_lessons 
ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES public.curriculum_levels(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 0;

-- Create library_assets table (shared materials)
CREATE TABLE IF NOT EXISTS public.library_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('pdf', 'video', 'audio', 'interactive_quiz', 'image', 'document', 'presentation')),
  thumbnail_url TEXT,
  min_age INTEGER,
  max_age INTEGER,
  system_tag VARCHAR(20) NOT NULL CHECK (system_tag IN ('kids', 'teen', 'adult', 'all')),
  is_teacher_only BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lesson_materials junction table
CREATE TABLE IF NOT EXISTS public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.library_assets(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_id, asset_id)
);

-- Create student_lesson_progress table
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent_seconds INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create system_transitions audit table
CREATE TABLE IF NOT EXISTS public.system_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_system VARCHAR(20),
  to_system VARCHAR(20) NOT NULL CHECK (to_system IN ('kids', 'teen', 'adult')),
  trigger_reason VARCHAR(100) NOT NULL CHECK (trigger_reason IN ('age_limit_reached', 'course_completed', 'manual_override', 'placement_test')),
  triggered_by UUID REFERENCES public.users(id),
  metadata JSONB DEFAULT '{}',
  transition_date TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracks
CREATE POLICY "Published tracks are viewable by everyone" ON public.tracks
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all tracks" ON public.tracks
  FOR ALL USING (public.is_admin());

CREATE POLICY "Teachers can view all tracks" ON public.tracks
  FOR SELECT USING (public.is_user_teacher());

-- RLS Policies for library_assets
CREATE POLICY "Students can view non-teacher assets" ON public.library_assets
  FOR SELECT USING (is_teacher_only = false);

CREATE POLICY "Teachers can view all assets" ON public.library_assets
  FOR SELECT USING (public.is_user_teacher());

CREATE POLICY "Admins can manage all assets" ON public.library_assets
  FOR ALL USING (public.is_admin());

-- RLS Policies for lesson_materials
CREATE POLICY "Everyone can view lesson materials" ON public.lesson_materials
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage lesson materials" ON public.lesson_materials
  FOR ALL USING (public.is_admin());

-- RLS Policies for student_lesson_progress
CREATE POLICY "Students can view own progress" ON public.student_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can manage own progress" ON public.student_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all progress" ON public.student_lesson_progress
  FOR SELECT USING (public.is_user_teacher());

CREATE POLICY "Admins can manage all progress" ON public.student_lesson_progress
  FOR ALL USING (public.is_admin());

-- RLS Policies for system_transitions
CREATE POLICY "Users can view own transitions" ON public.system_transitions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transitions" ON public.system_transitions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Teachers can view all transitions" ON public.system_transitions
  FOR SELECT USING (public.is_user_teacher());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_target_system ON public.tracks(target_system);
CREATE INDEX IF NOT EXISTS idx_curriculum_levels_track_id ON public.curriculum_levels(track_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_level_id ON public.curriculum_lessons(level_id);
CREATE INDEX IF NOT EXISTS idx_library_assets_system_tag ON public.library_assets(system_tag);
CREATE INDEX IF NOT EXISTS idx_library_assets_file_type ON public.library_assets(file_type);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON public.lesson_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_asset_id ON public.lesson_materials(asset_id);
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_user_id ON public.student_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_lesson_id ON public.student_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_system_transitions_user_id ON public.system_transitions(user_id);

-- Update timestamp triggers
DROP TRIGGER IF EXISTS update_tracks_updated_at ON public.tracks;
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_lesson_progress_timestamp();

DROP TRIGGER IF EXISTS update_library_assets_updated_at ON public.library_assets;
CREATE TRIGGER update_library_assets_updated_at BEFORE UPDATE ON public.library_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_lesson_progress_timestamp();

DROP TRIGGER IF EXISTS update_student_lesson_progress_updated_at ON public.student_lesson_progress;
CREATE TRIGGER update_student_lesson_progress_updated_at BEFORE UPDATE ON public.student_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_lesson_progress_timestamp();