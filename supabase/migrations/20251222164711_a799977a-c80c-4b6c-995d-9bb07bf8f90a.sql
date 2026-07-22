-- LIBRARY ASSETS FOR ADULT/PRO TRACK (Using valid type values)
INSERT INTO curriculum_materials (title, description, type, file_type, cefr_level, tags, is_public)
VALUES 
-- Unit 1 Assets
('The 30-Second Intro Script', 'Professional introduction template for networking events', 'activity', 'text/template', 'A1', ARRAY['business', 'networking', 'introduction', 'adult'], true),
('Professional Accents Audio Pack', '3 distinct accents (US, UK, Australian) introducing themselves professionally', 'audio', 'audio/mp3', 'A1', ARRAY['business', 'listening', 'accents', 'adult'], true),
('Business Card Breakdown', 'Interactive slide explaining business card elements and etiquette', 'activity', 'interactive/slide', 'A1', ARRAY['business', 'networking', 'vocabulary', 'adult'], true),
('Modern Jobs Flashcards', 'Professional job titles: Developer, Analyst, Consultant, Manager', 'activity', 'image/set', 'A1', ARRAY['business', 'vocabulary', 'professions', 'adult'], true),
('LinkedIn Profile Mockups', 'Example professional profiles for reading practice', 'reading', 'text/profile', 'A1', ARRAY['business', 'reading', 'social-media', 'adult'], true),
('What Do You Do? Street Interviews', 'Video of professionals describing their work', 'video', 'video/mp4', 'A1', ARRAY['business', 'listening', 'professions', 'adult'], true),
('Conference Registration Form', 'Listening fill-in-the-blank exercise for contact information', 'worksheet', 'application/pdf', 'A1', ARRAY['business', 'listening', 'numbers', 'adult'], true),
('Email Address Spelling Interactive', 'Practice spelling emails with @, dot, underscore pronunciation', 'activity', 'interactive/form', 'A1', ARRAY['business', 'speaking', 'contact-info', 'adult'], true),

-- Unit 2 Assets
('Airport Signage Gallery', 'Real airport signs: Customs, Gates, Baggage, Immigration', 'reading', 'image/real_world', 'A1', ARRAY['travel', 'vocabulary', 'airport', 'adult'], true),
('Immigration Roleplay Script', 'Dialogue between immigration officer and business traveler', 'activity', 'text/script', 'A1', ARRAY['travel', 'speaking', 'airport', 'adult'], true),
('Hotel Reception Problem Audio', 'Listening exercise: solving issues at hotel front desk', 'audio', 'audio/mp3', 'A1', ARRAY['travel', 'listening', 'hotel', 'adult'], true),
('Hotel Booking Confirmation', 'Reading comprehension document with booking details', 'reading', 'document/booking', 'A1', ARRAY['travel', 'reading', 'hotel', 'adult'], true),
('Hotel Amenities Vocabulary', 'Visual list of business hotel amenities', 'activity', 'slide/list', 'A1', ARRAY['travel', 'vocabulary', 'hotel', 'adult'], true),
('City Navigation Map', 'Interactive city grid for direction practice', 'game', 'interactive/map', 'A1', ARRAY['travel', 'directions', 'navigation', 'adult'], true),
('Taxi Dialogue Script', 'Professional conversation template for taxi rides', 'activity', 'text/script', 'A1', ARRAY['travel', 'speaking', 'transport', 'adult'], true),
('Rideshare App Mock UI', 'Simulated Uber-style interface for practice', 'activity', 'image/ui_mock', 'A1', ARRAY['travel', 'vocabulary', 'technology', 'adult'], true),

-- Unit 3 Assets
('Professional Cafe Menu', 'Starbucks-style menu with sizes, options, and customizations', 'reading', 'document/menu', 'A1', ARRAY['social', 'vocabulary', 'food', 'adult'], true),
('Barista Interactions Video', 'Video of coffee shop ordering scenarios', 'video', 'video/mp4', 'A1', ARRAY['social', 'listening', 'food', 'adult'], true),
('Paying the Bill Roleplay', 'Script for handling payment in social situations', 'activity', 'text/script', 'A1', ARRAY['social', 'speaking', 'money', 'adult'], true),
('Work-Life Balance Article', 'Magazine-style reading about professional interests', 'reading', 'text/article', 'A1', ARRAY['social', 'reading', 'hobbies', 'adult'], true),
('Find Someone Who Survey', 'Networking activity worksheet for classroom use', 'worksheet', 'application/pdf', 'A1', ARRAY['social', 'speaking', 'hobbies', 'adult'], true),
('Professional Hobbies Slide', 'Common executive hobbies: Golf, Tennis, Travel, Wine', 'activity', 'slide/ppt', 'A1', ARRAY['social', 'vocabulary', 'hobbies', 'adult'], true),
('Outlook Calendar Interface', 'Interactive calendar for scheduling practice', 'game', 'interactive/calendar', 'A1', ARRAY['business', 'scheduling', 'technology', 'adult'], true),
('Rescheduling Voicemail', 'Audio message about changing meeting times', 'audio', 'audio/mp3', 'A1', ARRAY['business', 'listening', 'scheduling', 'adult'], true),

-- Unit 4 Assets
('The Bad Email Case Study', 'Email with common mistakes for correction practice', 'reading', 'text/case_study', 'A1', ARRAY['business', 'writing', 'email', 'adult'], true),
('Out of Office Template', 'Professional automatic reply template', 'activity', 'text/template', 'A1', ARRAY['business', 'writing', 'email', 'adult'], true),
('Email Vocabulary List', 'Key terms: Attachment, Forward, CC, BCC, Thread', 'activity', 'slide/list', 'A1', ARRAY['business', 'vocabulary', 'email', 'adult'], true),
('Rude vs Polite Sorter', 'Interactive quiz categorizing professional phrases', 'game', 'interactive/quiz', 'A1', ARRAY['business', 'grammar', 'politeness', 'adult'], true),
('Sentence Rewriting Worksheet', 'Transform direct requests into polite versions', 'worksheet', 'text/worksheet', 'A1', ARRAY['business', 'writing', 'grammar', 'adult'], true),
('Doodle Poll Simulation', 'Interactive tool for finding meeting times', 'game', 'interactive/tool', 'A1', ARRAY['business', 'scheduling', 'technology', 'adult'], true),
('Meeting Agenda Template', 'Professional meeting agenda PDF template', 'reading', 'document/agenda', 'A1', ARRAY['business', 'reading', 'meetings', 'adult'], true),

-- Unit 5 Assets
('Sales Performance Chart', 'Graph showing Up/Down/Stable trends for analysis', 'reading', 'image/chart', 'A1', ARRAY['business', 'vocabulary', 'reporting', 'adult'], true),
('Project Launch Timeline', 'Story timeline of a project from start to completion', 'reading', 'text/timeline', 'A1', ARRAY['business', 'reading', 'projects', 'adult'], true),
('-ed Pronunciation Drill', 'Audio exercises for /t/, /d/, /id/ endings', 'audio', 'audio/drill', 'A1', ARRAY['business', 'pronunciation', 'grammar', 'adult'], true),
('Client Complaint Audio', 'Listening exercise about handling customer issues', 'audio', 'audio/mp3', 'A1', ARRAY['business', 'listening', 'problem-solving', 'adult'], true),
('Irregular Past Verbs Flashcards', 'Go-Went, Buy-Bought, Send-Sent, etc.', 'activity', 'image/set', 'A1', ARRAY['business', 'grammar', 'verbs', 'adult'], true),
('Why We Lost the Deal Case', 'Case study for past tense narrative practice', 'reading', 'text/case', 'A1', ARRAY['business', 'reading', 'analysis', 'adult'], true),
('Action Plan Spreadsheet', 'Template for creating professional action items', 'worksheet', 'document/spreadsheet', 'A1', ARRAY['business', 'writing', 'planning', 'adult'], true),
('A1 Professional Competence Certificate', 'Completion certificate for Professional Foundation level', 'assessment', 'pdf/cert', 'A1', ARRAY['business', 'achievement', 'certificate', 'adult'], true);