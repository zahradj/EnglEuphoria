
-- Insert Level 2 lessons (The Nest)
INSERT INTO curriculum_lessons (level_id, title, description, difficulty_level, target_system, duration_minutes, xp_reward, sequence_order, is_published, content)
SELECT 
  (SELECT id FROM curriculum_levels WHERE level_order = 2),
  title, description, difficulty_level, target_system, duration_minutes, xp_reward, sequence_order, is_published, content
FROM (VALUES
  ('Rainbow Friends', 'Learn primary and secondary colors through a magical rainbow adventure', 'beginner', 'kids', 30, 60, 1, true,
   '{"unit": 1, "unit_title": "Colors & Shapes Everywhere", "topic": "Primary Colors", "grammar": ["This is + color", "I see + color"], "vocabulary": ["red", "blue", "yellow", "green", "orange", "purple"], "hook": "A rainbow appears in the classroom!", "activities": ["Color mixing experiment", "Rainbow song", "Color hunt game"]}'::jsonb),
  
  ('Shape Detectives', 'Discover shapes hidden all around us', 'beginner', 'kids', 30, 60, 2, true,
   '{"unit": 1, "unit_title": "Colors & Shapes Everywhere", "topic": "Basic Shapes", "grammar": ["It is a + shape", "This is a + shape"], "vocabulary": ["circle", "square", "triangle", "rectangle", "star", "heart"], "hook": "Become a shape detective!", "activities": ["Shape scavenger hunt", "Shape song", "Shape art"]}'::jsonb),
  
  ('Color Shape Party', 'Combine colors and shapes in creative ways', 'beginner', 'kids', 30, 75, 3, true,
   '{"unit": 1, "unit_title": "Colors & Shapes Everywhere", "topic": "Colors + Shapes Combined", "grammar": ["I have a + color + shape", "Show me the + color + shape"], "vocabulary": ["big", "small", "pattern"], "hook": "Design your own flag!", "activities": ["Flag design", "Pattern making", "Unit review game"]}'::jsonb),

  ('Counting to Ten', 'Master numbers 1-10 with fun counting games', 'beginner', 'kids', 30, 60, 4, true,
   '{"unit": 2, "unit_title": "Numbers & Counting Fun", "topic": "Numbers 1-10 Review", "grammar": ["I have + number", "How many?"], "vocabulary": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"], "hook": "Count the magic beans!", "activities": ["Bean counting", "Number songs", "Finger counting"]}'::jsonb),
  
  ('Teen Numbers', 'Discover numbers 11-20 with exciting activities', 'beginner', 'kids', 30, 60, 5, true,
   '{"unit": 2, "unit_title": "Numbers & Counting Fun", "topic": "Numbers 11-20", "grammar": ["There are + number", "I count + number"], "vocabulary": ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"], "hook": "Count the treasure!", "activities": ["Treasure counting", "Number line hop", "Teen number song"]}'::jsonb),
  
  ('Number Games Galore', 'Practice all numbers 1-20 with games and challenges', 'beginner', 'kids', 30, 75, 6, true,
   '{"unit": 2, "unit_title": "Numbers & Counting Fun", "topic": "Numbers 1-20 Mastery", "grammar": ["How many + noun?", "I count + number + noun"], "vocabulary": ["count", "more", "less", "equal"], "hook": "Win the counting championship!", "activities": ["Number bingo", "Counting race", "Unit celebration"]}'::jsonb),

  ('Head to Toes', 'Learn body parts from head to toe', 'beginner', 'kids', 30, 60, 7, true,
   '{"unit": 3, "unit_title": "My Body, My Self", "topic": "Body Parts", "grammar": ["This is my + body part", "Touch your + body part"], "vocabulary": ["head", "shoulders", "knees", "toes", "eyes", "ears", "mouth", "nose"], "hook": "Meet Body Bot!", "activities": ["Head shoulders song", "Simon says", "Body poster"]}'::jsonb),
  
  ('Hands and Feet', 'Focus on hands, feet, and what they can do', 'beginner', 'kids', 30, 60, 8, true,
   '{"unit": 3, "unit_title": "My Body, My Self", "topic": "Hands and Feet Actions", "grammar": ["I can + action + with my + body part", "My + body part can + action"], "vocabulary": ["hands", "fingers", "feet", "toes", "clap", "stomp", "wave", "kick"], "hook": "Magic hands and dancing feet!", "activities": ["Hand print art", "Action songs", "Movement game"]}'::jsonb),
  
  ('Feelings Inside', 'Express emotions and feelings', 'beginner', 'kids', 30, 75, 9, true,
   '{"unit": 3, "unit_title": "My Body, My Self", "topic": "Emotions", "grammar": ["I feel + emotion", "Are you + emotion?", "Yes, I am / No, I am not"], "vocabulary": ["happy", "sad", "angry", "scared", "excited", "tired"], "hook": "The feelings monster!", "activities": ["Emotion charades", "Feelings faces", "Unit reflection"]}'::jsonb),

  ('Fruits I Love', 'Discover delicious fruits and express preferences', 'beginner', 'kids', 30, 60, 10, true,
   '{"unit": 4, "unit_title": "Food & Yummy Things", "topic": "Fruits", "grammar": ["I like + fruit", "Do you like + fruit?", "Yes, I do / No, I do not"], "vocabulary": ["apple", "banana", "orange", "grape", "strawberry", "watermelon"], "hook": "Visit the magical fruit garden!", "activities": ["Fruit tasting", "Fruit song", "Fruit memory game"]}'::jsonb),
  
  ('Veggie Power', 'Learn about vegetables and healthy eating', 'beginner', 'kids', 30, 60, 11, true,
   '{"unit": 4, "unit_title": "Food & Yummy Things", "topic": "Vegetables", "grammar": ["I eat + vegetable", "I do not eat + vegetable"], "vocabulary": ["carrot", "tomato", "potato", "cucumber", "broccoli", "corn"], "hook": "Superheroes eat veggies!", "activities": ["Veggie puppet show", "Healthy plate activity", "Veggie song"]}'::jsonb),
  
  ('Snack Time', 'Talk about snacks and mealtime', 'beginner', 'kids', 30, 75, 12, true,
   '{"unit": 4, "unit_title": "Food & Yummy Things", "topic": "Meals & Snacks", "grammar": ["I want + food", "Can I have + food, please?", "Yes, you can / No, you cannot"], "vocabulary": ["breakfast", "lunch", "dinner", "snack", "hungry", "thirsty"], "hook": "Plan a pretend picnic!", "activities": ["Picnic roleplay", "Menu creation", "Unit feast"]}'::jsonb),

  ('Sunny or Rainy?', 'Describe different types of weather', 'beginner', 'kids', 30, 60, 13, true,
   '{"unit": 5, "unit_title": "Weather & Seasons", "topic": "Weather Types", "grammar": ["It is + weather", "Is it + weather?", "Yes, it is / No, it is not"], "vocabulary": ["sunny", "rainy", "cloudy", "windy", "snowy", "hot", "cold"], "hook": "Be a weather reporter!", "activities": ["Weather forecast", "Weather song", "Weather art"]}'::jsonb),
  
  ('Four Seasons', 'Explore the four seasons and their characteristics', 'beginner', 'kids', 30, 60, 14, true,
   '{"unit": 5, "unit_title": "Weather & Seasons", "topic": "Seasons", "grammar": ["In + season, it is + weather", "I like + season"], "vocabulary": ["spring", "summer", "fall", "winter", "flowers", "leaves", "snow"], "hook": "Travel through the seasons!", "activities": ["Season wheel", "Season dress-up", "Season song"]}'::jsonb),
  
  ('What to Wear?', 'Match clothing to weather and seasons - Level 2 Finale', 'beginner', 'kids', 30, 100, 15, true,
   '{"unit": 5, "unit_title": "Weather & Seasons", "topic": "Weather & Clothing", "grammar": ["When it is + weather, I wear + clothing", "What do you wear in + season?"], "vocabulary": ["coat", "umbrella", "sunglasses", "boots", "hat", "shorts"], "hook": "Fashion show challenge!", "activities": ["Dress the character", "Weather fashion show", "Level 2 celebration"], "is_level_finale": true, "certificate": "The Nest Graduate"}'::jsonb)
) AS v(title, description, difficulty_level, target_system, duration_minutes, xp_reward, sequence_order, is_published, content);

-- Link assets to Level 2 lessons
INSERT INTO lesson_materials (lesson_id, asset_id, display_order)
SELECT cl.id, la.id, 1
FROM curriculum_lessons cl
CROSS JOIN library_assets la
WHERE cl.target_system = 'kids' 
  AND cl.level_id = (SELECT id FROM curriculum_levels WHERE level_order = 2)
  AND (
    (cl.content->>'unit' = '1' AND la.tags @> ARRAY['level2', 'unit1']) OR
    (cl.content->>'unit' = '2' AND la.tags @> ARRAY['level2', 'unit2']) OR
    (cl.content->>'unit' = '3' AND la.tags @> ARRAY['level2', 'unit3']) OR
    (cl.content->>'unit' = '4' AND la.tags @> ARRAY['level2', 'unit4']) OR
    (cl.content->>'unit' = '5' AND la.tags @> ARRAY['level2', 'unit5'])
  )
  AND NOT EXISTS (SELECT 1 FROM lesson_materials WHERE lesson_id = cl.id AND asset_id = la.id);
