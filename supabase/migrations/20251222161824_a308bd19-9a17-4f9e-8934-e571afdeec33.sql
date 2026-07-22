
-- Level 2: "The Nest" - System A (Kids 4-7)
-- Lessons were already inserted by previous migration, now add assets

-- Insert library assets for Level 2
DELETE FROM library_assets WHERE system_tag = 'kids' AND tags @> ARRAY['level2'];

INSERT INTO library_assets (title, description, file_url, file_type, system_tag, min_age, max_age, tags)
VALUES
-- Unit 1 Assets
('Rainbow Colors Song', 'Catchy song teaching primary and secondary colors', '/assets/kids/level2/rainbow-song.mp4', 'video', 'kids', 4, 7, ARRAY['level2', 'unit1', 'colors', 'song']),
('Shape Sorting Game', 'Interactive game to identify and sort shapes', '/assets/kids/level2/shape-sort.html', 'interactive_quiz', 'kids', 4, 7, ARRAY['level2', 'unit1', 'shapes', 'game']),
('Colors & Shapes Flashcards', 'Printable flashcards for colors and shapes', '/assets/kids/level2/color-shape-cards.pdf', 'pdf', 'kids', 4, 7, ARRAY['level2', 'unit1', 'flashcards']),

-- Unit 2 Assets
('Counting 1-20 Video', 'Fun animated counting video with characters', '/assets/kids/level2/counting-20.mp4', 'video', 'kids', 4, 7, ARRAY['level2', 'unit2', 'numbers', 'counting']),
('Number Bingo Cards', 'Printable bingo cards for numbers 1-20', '/assets/kids/level2/number-bingo.pdf', 'pdf', 'kids', 4, 7, ARRAY['level2', 'unit2', 'numbers', 'game']),
('Teen Numbers Quiz', 'Interactive quiz for numbers 11-20', '/assets/kids/level2/teen-numbers-quiz.html', 'interactive_quiz', 'kids', 4, 7, ARRAY['level2', 'unit2', 'numbers', 'quiz']),

-- Unit 3 Assets
('Head Shoulders Knees Toes', 'Classic body parts song with actions', '/assets/kids/level2/body-song.mp4', 'video', 'kids', 4, 7, ARRAY['level2', 'unit3', 'body', 'song']),
('Body Parts Poster', 'Colorful labeled body parts poster', '/assets/kids/level2/body-poster.pdf', 'pdf', 'kids', 4, 7, ARRAY['level2', 'unit3', 'body', 'poster']),
('Feelings Faces Game', 'Match emotions to facial expressions', '/assets/kids/level2/feelings-game.html', 'interactive_quiz', 'kids', 4, 7, ARRAY['level2', 'unit3', 'emotions', 'game']),

-- Unit 4 Assets
('Fruit Song Video', 'Colorful video introducing fruits', '/assets/kids/level2/fruit-song.mp4', 'video', 'kids', 4, 7, ARRAY['level2', 'unit4', 'food', 'fruit', 'song']),
('Food Flashcards', 'Fruits and vegetables flashcard set', '/assets/kids/level2/food-cards.pdf', 'pdf', 'kids', 4, 7, ARRAY['level2', 'unit4', 'food', 'flashcards']),
('Healthy Plate Builder', 'Build a balanced meal interactively', '/assets/kids/level2/healthy-plate.html', 'interactive_quiz', 'kids', 4, 7, ARRAY['level2', 'unit4', 'food', 'game']),

-- Unit 5 Assets
('Weather Report Video', 'Kids present weather in fun video', '/assets/kids/level2/weather-report.mp4', 'video', 'kids', 4, 7, ARRAY['level2', 'unit5', 'weather', 'song']),
('Seasons Wheel Printable', 'Interactive seasons wheel craft', '/assets/kids/level2/seasons-wheel.pdf', 'pdf', 'kids', 4, 7, ARRAY['level2', 'unit5', 'seasons', 'craft']),
('Dress for Weather Game', 'Choose clothing for different weather', '/assets/kids/level2/dress-weather.html', 'interactive_quiz', 'kids', 4, 7, ARRAY['level2', 'unit5', 'weather', 'clothing', 'game']),

-- Level 2 Certificate
('The Nest Certificate', 'Level 2 completion certificate template', '/assets/kids/level2/nest-certificate.pdf', 'pdf', 'kids', 4, 7, ARRAY['level2', 'certificate', 'completion']);

-- Link assets to Level 2 lessons
INSERT INTO lesson_materials (lesson_id, asset_id, display_order)
SELECT cl.id, la.id, 1
FROM curriculum_lessons cl
CROSS JOIN library_assets la
WHERE cl.target_system = 'kids' 
  AND cl.difficulty_level = 'beginner'
  AND cl.level_id = (SELECT id FROM curriculum_levels WHERE level_order = 2)
  AND (
    (cl.content->>'unit' = '1' AND la.tags @> ARRAY['level2', 'unit1']) OR
    (cl.content->>'unit' = '2' AND la.tags @> ARRAY['level2', 'unit2']) OR
    (cl.content->>'unit' = '3' AND la.tags @> ARRAY['level2', 'unit3']) OR
    (cl.content->>'unit' = '4' AND la.tags @> ARRAY['level2', 'unit4']) OR
    (cl.content->>'unit' = '5' AND la.tags @> ARRAY['level2', 'unit5'])
  )
  AND NOT EXISTS (SELECT 1 FROM lesson_materials WHERE lesson_id = cl.id AND asset_id = la.id);
