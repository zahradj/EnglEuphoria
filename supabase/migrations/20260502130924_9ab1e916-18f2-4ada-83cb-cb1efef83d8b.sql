
WITH new_level AS (
  INSERT INTO public.curriculum_levels
    (name, cefr_level, age_group, description, level_order, target_system, track_id, sequence_order)
  VALUES
    ('A1 – Starter Crew', 'A1', 'teen', 'A1 starter level for Academy Hub teens — introductions, digital life, hobbies and everyday English.', 10, 'teen', 'c3c2b0f2-4245-4586-85d6-8a5b71480461', 1)
  RETURNING id
),
new_unit AS (
  INSERT INTO public.curriculum_units
    (title, description, unit_number, duration_weeks, age_group, cefr_level,
     learning_objectives, grammar_focus, vocabulary_themes, skills_focus, is_published)
  VALUES
    ('My Awesome Crew',
     'Introducing yourself and meeting new friends in English.',
     1, 1, 'teen', 'A1',
     ARRAY['Use "I am..." to introduce yourself','Say and ask for first names','Understand simple introductions','Make a confident first impression'],
     ARRAY['verb to be (I am / you are)','possessive my/your'],
     ARRAY['greetings','names','classroom language'],
     ARRAY['Speaking','Listening','Vocabulary','Grammar'],
     true)
  RETURNING id
),
linked AS (
  UPDATE public.curriculum_lessons cl
     SET level_id = (SELECT id FROM new_level),
         unit_id  = (SELECT id FROM new_unit),
         sequence_order = m.seq,
         is_published = true
    FROM (VALUES
      ('87a8163d-fa80-4768-9e7b-f7d4ccbb8d74'::uuid, 1),
      ('bb1487d8-551f-49d8-acb9-7d98f9b4f016'::uuid, 2),
      ('e7acc00b-807c-4125-96a1-4f22ec12812d'::uuid, 3),
      ('b2e15373-32fb-46ca-ab0b-0975f0863c68'::uuid, 4),
      ('e5b644b2-c0f6-4323-9a31-e16a917ddfb7'::uuid, 5)
    ) AS m(lesson_id, seq)
   WHERE cl.id = m.lesson_id
   RETURNING cl.id
)
INSERT INTO public.curriculum_lessons
  (title, description, target_system, difficulty_level, is_published,
   level_id, unit_id, sequence_order, skills_focus, content, ai_metadata)
SELECT
  'My Awesome Crew: Mastery Quiz',
  'End-of-unit Mastery Quiz. Students must score 80% to unlock Unit 2.',
  'teen', 'beginner', true,
  (SELECT id FROM new_level),
  (SELECT id FROM new_unit),
  6,
  ARRAY['Assessment','Grammar','Vocabulary','Listening'],
  jsonb_build_object('slides', '[]'::jsonb, 'homework_missions', '[]'::jsonb, 'needs_generation', true),
  jsonb_build_object(
    'source', 'auto-fix-unit-completion',
    'kind', 'standard',
    'cycle_type', 'mastery_quiz',
    'is_mastery_quiz', true,
    'pass_threshold', 80,
    'generated_at', now(),
    'blueprint_ref', jsonb_build_object(
      'unit_title', 'My Awesome Crew',
      'unit_number', 1,
      'lesson_number', 6,
      'title', 'My Awesome Crew: Mastery Quiz',
      'objective', 'Students demonstrate mastery of A1 introductions by scoring 80% or higher.',
      'unit_theme', 'Introducing self and friends',
      'skill_focus', 'Assessment'
    )
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.curriculum_lessons
   WHERE unit_id = (SELECT id FROM new_unit) AND sequence_order = 6
)
RETURNING id;
