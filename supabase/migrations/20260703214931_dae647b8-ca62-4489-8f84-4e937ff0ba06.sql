
WITH units(unit_num, theme) AS (
  VALUES
    (1, 'My Family'), (2, 'Colors & Shapes'), (3, 'Animals & Pets'),
    (4, 'Yummy Food'), (5, 'Toys & Play'), (6, 'My Body'),
    (7, 'Weather & Clothes'), (8, 'Numbers 1-10'),
    (9, 'My Happy Home'), (10, 'Outdoor Adventure')
),
shapes(lesson_num, cycle_type, shape, title_suffix) AS (
  VALUES
    (1, 'discovery',     'vocab_intro',    'Meet the Words'),
    (2, 'ladder',        'phonics_sounds', 'Sounds & Letters'),
    (3, 'bridge',        'story_time',     'Story Time'),
    (4, 'reinforcement', 'song_chant',     'Song & Chant'),
    (5, 'reinforcement', 'speaking_play',  'Speaking Play'),
    (6, 'quiz',          'mastery_quiz',   'Big Fun Quiz')
)
INSERT INTO public.curriculum_lessons (
  title, description, target_system, difficulty_level, duration_minutes,
  is_published, language, cycle_type, ai_metadata,
  qa_verdict, governance_status, order_index, sequence_order
)
SELECT
  u.theme || ': ' || s.title_suffix,
  'Playground A1 lesson for early-years learners exploring ' || u.theme || '.',
  'kids', 'beginner', 30, false, 'en', s.cycle_type,
  jsonb_build_object(
    'cefr_level', 'A1',
    'unit_number', u.unit_num::text,
    'lesson_number', s.lesson_num::text,
    'hub', 'playground',
    'theme', u.theme,
    'shape', s.shape
  ),
  'never_run', 'pending',
  (u.unit_num - 1) * 6 + s.lesson_num,
  (u.unit_num - 1) * 6 + s.lesson_num
FROM units u CROSS JOIN shapes s
WHERE NOT EXISTS (
  SELECT 1 FROM public.curriculum_lessons cl
  WHERE cl.target_system='kids'
    AND cl.slot_cefr_level='A1'
    AND cl.slot_unit_number = u.unit_num::text
    AND cl.slot_lesson_number = s.lesson_num::text
);
