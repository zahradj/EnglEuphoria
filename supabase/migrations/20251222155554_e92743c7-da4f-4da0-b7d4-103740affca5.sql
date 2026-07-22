
-- ===========================================
-- LEVEL 1 "SEED" CURRICULUM POPULATION
-- The Playground (System A - Kids, Ages 4-7)
-- ===========================================

-- Step 1: Get track and level IDs, then link them
DO $$
DECLARE
  v_track_id UUID;
  v_level_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM tracks WHERE name = 'Seed Level' LIMIT 1;
  SELECT id INTO v_level_id FROM curriculum_levels WHERE name = 'True Beginner' LIMIT 1;
  IF v_track_id IS NOT NULL AND v_level_id IS NOT NULL THEN
    UPDATE curriculum_levels SET track_id = v_track_id WHERE id = v_level_id;
  END IF;
END $$;

-- Step 2: Insert all 15 Lessons
DELETE FROM curriculum_lessons WHERE target_system = 'kids' AND difficulty_level = 'beginner';

-- Unit 1: The Magic Forest
INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '1.1 Hello, Pip!', 'Learn greetings with Pip the Parrot - say Hello and introduce yourself!', 'kids', 'beginner', 30, id, 1, 50,
  '{"unit": 1, "unit_name": "The Magic Forest", "theme": "Exploration", "topic": "Greetings", "focus": ["Greetings", "Self-introduction"], "grammar_target": "Hello, I am [Name].", "hook": "The student meets the mascot, Pip the Parrot.", "mascot": "Pip", "vocabulary": ["hello", "hi", "goodbye", "bye", "my name is"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '1.2 Colors of the Forest', 'Discover the magical colors of the forest with Pip!', 'kids', 'beginner', 30, id, 2, 50,
  '{"unit": 1, "unit_name": "The Magic Forest", "theme": "Exploration", "topic": "Colors", "focus": ["Red", "Blue", "Green"], "grammar_target": "It is [color].", "hook": "Pip shows the colorful forest treasures.", "mascot": "Pip", "vocabulary": ["red", "blue", "green", "color", "look", "see"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '1.3 Counting Berries', 'Count delicious berries from 1 to 5 with Pip!', 'kids', 'beginner', 30, id, 3, 50,
  '{"unit": 1, "unit_name": "The Magic Forest", "theme": "Exploration", "topic": "Numbers 1-5", "focus": ["Counting", "Numbers recognition"], "grammar_target": "I have [number] berries.", "hook": "Pip collects berries for the winter.", "mascot": "Pip", "vocabulary": ["one", "two", "three", "four", "five", "count", "berry"], "is_unit_finale": true, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

-- Unit 2: My Super Family
INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '2.1 Meet the Family', 'Meet Pip''s family in the cozy nest!', 'kids', 'beginner', 30, id, 4, 60,
  '{"unit": 2, "unit_name": "My Super Family", "theme": "People", "topic": "Family Members", "focus": ["Mom", "Dad", "Brother", "Sister"], "grammar_target": "This is my [mom/dad].", "hook": "Pip the Parrot introduces his family in the nest.", "mascot": "Pip", "vocabulary": ["mom", "dad", "brother", "sister", "family", "this is"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '2.2 Big Bear, Small Mouse', 'Learn about sizes with forest friends!', 'kids', 'beginner', 30, id, 5, 60,
  '{"unit": 2, "unit_name": "My Super Family", "theme": "People", "topic": "Sizes", "focus": ["Big", "Small"], "grammar_target": "He/She is big/small.", "hook": "Compare the giant bear to the tiny mouse.", "mascot": "Pip", "vocabulary": ["big", "small", "tall", "short", "bear", "mouse"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '2.3 Who is he?', 'Learn to use He and She correctly!', 'kids', 'beginner', 30, id, 6, 60,
  '{"unit": 2, "unit_name": "My Super Family", "theme": "People", "topic": "Pronouns", "focus": ["He", "She"], "grammar_target": "He is... / She is...", "hook": "Dress up characters and describe them!", "mascot": "Pip", "vocabulary": ["he", "she", "boy", "girl", "man", "woman"], "is_unit_finale": true, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

-- Unit 3: The Hungry Monster
INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '3.1 Yummy Fruit', 'Learn fruit names to feed the friendly monster!', 'kids', 'beginner', 30, id, 7, 70,
  '{"unit": 3, "unit_name": "The Hungry Monster", "theme": "Food", "topic": "Fruits", "focus": ["Apple", "Banana", "Orange"], "grammar_target": "This is a/an [fruit].", "hook": "A friendly monster named Munch blocks the bridge and wants snacks.", "mascot": "Munch", "vocabulary": ["apple", "banana", "orange", "fruit", "yummy", "eat"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '3.2 Yucky Onion!', 'Express what you like and don''t like!', 'kids', 'beginner', 30, id, 8, 70,
  '{"unit": 3, "unit_name": "The Hungry Monster", "theme": "Food", "topic": "Likes/Dislikes", "focus": ["I like", "I don''t like"], "grammar_target": "I like [food]. / I don''t like [food].", "hook": "Help Munch decide what to eat!", "mascot": "Munch", "vocabulary": ["like", "don''t like", "yummy", "yucky", "taste"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '3.3 The Picnic', 'Share food and practice polite words!', 'kids', 'beginner', 30, id, 9, 80,
  '{"unit": 3, "unit_name": "The Hungry Monster", "theme": "Food", "topic": "Sharing", "focus": ["Here you are", "Thank you"], "grammar_target": "Here you are. / Thank you.", "hook": "Have a picnic with Munch and friends!", "mascot": "Munch", "vocabulary": ["here you are", "thank you", "please", "share", "picnic"], "is_unit_finale": true, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

-- Unit 4: Robot City
INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '4.1 Move Your Body', 'Command the robots to move with action words!', 'kids', 'beginner', 30, id, 10, 70,
  '{"unit": 4, "unit_name": "Robot City", "theme": "Actions", "topic": "Movement Verbs", "focus": ["Jump", "Run", "Walk"], "grammar_target": "Jump! Run! Walk!", "hook": "Enter a city of robots who only move if you say the right word.", "mascot": "Robo", "vocabulary": ["jump", "run", "walk", "stop", "go", "move"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '4.2 Sleepy Robot', 'Learn about daily routines with the robots!', 'kids', 'beginner', 30, id, 11, 70,
  '{"unit": 4, "unit_name": "Robot City", "theme": "Actions", "topic": "Daily Routines", "focus": ["Sleep", "Wake up"], "grammar_target": "Time to sleep. / Wake up!", "hook": "The robots need to rest and recharge.", "mascot": "Robo", "vocabulary": ["sleep", "wake up", "tired", "morning", "night", "dream"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '4.3 I Can Fly!', 'Discover what you and animals can do!', 'kids', 'beginner', 30, id, 12, 80,
  '{"unit": 4, "unit_name": "Robot City", "theme": "Actions", "topic": "Abilities", "focus": ["Can"], "grammar_target": "I can [verb].", "hook": "Become a superhero and show your powers!", "mascot": "Robo", "vocabulary": ["can", "fly", "swim", "climb", "sing", "dance"], "is_unit_finale": true, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

-- Unit 5: The Feelings Cloud
INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '5.1 The Happy Sun', 'Learn about happy and sad feelings!', 'kids', 'beginner', 30, id, 13, 80,
  '{"unit": 5, "unit_name": "The Feelings Cloud", "theme": "Emotions", "topic": "Happy/Sad", "focus": ["Happy", "Sad"], "grammar_target": "I am happy. / I am sad.", "hook": "The weather changes based on how the Cloud feels.", "mascot": "Cloudy", "vocabulary": ["happy", "sad", "smile", "cry", "feel", "sun"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '5.2 The Angry Storm', 'Understand and express strong emotions safely!', 'kids', 'beginner', 30, id, 14, 80,
  '{"unit": 5, "unit_name": "The Feelings Cloud", "theme": "Emotions", "topic": "Angry/Scared", "focus": ["Angry", "Scared"], "grammar_target": "I am angry. / I am scared.", "hook": "Cloudy gets stormy but learns to calm down.", "mascot": "Cloudy", "vocabulary": ["angry", "scared", "storm", "thunder", "calm", "brave"], "is_unit_finale": false, "is_level_finale": false}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

INSERT INTO curriculum_lessons (title, description, target_system, difficulty_level, duration_minutes, level_id, sequence_order, xp_reward, content, is_published)
SELECT '5.3 How are you?', 'Ask and answer about feelings - Level 1 Graduation!', 'kids', 'beginner', 30, id, 15, 100,
  '{"unit": 5, "unit_name": "The Feelings Cloud", "theme": "Emotions", "topic": "Questions", "focus": ["How are you?", "I am fine"], "grammar_target": "How are you? / I am [feeling].", "hook": "Graduation celebration - become a Level 1 Explorer!", "mascot": "Cloudy", "vocabulary": ["how", "are", "you", "fine", "great", "okay"], "is_unit_finale": true, "is_level_finale": true, "certificate": "Level 1 Explorer Certificate"}'::jsonb, true
FROM curriculum_levels WHERE name = 'True Beginner';

-- Step 3: Insert Library Assets with CORRECT file_type values (pdf, video, audio, interactive_quiz, image, document, presentation)
DELETE FROM library_assets WHERE system_tag = 'kids' AND tags @> ARRAY['level1'];

-- Unit 1 Assets
INSERT INTO library_assets (title, description, file_url, file_type, min_age, max_age, system_tag, is_teacher_only, tags) VALUES
('The Hello Song', 'Catchy greeting song for introducing Hello and Hi', '/assets/kids/seed/u1/hello-song.mp4', 'video', 4, 7, 'kids', false, ARRAY['level1', 'unit1', 'greetings', 'song']),
('Pip Flashcard Set', 'Flashcards featuring Pip, Map, and Adventure Bag', '/assets/kids/seed/u1/flashcards-pip.zip', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit1', 'greetings', 'flashcards']),
('Trace the Hello Worksheet', 'Printable worksheet for tracing Hello letters', '/assets/kids/seed/u1/trace-hello.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit1', 'greetings', 'worksheet']),
('Pop the Red Balloon Game', 'Interactive color recognition game', '/assets/kids/seed/u1/pop-balloon.html', 'interactive_quiz', 4, 7, 'kids', false, ARRAY['level1', 'unit1', 'colors', 'game']),
('I See Something Blue Audio', 'Audio clip for color listening activity', '/assets/kids/seed/u1/see-blue.mp3', 'audio', 4, 7, 'kids', false, ARRAY['level1', 'unit1', 'colors', 'listening']),
('Forest Background Slide', 'Interactive forest scene for color exploration', '/assets/kids/seed/u1/forest-bg.pptx', 'presentation', 4, 7, 'kids', true, ARRAY['level1', 'unit1', 'colors', 'slide']),
('Five Little Birds Video', 'Counting song video with animated birds', '/assets/kids/seed/u1/five-birds.mp4', 'video', 4, 7, 'kids', false, ARRAY['level1', 'unit1', 'numbers', 'song', 'counting']),
('Connect Numbers Worksheet', 'Connect-the-dots worksheet for numbers 1-5', '/assets/kids/seed/u1/connect-numbers.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit1', 'numbers', 'worksheet']),
('Berry Sticker Pack', 'Digital berry stickers for interactive whiteboard', '/assets/kids/seed/u1/berry-stickers.png', 'image', 4, 7, 'kids', true, ARRAY['level1', 'unit1', 'numbers', 'stickers']);

-- Unit 2 Assets
INSERT INTO library_assets (title, description, file_url, file_type, min_age, max_age, system_tag, is_teacher_only, tags) VALUES
('Family Tree Flashcard Set', 'Flashcards with mom, dad, brother, sister', '/assets/kids/seed/u2/family-flashcards.zip', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit2', 'family', 'flashcards']),
('Baby Shark Family Song', 'Family version of Baby Shark song', '/assets/kids/seed/u2/baby-shark-family.mp4', 'video', 4, 7, 'kids', false, ARRAY['level1', 'unit2', 'family', 'song']),
('Draw Your Family Frame', 'Printable frame for family drawing activity', '/assets/kids/seed/u2/family-frame.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit2', 'family', 'worksheet']),
('Elephant vs Ant Comparison Slide', 'Interactive slide comparing big and small', '/assets/kids/seed/u2/big-small-slide.pptx', 'presentation', 4, 7, 'kids', true, ARRAY['level1', 'unit2', 'sizes', 'slide']),
('Sort Big vs Small Game', 'Drag and drop sorting game for sizes', '/assets/kids/seed/u2/sort-sizes.html', 'interactive_quiz', 4, 7, 'kids', false, ARRAY['level1', 'unit2', 'sizes', 'game']),
('Big Stomp Small Tiptoe Audio', 'Sound effects for movement activity', '/assets/kids/seed/u2/stomp-tiptoe.wav', 'audio', 4, 7, 'kids', true, ARRAY['level1', 'unit2', 'sizes', 'sfx']),
('Dress Up Interactive Board', 'Put accessories on He/She characters', '/assets/kids/seed/u2/dress-up.html', 'interactive_quiz', 4, 7, 'kids', false, ARRAY['level1', 'unit2', 'pronouns', 'game']),
('He She Coloring Worksheet', 'Color-coding worksheet for pronouns', '/assets/kids/seed/u2/he-she-color.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit2', 'pronouns', 'worksheet']);

-- Unit 3 Assets
INSERT INTO library_assets (title, description, file_url, file_type, min_age, max_age, system_tag, is_teacher_only, tags) VALUES
('3D Fruit Models', '3D models of apple, banana, orange for AR view', '/assets/kids/seed/u3/fruit-models.glb', 'image', 4, 7, 'kids', true, ARRAY['level1', 'unit3', 'food', 'fruits', '3d']),
('Yummy Yummy Fruit Song', 'Catchy fruit vocabulary song', '/assets/kids/seed/u3/yummy-fruit.mp3', 'audio', 4, 7, 'kids', false, ARRAY['level1', 'unit3', 'food', 'fruits', 'song']),
('Fruit Basket Flashcards', 'Flashcard set with various fruits', '/assets/kids/seed/u3/fruit-flashcards.zip', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit3', 'food', 'fruits', 'flashcards']),
('Feed the Monster Game', 'Swipe game - feed Munch foods he likes', '/assets/kids/seed/u3/feed-monster.html', 'interactive_quiz', 4, 7, 'kids', false, ARRAY['level1', 'unit3', 'food', 'likes', 'game']),
('Broccoli Ice Cream Video', 'Do you like broccoli ice cream song video', '/assets/kids/seed/u3/broccoli-icecream.mp4', 'video', 4, 7, 'kids', false, ARRAY['level1', 'unit3', 'food', 'likes', 'song']),
('My Lunchbox Menu', 'Printable menu worksheet for food preferences', '/assets/kids/seed/u3/lunchbox-menu.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit3', 'food', 'likes', 'worksheet']),
('Munch Picnic Storybook', 'Illustrated storybook PDF about sharing food', '/assets/kids/seed/u3/munch-picnic.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit3', 'food', 'sharing', 'storybook']),
('Picnic Roleplay Script', 'Teacher script for roleplay activity', '/assets/kids/seed/u3/picnic-script.txt', 'document', 4, 7, 'kids', true, ARRAY['level1', 'unit3', 'food', 'sharing', 'script']),
('Munch Monster Character', 'Munch the monster mascot image', '/assets/kids/seed/u3/munch-mascot.png', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit3', 'mascot', 'character']);

-- Unit 4 Assets
INSERT INTO library_assets (title, description, file_url, file_type, min_age, max_age, system_tag, is_teacher_only, tags) VALUES
('Simon Says Dance Video', 'Dance-along video for action words', '/assets/kids/seed/u4/simon-says.mp4', 'video', 4, 7, 'kids', false, ARRAY['level1', 'unit4', 'actions', 'movement', 'dance']),
('Robot Actions GIF Set', 'Animated GIFs of robots doing actions', '/assets/kids/seed/u4/robot-gifs.zip', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit4', 'actions', 'movement', 'animation']),
('Fast Slow Music Pack', 'Music tracks for run (fast) and walk (slow)', '/assets/kids/seed/u4/fast-slow-music.mp3', 'audio', 4, 7, 'kids', true, ARRAY['level1', 'unit4', 'actions', 'movement', 'music']),
('Day Night Switcher Slide', 'Interactive slide switching day and night', '/assets/kids/seed/u4/day-night.pptx', 'presentation', 4, 7, 'kids', true, ARRAY['level1', 'unit4', 'actions', 'routines', 'slide']),
('Daily Routines Flashcards', 'Simple daily routine flashcard set', '/assets/kids/seed/u4/routines-flashcards.zip', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit4', 'actions', 'routines', 'flashcards']),
('Freeze Dance Game', 'Interactive freeze dance music game', '/assets/kids/seed/u4/freeze-dance.html', 'interactive_quiz', 4, 7, 'kids', false, ARRAY['level1', 'unit4', 'actions', 'routines', 'game']),
('Superhero Cape Coloring', 'Printable superhero cape coloring page', '/assets/kids/seed/u4/superhero-cape.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit4', 'actions', 'abilities', 'worksheet']),
('Animal Abilities Video', 'Video showing what different animals can do', '/assets/kids/seed/u4/animal-abilities.mp4', 'video', 4, 7, 'kids', false, ARRAY['level1', 'unit4', 'actions', 'abilities', 'animals']),
('Robo Robot Character', 'Robo the robot mascot image', '/assets/kids/seed/u4/robo-mascot.png', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit4', 'mascot', 'character']);

-- Unit 5 Assets
INSERT INTO library_assets (title, description, file_url, file_type, min_age, max_age, system_tag, is_teacher_only, tags) VALUES
('Emoji Masks Prop Set', 'Printable emoji face masks for teacher', '/assets/kids/seed/u5/emoji-masks.pdf', 'pdf', 4, 7, 'kids', true, ARRAY['level1', 'unit5', 'emotions', 'happy', 'props']),
('If You Are Happy Song', 'If you are happy and you know it audio', '/assets/kids/seed/u5/if-happy.mp3', 'audio', 4, 7, 'kids', false, ARRAY['level1', 'unit5', 'emotions', 'happy', 'song']),
('Face Maker Interactive Slide', 'Drag eyes and mouth to make faces', '/assets/kids/seed/u5/face-maker.pptx', 'presentation', 4, 7, 'kids', false, ARRAY['level1', 'unit5', 'emotions', 'happy', 'slide']),
('Thunder and Bird Sounds', 'Sound effects for weather emotions', '/assets/kids/seed/u5/weather-sounds.wav', 'audio', 4, 7, 'kids', true, ARRAY['level1', 'unit5', 'emotions', 'angry', 'sfx']),
('The Grumpy Cloud Storybook', 'Story about Cloudy learning to calm down', '/assets/kids/seed/u5/grumpy-cloud.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit5', 'emotions', 'angry', 'storybook']),
('Match Face to Weather Worksheet', 'Match emotions to weather worksheet', '/assets/kids/seed/u5/face-weather.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit5', 'emotions', 'angry', 'worksheet']),
('Emotion Wheel Spin Game', 'Interactive spinning wheel for emotions', '/assets/kids/seed/u5/emotion-wheel.html', 'interactive_quiz', 4, 7, 'kids', false, ARRAY['level1', 'unit5', 'emotions', 'questions', 'game']),
('Level 1 Explorer Certificate', 'Graduation certificate for completing Level 1', '/assets/kids/seed/u5/explorer-certificate.pdf', 'pdf', 4, 7, 'kids', false, ARRAY['level1', 'unit5', 'certificate', 'graduation']),
('Cloudy Character', 'Cloudy the feelings cloud mascot image', '/assets/kids/seed/u5/cloudy-mascot.png', 'image', 4, 7, 'kids', false, ARRAY['level1', 'unit5', 'mascot', 'character']),
('Pip Character Main', 'Pip the parrot main mascot image', '/assets/kids/seed/u1/pip-mascot.png', 'image', 4, 7, 'kids', false, ARRAY['level1', 'mascot', 'character', 'main']);

-- Step 4: Link Assets to Lessons via lesson_materials
DO $$
DECLARE
  v_lesson_id UUID;
  v_asset_id UUID;
BEGIN
  -- Lesson 1.1
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '1.1 Hello, Pip!' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'The Hello Song' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Pip Flashcard Set' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Trace the Hello Worksheet' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 1.2
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '1.2 Colors of the Forest' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Pop the Red Balloon Game' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'I See Something Blue Audio' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Forest Background Slide' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 1.3
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '1.3 Counting Berries' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Five Little Birds Video' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Connect Numbers Worksheet' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Berry Sticker Pack' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 2.1
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '2.1 Meet the Family' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Family Tree Flashcard Set' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Baby Shark Family Song' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Draw Your Family Frame' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 2.2
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '2.2 Big Bear, Small Mouse' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Elephant vs Ant Comparison Slide' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Sort Big vs Small Game' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Big Stomp Small Tiptoe Audio' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 2.3
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '2.3 Who is he?' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Dress Up Interactive Board' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'He She Coloring Worksheet' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
  END IF;

  -- Lesson 3.1
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '3.1 Yummy Fruit' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = '3D Fruit Models' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Yummy Yummy Fruit Song' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Fruit Basket Flashcards' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 3); END IF;
  END IF;

  -- Lesson 3.2
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '3.2 Yucky Onion!' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Feed the Monster Game' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Broccoli Ice Cream Video' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'My Lunchbox Menu' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 3.3
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '3.3 The Picnic' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Munch Picnic Storybook' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Picnic Roleplay Script' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Munch Monster Character' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 4.1
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '4.1 Move Your Body' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Simon Says Dance Video' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Robot Actions GIF Set' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Fast Slow Music Pack' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 4.2
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '4.2 Sleepy Robot' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Day Night Switcher Slide' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Daily Routines Flashcards' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Freeze Dance Game' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 3); END IF;
  END IF;

  -- Lesson 4.3
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '4.3 I Can Fly!' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Superhero Cape Coloring' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Animal Abilities Video' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Robo Robot Character' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;

  -- Lesson 5.1
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '5.1 The Happy Sun' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Emoji Masks Prop Set' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'If You Are Happy Song' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Face Maker Interactive Slide' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 3); END IF;
  END IF;

  -- Lesson 5.2
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '5.2 The Angry Storm' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Thunder and Bird Sounds' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'The Grumpy Cloud Storybook' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Match Face to Weather Worksheet' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 3); END IF;
  END IF;

  -- Lesson 5.3 (Graduation)
  SELECT id INTO v_lesson_id FROM curriculum_lessons WHERE title = '5.3 How are you?' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Emotion Wheel Spin Game' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 1); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Level 1 Explorer Certificate' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, true, 2); END IF;
    SELECT id INTO v_asset_id FROM library_assets WHERE title = 'Cloudy Character' LIMIT 1;
    IF v_asset_id IS NOT NULL THEN INSERT INTO lesson_materials (lesson_id, asset_id, is_mandatory, display_order) VALUES (v_lesson_id, v_asset_id, false, 3); END IF;
  END IF;
END $$;
