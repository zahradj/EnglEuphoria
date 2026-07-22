
-- =============================================
-- KIDS TRACK: LEVELS 3, 4, 5
-- Level 3: High Beginner (A1+)
-- Level 4: Elementary (A2)
-- Level 5: High Elementary (A2+)
-- =============================================

-- LEVEL 3: HIGH BEGINNER (A1+) - 15 Lessons
INSERT INTO curriculum_lessons (level_id, title, description, difficulty_level, target_system, sequence_order, duration_minutes, xp_reward, is_published)
SELECT 
  cl.id,
  lesson.title,
  lesson.description,
  'beginner',
  'kids',
  lesson.seq,
  30,
  lesson.xp,
  true
FROM curriculum_levels cl
CROSS JOIN (VALUES
  (1, 'Weather & Seasons', 'Describe weather in different seasons', 100),
  (2, 'My Daily Routine', 'Tell what you do every day', 105),
  (3, 'Around Town', 'Places in the neighborhood', 100),
  (4, 'Shopping Fun', 'Buying things at stores', 110),
  (5, 'Hobbies & Sports', 'Talk about what you like to do', 105),
  (6, 'At the Zoo', 'Wild animals and their homes', 110),
  (7, 'Healthy Eating', 'Food groups and nutrition', 100),
  (8, 'My Neighborhood', 'Directions and locations', 115),
  (9, 'Celebrations', 'Birthdays and holidays', 110),
  (10, 'Jobs People Do', 'Community helpers and professions', 105),
  (11, 'Weather Report', 'Making simple predictions', 115),
  (12, 'Story Time', 'Retelling simple stories', 120),
  (13, 'Phone a Friend', 'Simple telephone conversations', 110),
  (14, 'Show and Tell', 'Describing objects in detail', 115),
  (15, 'Level 3 Adventure', 'Comprehensive review and celebration', 125)
) AS lesson(seq, title, description, xp)
WHERE cl.id = 'c10cc1ba-35fd-4ead-93f2-b3f7d7d2c75c';

-- LEVEL 4: ELEMENTARY (A2) - 15 Lessons
INSERT INTO curriculum_lessons (level_id, title, description, difficulty_level, target_system, sequence_order, duration_minutes, xp_reward, is_published)
SELECT 
  cl.id,
  lesson.title,
  lesson.description,
  'intermediate',
  'kids',
  lesson.seq,
  30,
  lesson.xp,
  true
FROM curriculum_levels cl
CROSS JOIN (VALUES
  (1, 'Travel Plans', 'Talking about trips and vacations', 130),
  (2, 'School Subjects', 'Discussing favorite classes', 125),
  (3, 'Weekend Adventures', 'Past tense activities', 130),
  (4, 'Making Friends', 'Introducing and describing people', 135),
  (5, 'Nature Explorer', 'Environment and habitats', 130),
  (6, 'Technology Time', 'Simple technology vocabulary', 140),
  (7, 'Future Dreams', 'Talking about what you want to be', 135),
  (8, 'World Cultures', 'Countries and traditions', 140),
  (9, 'Problem Solving', 'Explaining simple solutions', 135),
  (10, 'Sports Day', 'Comparing abilities and achievements', 130),
  (11, 'Creative Projects', 'Describing art and crafts', 140),
  (12, 'News Reporter', 'Sharing information clearly', 145),
  (13, 'Team Work', 'Collaborative communication', 135),
  (14, 'Talent Show', 'Expressing opinions and preferences', 140),
  (15, 'Level 4 Champion', 'Comprehensive assessment and celebration', 150)
) AS lesson(seq, title, description, xp)
WHERE cl.id = 'db3a811e-3914-4a9a-a540-63d9eee6e0c7';

-- LEVEL 5: HIGH ELEMENTARY (A2+) - 15 Lessons
INSERT INTO curriculum_lessons (level_id, title, description, difficulty_level, target_system, sequence_order, duration_minutes, xp_reward, is_published)
SELECT 
  cl.id,
  lesson.title,
  lesson.description,
  'intermediate',
  'kids',
  lesson.seq,
  30,
  lesson.xp,
  true
FROM curriculum_levels cl
CROSS JOIN (VALUES
  (1, 'Story Creator', 'Creating original short stories', 160),
  (2, 'Debate Club', 'Expressing and defending opinions', 165),
  (3, 'Interview Skills', 'Asking and answering questions fluently', 160),
  (4, 'Documentary Style', 'Describing processes and procedures', 170),
  (5, 'Cultural Exchange', 'Comparing different ways of life', 165),
  (6, 'Science Talk', 'Explaining simple scientific concepts', 175),
  (7, 'Environmental Heroes', 'Discussing conservation topics', 170),
  (8, 'Digital Citizen', 'Online safety and communication', 165),
  (9, 'Presentation Pro', 'Giving structured presentations', 175),
  (10, 'Creative Writing', 'Narrative and descriptive writing', 170),
  (11, 'Current Events', 'Discussing age-appropriate news', 175),
  (12, 'Leadership Skills', 'Giving instructions and feedback', 180),
  (13, 'Problem & Solution', 'Analyzing and proposing solutions', 175),
  (14, 'My Portfolio', 'Showcasing learning journey', 180),
  (15, 'Kids Track Graduate', 'Final celebration and certificate', 200)
) AS lesson(seq, title, description, xp)
WHERE cl.id = '6fe099b7-183f-4d9f-9df6-6d1f8fed8d44';

-- Insert Library Assets for Levels 3, 4, 5
INSERT INTO library_assets (title, file_type, file_url, system_tag, description, min_age, max_age, tags)
VALUES
  -- Level 3 Assets (A1+)
  ('Weather Forecast Video', 'video', '/assets/kids/level3/weather-forecast.mp4', 'kids', 'Kid-friendly weather report video', 6, 8, ARRAY['A1+', 'listening', 'weather']),
  ('Daily Routine Flashcards', 'image', '/assets/kids/level3/routine-cards.png', 'kids', 'Morning to night activity cards', 6, 8, ARRAY['A1+', 'vocabulary', 'routines']),
  ('Town Map Activity', 'interactive_quiz', '/assets/kids/level3/town-map.html', 'kids', 'Interactive neighborhood map', 6, 8, ARRAY['A1+', 'vocabulary', 'places']),
  ('Shopping Role Play', 'audio', '/assets/kids/level3/shopping-dialog.mp3', 'kids', 'Store conversation examples', 6, 8, ARRAY['A1+', 'speaking', 'shopping']),
  ('Hobbies Matching Game', 'interactive_quiz', '/assets/kids/level3/hobbies-match.html', 'kids', 'Match hobbies with pictures', 6, 8, ARRAY['A1+', 'vocabulary', 'hobbies']),
  
  -- Level 4 Assets (A2)
  ('Travel Vocabulary Pack', 'pdf', '/assets/kids/level4/travel-vocab.pdf', 'kids', 'Airport and travel words', 7, 9, ARRAY['A2', 'vocabulary', 'travel']),
  ('Past Tense Stories', 'audio', '/assets/kids/level4/past-tense.mp3', 'kids', 'Story-based past tense practice', 7, 9, ARRAY['A2', 'grammar', 'past-tense']),
  ('World Map Explorer', 'interactive_quiz', '/assets/kids/level4/world-map.html', 'kids', 'Interactive world geography', 7, 9, ARRAY['A2', 'vocabulary', 'geography']),
  ('Future Dreams Video', 'video', '/assets/kids/level4/future-dreams.mp4', 'kids', 'Kids talking about future goals', 7, 9, ARRAY['A2', 'speaking', 'future']),
  ('News Report Template', 'pdf', '/assets/kids/level4/news-template.pdf', 'kids', 'Simple news story structure', 7, 9, ARRAY['A2', 'writing', 'news']),
  
  -- Level 5 Assets (A2+)
  ('Story Starter Cards', 'image', '/assets/kids/level5/story-starters.png', 'kids', 'Creative writing prompts', 8, 10, ARRAY['A2+', 'writing', 'creative']),
  ('Debate Topics List', 'pdf', '/assets/kids/level5/debate-topics.pdf', 'kids', 'Age-appropriate debate subjects', 8, 10, ARRAY['A2+', 'speaking', 'debate']),
  ('Presentation Skills Video', 'video', '/assets/kids/level5/presentation.mp4', 'kids', 'How to give a great presentation', 8, 10, ARRAY['A2+', 'speaking', 'presentation']),
  ('Portfolio Template', 'pdf', '/assets/kids/level5/portfolio-template.pdf', 'kids', 'Learning journey portfolio', 8, 10, ARRAY['A2+', 'writing', 'portfolio']),
  ('Kids Track Certificate', 'pdf', '/assets/kids/level5/graduation-cert.pdf', 'kids', 'System A completion certificate', 8, 10, ARRAY['A2+', 'achievement', 'certificate']);

-- Link assets to lessons via lesson_materials (using correct column: display_order)
INSERT INTO lesson_materials (lesson_id, asset_id, display_order)
SELECT 
  cl.id as lesson_id,
  la.id as asset_id,
  1 as display_order
FROM curriculum_lessons cl
JOIN curriculum_levels lv ON cl.level_id = lv.id
JOIN library_assets la ON la.system_tag = 'kids'
WHERE 
  (lv.cefr_level = 'A1+' AND 'A1+' = ANY(la.tags) AND cl.title = 'Weather & Seasons' AND la.title = 'Weather Forecast Video') OR
  (lv.cefr_level = 'A1+' AND 'A1+' = ANY(la.tags) AND cl.title = 'My Daily Routine' AND la.title = 'Daily Routine Flashcards') OR
  (lv.cefr_level = 'A1+' AND 'A1+' = ANY(la.tags) AND cl.title = 'Around Town' AND la.title = 'Town Map Activity') OR
  (lv.cefr_level = 'A1+' AND 'A1+' = ANY(la.tags) AND cl.title = 'Shopping Fun' AND la.title = 'Shopping Role Play') OR
  (lv.cefr_level = 'A1+' AND 'A1+' = ANY(la.tags) AND cl.title = 'Hobbies & Sports' AND la.title = 'Hobbies Matching Game') OR
  (lv.cefr_level = 'A2' AND 'A2' = ANY(la.tags) AND cl.title = 'Travel Plans' AND la.title = 'Travel Vocabulary Pack') OR
  (lv.cefr_level = 'A2' AND 'A2' = ANY(la.tags) AND cl.title = 'Weekend Adventures' AND la.title = 'Past Tense Stories') OR
  (lv.cefr_level = 'A2' AND 'A2' = ANY(la.tags) AND cl.title = 'World Cultures' AND la.title = 'World Map Explorer') OR
  (lv.cefr_level = 'A2' AND 'A2' = ANY(la.tags) AND cl.title = 'Future Dreams' AND la.title = 'Future Dreams Video') OR
  (lv.cefr_level = 'A2' AND 'A2' = ANY(la.tags) AND cl.title = 'News Reporter' AND la.title = 'News Report Template') OR
  (lv.cefr_level = 'A2+' AND 'A2+' = ANY(la.tags) AND cl.title = 'Story Creator' AND la.title = 'Story Starter Cards') OR
  (lv.cefr_level = 'A2+' AND 'A2+' = ANY(la.tags) AND cl.title = 'Debate Club' AND la.title = 'Debate Topics List') OR
  (lv.cefr_level = 'A2+' AND 'A2+' = ANY(la.tags) AND cl.title = 'Presentation Pro' AND la.title = 'Presentation Skills Video') OR
  (lv.cefr_level = 'A2+' AND 'A2+' = ANY(la.tags) AND cl.title = 'My Portfolio' AND la.title = 'Portfolio Template') OR
  (lv.cefr_level = 'A2+' AND 'A2+' = ANY(la.tags) AND cl.title = 'Kids Track Graduate' AND la.title = 'Kids Track Certificate')
ON CONFLICT DO NOTHING;
