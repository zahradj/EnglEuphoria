-- Add target_system column to curriculum_levels for direct system mapping
ALTER TABLE curriculum_levels ADD COLUMN IF NOT EXISTS target_system TEXT DEFAULT 'kids';

-- Clear existing levels and insert new ones matching the Master Data Map
DELETE FROM curriculum_levels;

-- PLAYGROUND (Kids/Foundation) Levels
INSERT INTO curriculum_levels (id, name, cefr_level, age_group, level_order, target_system, description, sequence_order)
VALUES 
  (gen_random_uuid(), 'Beginner', 'Pre-A1', 'Kids (6-10)', 1, 'kids', 'Foundation level - Hello World unit', 1),
  (gen_random_uuid(), 'Hard Beginner', 'A1', 'Kids (6-10)', 2, 'kids', 'Building confidence - My Day unit', 2),
  (gen_random_uuid(), 'Elementary', 'A1+', 'Kids (6-10)', 3, 'kids', 'Past tense introduction - Yesterday unit', 3);

-- THE ACADEMY (Teens/Structure) Levels  
INSERT INTO curriculum_levels (id, name, cefr_level, age_group, level_order, target_system, description, sequence_order)
VALUES
  (gen_random_uuid(), 'Academy Beginner', 'A2', 'Teens (11-17)', 4, 'teen', 'The Refresh - Bridging foundation to structure', 4),
  (gen_random_uuid(), 'High Intermediate', 'B1+', 'Teens (11-17)', 5, 'teen', 'Experience - Present Perfect mastery', 5),
  (gen_random_uuid(), 'Upper Intermediate', 'B2', 'Teens (11-17)', 6, 'teen', 'The Future - Advanced future forms', 6);

-- THE HUB (Adults/Pro) Levels
INSERT INTO curriculum_levels (id, name, cefr_level, age_group, level_order, target_system, description, sequence_order)
VALUES
  (gen_random_uuid(), 'Advanced', 'C1', 'Adults (18+)', 7, 'adult', 'Persuasion - Complex conditionals', 7),
  (gen_random_uuid(), 'Proficiency', 'C2', 'Adults (18+)', 8, 'adult', 'Nuance - Inversion and rhetoric', 8);