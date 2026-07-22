-- Insert Unit 0, Lesson 1: My name is ____. Nice to meet you!
INSERT INTO public.lessons_content (
  module_number,
  lesson_number,
  title,
  topic,
  cefr_level,
  difficulty_level,
  duration_minutes,
  learning_objectives,
  vocabulary_focus,
  grammar_focus,
  is_active,
  metadata
) VALUES (
  0,
  1,
  'My name is ____. Nice to meet you!',
  'Basic Greetings and Introductions',
  'Pre-A1',
  'beginner',
  30,
  ARRAY[
    'Learn personal introductions',
    'Practice basic greetings',
    'Use "My name is..." structure',
    'Learn polite expressions'
  ],
  ARRAY[
    'Hello',
    'Hi',
    'My name is',
    'What''s your name?',
    'Nice to meet you',
    'Goodbye',
    'See you later',
    'Ant',
    'Apple'
  ],
  ARRAY[
    '"My name is..." introduction',
    'Basic greeting structures',
    'Simple question patterns'
  ],
  true,
  jsonb_build_object(
    'hasGamification', true,
    'hasAudio', true,
    'hasInteractiveElements', true,
    'ageAppropriate', true,
    'characterBased', true,
    'characters', ARRAY['SpongeBob', 'Spider-Man'],
    'totalXP', 180,
    'estimatedCompletionTime', '30 minutes',
    'skillAreas', ARRAY['speaking', 'listening', 'vocabulary', 'grammar']
  )
)
ON CONFLICT DO NOTHING;