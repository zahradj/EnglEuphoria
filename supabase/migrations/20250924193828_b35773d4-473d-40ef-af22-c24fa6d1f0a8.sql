INSERT INTO lessons_content (
  title,
  topic, 
  cefr_level,
  module_number,
  lesson_number,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  difficulty_level,
  duration_minutes,
  slides_content,
  is_active
) VALUES (
  'Greetings & Self-Introduction',
  'All About Me',
  'A1',
  1,
  1,
  ARRAY['Greet others and say goodbye', 'Introduce themselves: My name is...', 'Ask: What''s your name?', 'Reply politely: Nice to meet you', 'Recognize and pronounce Aa words'],
  ARRAY['Hello', 'Hi', 'Goodbye', 'Bye', 'My name is', 'What''s your name', 'Nice to meet you'],
  ARRAY['My name is...', 'What''s your name?', 'Nice to meet you'],
  'beginner',
  30,
  '{"version": "2.0", "theme": "mist-blue", "durationMin": 30}',
  true
);