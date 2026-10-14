-- A1 Unit 4 Food Festival (docs/a1-unit-4-food.md, owner-approved 2026-10-13: "next").
-- RUN ONLY AFTER the branch is merged into main (the live site must not show new titles over the old lessons).
-- Check first which rows exist:
--   select slot_lesson_number, title, is_published, ai_metadata->>'contentFormat' from curriculum_lessons
--   where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' order by 1;
update curriculum_lessons set title = 'Yummy Foods at the Festival', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' and slot_lesson_number = '1';
update curriculum_lessons set title = 'I Like Cooking!', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' and slot_lesson_number = '2';
update curriculum_lessons set title = 'Listen: Do You Like…?', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' and slot_lesson_number = '3';
update curriculum_lessons set title = 'I Like / I Don''t Like!', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' and slot_lesson_number = '4';
update curriculum_lessons set title = 'Storybook: Chef Cilla''s Recipe', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' and slot_lesson_number = '5';
update curriculum_lessons set title = 'Extra Practice: Festival Café', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' and slot_lesson_number = '6';
update curriculum_lessons set title = 'Boss Test: Festival Feast!', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4' and slot_lesson_number = '7';
-- All seven are built: the Food Festival world plays through /playground-scene/food-lesson-N (contentFormat 'food-rich').
update curriculum_lessons set ai_metadata = ai_metadata || jsonb_build_object('contentFormat', 'food-rich', 'unit_number', 4, 'lesson_number', slot_lesson_number::int), updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '4';
-- Publishing (is_published = true) only after the owner has checked the lessons on the live site.
