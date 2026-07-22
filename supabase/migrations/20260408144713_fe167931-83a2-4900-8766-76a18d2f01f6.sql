
-- Delete all curriculum data (child tables first due to foreign keys)
DELETE FROM curriculum_lessons;
DELETE FROM curriculum_units;
DELETE FROM curriculum_levels;
