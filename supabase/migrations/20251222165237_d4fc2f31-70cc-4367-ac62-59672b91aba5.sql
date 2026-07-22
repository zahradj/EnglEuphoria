-- Add visibility and business_mode columns to curriculum_materials
ALTER TABLE curriculum_materials 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'both' 
  CHECK (visibility IN ('teacher_only', 'student_accessible', 'both')),
ADD COLUMN IF NOT EXISTS business_mode BOOLEAN DEFAULT false;

-- Add current_system and current_level_id to users table for system tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_system VARCHAR(10) DEFAULT 'kids'
  CHECK (current_system IN ('kids', 'teen', 'adult')),
ADD COLUMN IF NOT EXISTS current_level_id UUID REFERENCES curriculum_levels(id);

-- Create index for faster filtering by system
CREATE INDEX IF NOT EXISTS idx_users_current_system ON users(current_system);
CREATE INDEX IF NOT EXISTS idx_curriculum_materials_visibility ON curriculum_materials(visibility);