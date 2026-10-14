-- A1 Unit 9 Lesson 4 "There Is / There Are in My Room!" (docs/a1-unit-9-lesson-4.md, owner OK 2026-10-13: "yes").
-- RUN ONLY AFTER the branch is merged into main (the live site must not show a new title over a page it doesn't have).
-- Check first:
--   select slot_lesson_number, title, is_published, ai_metadata->>'contentFormat' from curriculum_lessons
--   where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '9' order by 1;
update curriculum_lessons
set title = 'There Is / There Are in My Room!',
    ai_metadata = ai_metadata || jsonb_build_object('contentFormat', 'castle-rich', 'unit_number', 9, 'lesson_number', 4),
    updated_at = now()
where ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1' and slot_unit_number = '9' and slot_lesson_number = '4';
-- Plays at /playground-scene/castle-lesson-4. Publishing (is_published = true) only after the owner has checked it live.
