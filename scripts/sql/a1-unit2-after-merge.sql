-- A1 Unit 2 Jungle re-plan (docs/a1-unit-2-jungle.md, owner-approved 2026-10-13).
-- RUN ONLY AFTER the branch is merged into main (the live site must not show new titles over the old lessons).
-- Titles now match the code (jungle-adventure/scenes.ts). Check first which rows exist:
--   select slot_lesson_number, title, is_published from curriculum_lessons
--   where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '2' order by 1;
update curriculum_lessons set title = 'Jungle Animals', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '2' and slot_lesson_number = '1';
update curriculum_lessons set title = 'Can It…?', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '2' and slot_lesson_number = '3';
update curriculum_lessons set title = 'Extra Practice: Jungle Game Day!', updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '2' and slot_lesson_number = '6';
-- Lessons 3-7 are now built: mark them ready in the Playground Library (same contentFormat as Lessons 1-2 use).
update curriculum_lessons set ai_metadata = ai_metadata || jsonb_build_object('contentFormat', coalesce(
  (select ai_metadata->>'contentFormat' from curriculum_lessons where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '2' and slot_lesson_number = '2' limit 1), 'wt-rich')), updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '2' and slot_lesson_number in ('3', '4', '5', '6', '7');
