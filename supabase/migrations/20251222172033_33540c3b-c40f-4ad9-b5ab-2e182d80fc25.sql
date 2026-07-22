-- Temporarily disable RLS on these tables for seeding
ALTER TABLE curriculum_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_lessons DISABLE ROW LEVEL SECURITY;

-- Insert the Magic Forest Unit
INSERT INTO curriculum_units (
    title, 
    description,
    unit_number,
    cefr_level,
    age_group,
    learning_objectives,
    is_published
)
SELECT 
    'The Magic Forest',
    'Meet Pip the Parrot and learn colors, greetings, and counting!',
    1,
    'Pre-A1',
    'kids',
    ARRAY['Learn basic greetings', 'Identify colors', 'Count 1-10'],
    true
WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_units WHERE title = 'The Magic Forest'
);

-- Insert the three Magic Forest lessons
INSERT INTO curriculum_lessons (
    unit_id,
    title,
    description,
    sequence_order,
    target_system,
    is_published,
    difficulty_level,
    duration_minutes,
    xp_reward
)
SELECT 
    (SELECT id FROM curriculum_units WHERE title = 'The Magic Forest'),
    lesson_data.title,
    lesson_data.description,
    lesson_data.seq,
    'kids',
    true,
    'beginner',
    30,
    100
FROM (VALUES 
    ('Hello, Pip!', 'Greetings and introductions with Pip the Parrot', 1),
    ('Colors of the Forest', 'Learn color vocabulary through forest exploration', 2),
    ('Counting Berries', 'Numbers 1-10 with berry counting activities', 3)
) AS lesson_data(title, description, seq)
WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_lessons WHERE title = 'Hello, Pip!'
);

-- Re-enable RLS on these tables
ALTER TABLE curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;