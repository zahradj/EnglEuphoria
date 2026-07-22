
-- Create enhanced ESL curriculum levels table
CREATE TABLE public.curriculum_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  age_group TEXT NOT NULL,
  description TEXT NOT NULL,
  level_order INTEGER NOT NULL UNIQUE,
  xp_required INTEGER DEFAULT 0,
  estimated_hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create curriculum materials table
CREATE TABLE public.curriculum_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('worksheet', 'activity', 'lesson_plan', 'assessment', 'game', 'video', 'audio', 'reading', 'song', 'story', 'exam_prep')),
  level_id UUID REFERENCES curriculum_levels(id) ON DELETE CASCADE,
  cefr_level TEXT NOT NULL,
  skill_focus TEXT[] DEFAULT '{}',
  theme TEXT,
  duration INTEGER DEFAULT 30,
  xp_reward INTEGER DEFAULT 50,
  difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  is_age_appropriate BOOLEAN DEFAULT true,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ
);

-- Create skills table for proper skill management
CREATE TABLE public.curriculum_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('listening', 'speaking', 'reading', 'writing', 'grammar', 'vocabulary', 'pronunciation', 'songs', 'games', 'exam_prep')),
  description TEXT,
  is_age_appropriate BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for material-skill relationships
CREATE TABLE public.material_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES curriculum_materials(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES curriculum_skills(id) ON DELETE CASCADE,
  UNIQUE(material_id, skill_id)
);

-- Create storage bucket for curriculum files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('curriculum-materials', 'curriculum-materials', true);

-- Enable RLS on all tables
ALTER TABLE public.curriculum_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curriculum_levels (public read, authenticated write)
CREATE POLICY "Everyone can view curriculum levels" ON curriculum_levels
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage levels" ON curriculum_levels
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for curriculum_materials
CREATE POLICY "Everyone can view public materials" ON curriculum_materials
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own materials" ON curriculum_materials
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Authenticated users can upload materials" ON curriculum_materials
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own materials" ON curriculum_materials
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own materials" ON curriculum_materials
  FOR DELETE USING (uploaded_by = auth.uid());

-- RLS Policies for skills (public read)
CREATE POLICY "Everyone can view skills" ON curriculum_skills
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage skills" ON curriculum_skills
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for material_skills junction table
CREATE POLICY "Everyone can view material skills" ON material_skills
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage material skills" ON material_skills
  FOR ALL USING (auth.role() = 'authenticated');

-- Storage policies for curriculum materials bucket
CREATE POLICY "Anyone can view curriculum files" ON storage.objects
  FOR SELECT USING (bucket_id = 'curriculum-materials');

CREATE POLICY "Authenticated users can upload curriculum files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'curriculum-materials' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'curriculum-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'curriculum-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert the 8 enhanced ESL levels
INSERT INTO curriculum_levels (name, cefr_level, age_group, description, level_order, xp_required, estimated_hours) VALUES
('True Beginner', 'Pre-A1', 'Young Learners (4-7 years)', 'Complete beginners with no English knowledge. Focus on basic vocabulary, simple phrases, and playful learning through songs and games.', 1, 0, 50),
('Beginner', 'A1', 'Elementary (6-9 years)', 'Basic everyday expressions and simple interactions. Can introduce themselves and ask basic questions about personal details.', 2, 500, 80),
('High Beginner', 'A1+', 'Elementary (8-11 years)', 'Enhanced beginner skills with more complex sentence structures and expanded vocabulary for familiar topics.', 3, 800, 100),
('Elementary', 'A2', 'Pre-Teen (10-13 years)', 'Understanding frequently used expressions related to immediate relevance. Can communicate in simple routine tasks.', 4, 1200, 120),
('High Elementary', 'A2+', 'Teen (12-15 years)', 'Advanced elementary skills with ability to handle more complex communication situations and longer conversations.', 5, 1600, 140),
('Intermediate', 'B1', 'Teen (14-17 years)', 'Can understand main points of clear standard input on familiar matters. Can deal with most travel and work situations.', 6, 2200, 160),
('High Intermediate', 'B1+', 'Teen+ (16+ years)', 'Enhanced intermediate skills with better fluency and ability to express opinions and explain viewpoints on topical issues.', 7, 2800, 180),
('Upper-Intermediate', 'B2', 'Teen+ (16+ years)', 'Can understand complex texts and interact with fluency. Can produce clear, detailed text on a wide range of subjects.', 8, 3600, 200);

-- Insert basic skills for the curriculum
INSERT INTO curriculum_skills (name, category, description, is_age_appropriate) VALUES
('Basic Vocabulary', 'vocabulary', 'Learning essential words for daily life', true),
('Simple Grammar', 'grammar', 'Basic sentence structures and verb forms', true),
('Listening Comprehension', 'listening', 'Understanding spoken English in various contexts', true),
('Speaking Practice', 'speaking', 'Developing oral communication skills', true),
('Reading Skills', 'reading', 'Comprehending written texts at appropriate levels', true),
('Writing Practice', 'writing', 'Developing written communication abilities', true),
('Pronunciation', 'pronunciation', 'Correct sound production and intonation', true),
('Educational Songs', 'songs', 'Learning through music and rhythm', true),
('Interactive Games', 'games', 'Gamified learning activities', true),
('Exam Preparation', 'exam_prep', 'Preparing for standardized English tests', true);

-- Create function to update material stats
CREATE OR REPLACE FUNCTION update_material_stats()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE TRIGGER update_curriculum_materials_updated_at
  BEFORE UPDATE ON curriculum_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_material_stats();

CREATE TRIGGER update_curriculum_levels_updated_at
  BEFORE UPDATE ON curriculum_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
