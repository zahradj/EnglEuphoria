-- Insert sample tracks for each system (if not already inserted)
INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Seed Level', 'kids', 'Plant the seeds of English! Perfect for absolute beginners aged 4-6.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Seed Level' AND target_system = 'kids');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Sprout Level', 'kids', 'Watch your English grow! For young learners aged 5-7 who know some basics.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Sprout Level' AND target_system = 'kids');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Bloom Level', 'kids', 'Blossom into confident speakers! For children aged 7-10 ready to flourish.', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Bloom Level' AND target_system = 'kids');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Explorer Track', 'teen', 'Begin your academic journey. Master fundamental grammar and vocabulary for school success.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Explorer Track' AND target_system = 'teen');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Challenger Track', 'teen', 'Level up your skills. Prepare for exams and real-world communication.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Challenger Track' AND target_system = 'teen');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Master Track', 'teen', 'Achieve fluency and academic excellence. Advanced preparation for university and beyond.', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Master Track' AND target_system = 'teen');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Foundation Course', 'adult', 'Build solid fundamentals. Perfect for beginners returning to English or starting fresh.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Foundation Course' AND target_system = 'adult');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Business English', 'adult', 'Master professional communication. Emails, presentations, and workplace conversations.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Business English' AND target_system = 'adult');

INSERT INTO public.tracks (id, name, target_system, description, order_index, is_published) 
SELECT gen_random_uuid(), 'Advanced Fluency', 'adult', 'Achieve native-like proficiency. Idioms, cultural nuances, and sophisticated expression.', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.tracks WHERE name = 'Advanced Fluency' AND target_system = 'adult');

-- Link existing curriculum_levels to tracks (update track_id based on matching age_group to target_system)
UPDATE public.curriculum_levels cl
SET track_id = (
  SELECT t.id FROM public.tracks t 
  WHERE 
    (cl.age_group = 'kids' AND t.target_system = 'kids') OR
    (cl.age_group = 'teens' AND t.target_system = 'teen') OR
    (cl.age_group = 'adults' AND t.target_system = 'adult')
  ORDER BY t.order_index
  LIMIT 1
)
WHERE cl.track_id IS NULL;

-- Insert sample library assets
INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags, min_age, max_age) 
SELECT 'ABC Song Video', 'Fun animated video teaching the alphabet with catchy music', 'https://example.com/abc-song.mp4', 'video', 'kids', false, ARRAY['alphabet', 'phonics', 'songs'], 4, 8
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'ABC Song Video');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags, min_age, max_age) 
SELECT 'Colors Flashcards PDF', 'Printable flashcards with colorful illustrations', 'https://example.com/colors-flashcards.pdf', 'pdf', 'kids', false, ARRAY['colors', 'vocabulary', 'printable'], 4, 7
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Colors Flashcards PDF');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags, min_age, max_age) 
SELECT 'Animal Sounds Quiz', 'Interactive quiz matching animals to their sounds', 'https://example.com/animal-quiz', 'interactive_quiz', 'kids', false, ARRAY['animals', 'listening', 'game'], 5, 9
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Animal Sounds Quiz');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags) 
SELECT 'Teacher Guide: Early Phonics', 'Comprehensive phonics teaching methodology', 'https://example.com/phonics-guide.pdf', 'pdf', 'kids', true, ARRAY['phonics', 'teaching', 'methodology']
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Teacher Guide: Early Phonics');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags, min_age, max_age) 
SELECT 'Grammar Essentials Workbook', 'Complete grammar exercises for intermediate learners', 'https://example.com/grammar-workbook.pdf', 'pdf', 'teen', false, ARRAY['grammar', 'exercises', 'B1'], 12, 18
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Grammar Essentials Workbook');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags, min_age, max_age) 
SELECT 'TED Talk: Communication Skills', 'Inspiring video on effective communication', 'https://example.com/ted-talk.mp4', 'video', 'teen', false, ARRAY['speaking', 'inspiration', 'advanced'], 13, 19
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'TED Talk: Communication Skills');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags, min_age, max_age) 
SELECT 'Business Email Templates', 'Professional email templates for various situations', 'https://example.com/email-templates.pdf', 'pdf', 'adult', false, ARRAY['business', 'writing', 'professional'], 18, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Business Email Templates');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags, min_age, max_age) 
SELECT 'Presentation Skills Masterclass', 'Video course on confident presenting in English', 'https://example.com/presentation-course.mp4', 'video', 'adult', false, ARRAY['speaking', 'presentation', 'business'], 18, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Presentation Skills Masterclass');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags) 
SELECT 'Pronunciation Audio Library', 'Native speaker recordings of common words', 'https://example.com/pronunciation.mp3', 'audio', 'all', false, ARRAY['pronunciation', 'listening', 'reference']
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Pronunciation Audio Library');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags) 
SELECT 'English Grammar Reference', 'Complete grammar reference for all levels', 'https://example.com/grammar-ref.pdf', 'pdf', 'all', false, ARRAY['grammar', 'reference', 'all-levels']
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'English Grammar Reference');

INSERT INTO public.library_assets (title, description, file_url, file_type, system_tag, is_teacher_only, tags) 
SELECT 'Teacher Resource Pack', 'Lesson plans and activities for teachers', 'https://example.com/teacher-pack.pdf', 'pdf', 'all', true, ARRAY['teaching', 'lesson-plans', 'activities']
WHERE NOT EXISTS (SELECT 1 FROM public.library_assets WHERE title = 'Teacher Resource Pack');