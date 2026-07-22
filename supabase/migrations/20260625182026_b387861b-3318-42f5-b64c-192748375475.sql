-- Backfill curriculum metadata on legacy playground lessons so they satisfy
-- the new pedagogical pipeline contract (unit_theme, communication_goal,
-- grammar_target, story_goal, lesson_kind). Idempotent — only writes keys
-- when missing, and tags rows with needs_regeneration so creators can opt-in
-- to a fresh AI regeneration instead of mass auto-regen.

WITH targets AS (
  SELECT cl.id,
         COALESCE(cl.content, '{}'::jsonb) AS content,
         COALESCE(cl.title, '') AS title,
         cu.title AS unit_title,
         -- lesson_number is stored on ai_metadata or content
         COALESCE(
           NULLIF(cl.content->>'lesson_number','')::int,
           NULLIF(cl.ai_metadata->>'lesson_number','')::int,
           1
         ) AS lesson_number,
         COALESCE(
           NULLIF(cl.content->>'topic',''),
           NULLIF(cl.ai_metadata->>'topic',''),
           cl.title,
           'Lesson'
         ) AS topic
  FROM public.curriculum_lessons cl
  LEFT JOIN public.curriculum_units cu ON cu.id = cl.unit_id
  WHERE cl.target_system = 'playground'
    AND (
      cl.content->>'unit_theme' IS NULL
      OR cl.content->>'communication_goal' IS NULL
      OR cl.content->>'grammar_target' IS NULL
      OR cl.content->>'lesson_kind' IS NULL
    )
)
UPDATE public.curriculum_lessons cl
SET content = t.content
  || jsonb_build_object(
       'unit_theme',         COALESCE(t.content->>'unit_theme', t.unit_title, t.topic),
       'communication_goal', COALESCE(t.content->>'communication_goal',
                                      'Use ' || t.topic || ' in real communication'),
       'grammar_target',     COALESCE(t.content->>'grammar_target', 'TBD'),
       'story_goal',         COALESCE(t.content->>'story_goal',
                                      CASE WHEN t.lesson_number = 4
                                           THEN 'Apply ' || t.topic || ' through a short narrative'
                                           ELSE NULL END),
       'lesson_kind',        COALESCE(t.content->>'lesson_kind',
                                      CASE t.lesson_number
                                        WHEN 1 THEN 'warmup'
                                        WHEN 2 THEN 'vocabulary'
                                        WHEN 3 THEN 'grammar'
                                        WHEN 4 THEN 'storybook'
                                        WHEN 5 THEN 'practice'
                                        WHEN 6 THEN 'review'
                                        WHEN 7 THEN 'assessment'
                                        ELSE 'lesson'
                                      END),
       'metadata_backfilled', true,
       'needs_regeneration',  true
     )
FROM targets t
WHERE cl.id = t.id;
