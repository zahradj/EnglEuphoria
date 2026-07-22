
UPDATE public.curriculum_lessons
SET content = jsonb_set(
  jsonb_set(
    COALESCE(content, '{}'::jsonb),
    '{meta,esa_shape}',
    to_jsonb(COALESCE(content->'meta'->>'esa_shape', 'straight_arrow')),
    true
  ),
  '{meta,chunk_targets}',
  to_jsonb(COALESCE((content->'meta'->>'chunk_targets')::int, jsonb_array_length(COALESCE(content->'meta'->'chunks', '[]'::jsonb)), 3)),
  true
)
WHERE target_system IN ('kids','playground')
  AND (
    NOT (content ? 'meta')
    OR NOT (content->'meta' ? 'esa_shape')
    OR NOT (content->'meta' ? 'chunk_targets')
  );
