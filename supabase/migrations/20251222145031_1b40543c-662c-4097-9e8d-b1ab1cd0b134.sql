-- Create curriculum_lessons table for unified content library (different from booked lessons)
CREATE TABLE IF NOT EXISTS curriculum_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_system TEXT NOT NULL CHECK (target_system IN ('kids', 'teen', 'adult')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER DEFAULT 30,
  thumbnail_url TEXT,
  content JSONB DEFAULT '{}',
  xp_reward INTEGER DEFAULT 100,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read published lessons
CREATE POLICY "Authenticated users can read published curriculum lessons" 
ON curriculum_lessons FOR SELECT 
TO authenticated 
USING (is_published = true);

-- Policy: Admins and teachers can manage lessons
CREATE POLICY "Teachers and admins can manage curriculum lessons"
ON curriculum_lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'teacher')
  )
);

-- Create index for faster filtering by target_system
CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_target_system ON curriculum_lessons(target_system);
CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_published ON curriculum_lessons(is_published) WHERE is_published = true;

-- Insert sample lessons for each system
INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, xp_reward, order_index, content) VALUES
-- Kids lessons (The Playground)
('Colors & Animals', 'Learn colors and animals with fun games!', 'kids', 'beginner', 15, 50, 1, '{"type": "interactive", "slides": 10}'),
('ABC Adventure', 'Explore the alphabet with Luna the Lion!', 'kids', 'beginner', 20, 75, 2, '{"type": "phonics", "slides": 15}'),
('Number Jungle', 'Count with jungle friends!', 'kids', 'beginner', 15, 50, 3, '{"type": "numbers", "slides": 12}'),
('Magic Words', 'First sight words adventure', 'kids', 'intermediate', 25, 100, 4, '{"type": "vocabulary", "slides": 18}'),
('Story Time', 'Interactive reading stories', 'kids', 'intermediate', 30, 120, 5, '{"type": "reading", "slides": 20}'),

-- Teen lessons (The Academy)
('Grammar Foundations', 'Master essential grammar rules', 'teen', 'beginner', 30, 100, 1, '{"type": "grammar", "exercises": 15}'),
('Conversation Skills', 'Build confidence in speaking', 'teen', 'beginner', 25, 80, 2, '{"type": "speaking", "activities": 10}'),
('Writing Workshop', 'Express yourself through writing', 'teen', 'intermediate', 35, 120, 3, '{"type": "writing", "prompts": 8}'),
('Debate Club', 'Argue your point effectively', 'teen', 'advanced', 40, 150, 4, '{"type": "debate", "topics": 5}'),
('Media Literacy', 'Analyze and create content', 'teen', 'intermediate', 30, 100, 5, '{"type": "media", "projects": 3}'),

-- Adult lessons (The Hub)
('Business English', 'Professional communication skills', 'adult', 'intermediate', 45, 100, 1, '{"type": "business", "modules": 8}'),
('Academic Writing', 'Research and essay writing', 'adult', 'advanced', 50, 120, 2, '{"type": "academic", "units": 6}'),
('Interview Mastery', 'Ace your next interview', 'adult', 'intermediate', 40, 100, 3, '{"type": "career", "scenarios": 10}'),
('Public Speaking', 'Present with confidence', 'adult', 'advanced', 45, 130, 4, '{"type": "presentation", "workshops": 5}'),
('Global Culture', 'Cross-cultural communication', 'adult', 'intermediate', 35, 90, 5, '{"type": "culture", "case_studies": 7}')