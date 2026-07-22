-- ================================
-- PHASE 1: ECA DATABASE SCHEMA
-- Engleuphoria Curriculum Architect Tables
-- ================================

-- 1. CURRICULUM PROGRAMS (Annual/Term Curricula)
CREATE TABLE public.curriculum_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  program_type TEXT NOT NULL CHECK (program_type IN ('annual', 'term', 'semester', 'custom')),
  age_group TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL DEFAULT 36,
  target_students TEXT,
  learning_goals TEXT[],
  assessment_strategy TEXT,
  materials_overview TEXT,
  program_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users(id),
  is_published BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CURRICULUM UNITS (Unit Plans)
CREATE TABLE public.curriculum_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.curriculum_programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  unit_number INTEGER NOT NULL,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  age_group TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  learning_objectives TEXT[] NOT NULL,
  grammar_focus TEXT[],
  vocabulary_themes TEXT[],
  skills_focus TEXT[], -- speaking, listening, reading, writing
  assessment_methods TEXT[],
  unit_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, unit_number)
);

-- 3. UNIT-LESSON RELATIONSHIPS (Link units to systematic lessons)
CREATE TABLE public.unit_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.systematic_lessons(id) ON DELETE CASCADE,
  lesson_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, lesson_id),
  UNIQUE(unit_id, lesson_order)
);

-- 4. ASSESSMENTS (Tests, Quizzes, Exams)
CREATE TABLE public.eca_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('placement', 'diagnostic', 'formative', 'summative', 'quiz', 'test', 'exam', 'project')),
  age_group TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  duration_minutes INTEGER,
  total_points INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 70,
  skills_assessed TEXT[], -- speaking, listening, reading, writing, grammar, vocabulary
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT,
  assessment_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users(id),
  is_published BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ASSESSMENT RUBRICS (Grading Criteria)
CREATE TABLE public.assessment_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.eca_assessments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rubric_type TEXT NOT NULL CHECK (rubric_type IN ('holistic', 'analytic', 'checklist', 'single_point')),
  criteria JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{criterion, levels: [{score, descriptor}]}]
  max_score INTEGER NOT NULL,
  rubric_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEARNING MISSIONS (Gamified Quest Chains)
CREATE TABLE public.learning_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('quest', 'challenge', 'project', 'campaign', 'daily', 'weekly')),
  age_group TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  duration_minutes INTEGER,
  xp_reward INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  badge_reward TEXT,
  prerequisites TEXT[], -- prerequisite mission IDs
  learning_objectives TEXT[],
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{task, type, points, validation}]
  mission_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MISSION-LESSON RELATIONSHIPS (Link missions to lessons)
CREATE TABLE public.mission_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.learning_missions(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.systematic_lessons(id) ON DELETE CASCADE,
  task_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mission_id, lesson_id),
  UNIQUE(mission_id, task_order)
);

-- 8. RESOURCE LIBRARY (Worksheets, Texts, Scripts, Materials)
CREATE TABLE public.resource_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('worksheet', 'reading_text', 'listening_script', 'flashcard_set', 'game', 'activity', 'presentation', 'video', 'audio', 'image', 'document')),
  age_group TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  skills TEXT[], -- reading, writing, speaking, listening, grammar, vocabulary
  topics TEXT[],
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  content_data JSONB DEFAULT '{}'::jsonb, -- actual content for generated resources
  created_by UUID REFERENCES public.users(id),
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ECA TEMPLATES (Reusable Curriculum Templates)
CREATE TABLE public.eca_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('curriculum', 'unit', 'lesson', 'assessment', 'mission', 'resource')),
  description TEXT,
  age_group TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  category TEXT, -- grammar, vocabulary, speaking, writing, etc.
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX idx_curriculum_programs_age_cefr ON public.curriculum_programs(age_group, cefr_level);
CREATE INDEX idx_curriculum_programs_created_by ON public.curriculum_programs(created_by);
CREATE INDEX idx_curriculum_programs_published ON public.curriculum_programs(is_published);

CREATE INDEX idx_curriculum_units_program ON public.curriculum_units(program_id);
CREATE INDEX idx_curriculum_units_age_cefr ON public.curriculum_units(age_group, cefr_level);
CREATE INDEX idx_curriculum_units_published ON public.curriculum_units(is_published);

CREATE INDEX idx_unit_lessons_unit ON public.unit_lessons(unit_id);
CREATE INDEX idx_unit_lessons_lesson ON public.unit_lessons(lesson_id);

CREATE INDEX idx_eca_assessments_age_cefr ON public.eca_assessments(age_group, cefr_level);
CREATE INDEX idx_eca_assessments_type ON public.eca_assessments(assessment_type);
CREATE INDEX idx_eca_assessments_published ON public.eca_assessments(is_published);

CREATE INDEX idx_assessment_rubrics_assessment ON public.assessment_rubrics(assessment_id);

CREATE INDEX idx_learning_missions_age_cefr ON public.learning_missions(age_group, cefr_level);
CREATE INDEX idx_learning_missions_type ON public.learning_missions(mission_type);
CREATE INDEX idx_learning_missions_active ON public.learning_missions(is_active);

CREATE INDEX idx_mission_lessons_mission ON public.mission_lessons(mission_id);
CREATE INDEX idx_mission_lessons_lesson ON public.mission_lessons(lesson_id);

CREATE INDEX idx_resource_library_type ON public.resource_library(resource_type);
CREATE INDEX idx_resource_library_age_cefr ON public.resource_library(age_group, cefr_level);
CREATE INDEX idx_resource_library_public ON public.resource_library(is_public);

CREATE INDEX idx_eca_templates_type ON public.eca_templates(template_type);
CREATE INDEX idx_eca_templates_age_cefr ON public.eca_templates(age_group, cefr_level);
CREATE INDEX idx_eca_templates_active ON public.eca_templates(is_active);

-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- CURRICULUM PROGRAMS
ALTER TABLE public.curriculum_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all programs"
  ON public.curriculum_programs FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view all published programs"
  ON public.curriculum_programs FOR SELECT
  USING (is_published = true OR created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can create programs"
  ON public.curriculum_programs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update own programs"
  ON public.curriculum_programs FOR UPDATE
  USING (created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can delete own programs"
  ON public.curriculum_programs FOR DELETE
  USING (created_by = auth.uid() OR is_user_admin());

-- CURRICULUM UNITS
ALTER TABLE public.curriculum_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all units"
  ON public.curriculum_units FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view all published units"
  ON public.curriculum_units FOR SELECT
  USING (is_published = true OR created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can create units"
  ON public.curriculum_units FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update own units"
  ON public.curriculum_units FOR UPDATE
  USING (created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can delete own units"
  ON public.curriculum_units FOR DELETE
  USING (created_by = auth.uid() OR is_user_admin());

-- UNIT LESSONS
ALTER TABLE public.unit_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage unit lessons"
  ON public.unit_lessons FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view unit lessons"
  ON public.unit_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_units
      WHERE id = unit_lessons.unit_id
      AND (is_published = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage own unit lessons"
  ON public.unit_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_units
      WHERE id = unit_lessons.unit_id AND created_by = auth.uid()
    )
  );

-- ECA ASSESSMENTS
ALTER TABLE public.eca_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all assessments"
  ON public.eca_assessments FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view all published assessments"
  ON public.eca_assessments FOR SELECT
  USING (is_published = true OR created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can create assessments"
  ON public.eca_assessments FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update own assessments"
  ON public.eca_assessments FOR UPDATE
  USING (created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can delete own assessments"
  ON public.eca_assessments FOR DELETE
  USING (created_by = auth.uid() OR is_user_admin());

-- ASSESSMENT RUBRICS
ALTER TABLE public.assessment_rubrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all rubrics"
  ON public.assessment_rubrics FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view rubrics for accessible assessments"
  ON public.assessment_rubrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.eca_assessments
      WHERE id = assessment_rubrics.assessment_id
      AND (is_published = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage own assessment rubrics"
  ON public.assessment_rubrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.eca_assessments
      WHERE id = assessment_rubrics.assessment_id AND created_by = auth.uid()
    )
  );

-- LEARNING MISSIONS
ALTER TABLE public.learning_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all missions"
  ON public.learning_missions FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view active missions"
  ON public.learning_missions FOR SELECT
  USING (is_active = true OR created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can create missions"
  ON public.learning_missions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update own missions"
  ON public.learning_missions FOR UPDATE
  USING (created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can delete own missions"
  ON public.learning_missions FOR DELETE
  USING (created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Students can view active missions"
  ON public.learning_missions FOR SELECT
  USING (is_active = true);

-- MISSION LESSONS
ALTER TABLE public.mission_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mission lessons"
  ON public.mission_lessons FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view mission lessons"
  ON public.mission_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_missions
      WHERE id = mission_lessons.mission_id
      AND (is_active = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage own mission lessons"
  ON public.mission_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_missions
      WHERE id = mission_lessons.mission_id AND created_by = auth.uid()
    )
  );

-- RESOURCE LIBRARY
ALTER TABLE public.resource_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all resources"
  ON public.resource_library FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view public resources"
  ON public.resource_library FOR SELECT
  USING (is_public = true OR created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can create resources"
  ON public.resource_library FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update own resources"
  ON public.resource_library FOR UPDATE
  USING (created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can delete own resources"
  ON public.resource_library FOR DELETE
  USING (created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Students can view public resources"
  ON public.resource_library FOR SELECT
  USING (is_public = true);

-- ECA TEMPLATES
ALTER TABLE public.eca_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all templates"
  ON public.eca_templates FOR ALL
  USING (is_user_admin());

CREATE POLICY "Teachers can view active templates"
  ON public.eca_templates FOR SELECT
  USING (is_active = true OR created_by = auth.uid() OR is_user_admin());

CREATE POLICY "Teachers can create templates"
  ON public.eca_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update own templates"
  ON public.eca_templates FOR UPDATE
  USING (created_by = auth.uid() OR is_user_admin());

-- ================================
-- UPDATE TRIGGERS
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_curriculum_programs_updated_at
  BEFORE UPDATE ON public.curriculum_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_units_updated_at
  BEFORE UPDATE ON public.curriculum_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eca_assessments_updated_at
  BEFORE UPDATE ON public.eca_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_rubrics_updated_at
  BEFORE UPDATE ON public.assessment_rubrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_missions_updated_at
  BEFORE UPDATE ON public.learning_missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_library_updated_at
  BEFORE UPDATE ON public.resource_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eca_templates_updated_at
  BEFORE UPDATE ON public.eca_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();