-- A1 Unit 3 Space Mission (docs/a1-unit-3-space.md, owner-approved 2026-10-13: "go").
-- RUN ONLY AFTER the branch is merged into main (the live site must not show new titles over the old lessons).
-- Check first which rows exist:
--   select slot_lesson_number, title, is_published, ai_metadata->>'contentFormat' from curriculum_lessons
--   where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' order by 1;
update curriculum_lessons set title = 'Count to 100 in Space!', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' and slot_lesson_number = '1';
update curriculum_lessons set title = 'Left, Right, Up, Down: Space Directions', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' and slot_lesson_number = '2';
update curriculum_lessons set title = 'The Counting Rocket Song', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' and slot_lesson_number = '3';
update curriculum_lessons set title = 'What''s the Weather on the Planets?', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' and slot_lesson_number = '4';
update curriculum_lessons set title = 'Storybook: The Lost Robot', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' and slot_lesson_number = '5';
update curriculum_lessons set title = 'Extra Practice: Space Game Day', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' and slot_lesson_number = '6';
update curriculum_lessons set title = 'Boss Test: Space Navigator!', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3' and slot_lesson_number = '7';
-- All seven are built: the Space world plays through /playground-scene/space-lesson-N (contentFormat 'space-rich').
update curriculum_lessons set ai_metadata = ai_metadata || jsonb_build_object('contentFormat', 'space-rich', 'unit_number', 3, 'lesson_number', slot_lesson_number::int), updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '3';
-- Publishing (is_published = true) only after the owner has checked the lessons on the live site.
