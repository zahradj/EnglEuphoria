-- Seed UNIT mode quick actions (20 total - 5 per age group)
INSERT INTO public.curriculum_quick_actions (age_group, mode, button_label, prompt_text, category, order_index, icon) VALUES
-- Ages 5-7
('5-7', 'unit', '4-Week Animals Unit', 'Create a 4-week unit for ages 5-7 (Pre-A1/A1) on ''Animals''. Include lessons on animal names, sounds, habitats, and movements. Final project: ''My Favorite Animal Poster''. Use songs, TPR activities, and picture stories.', 'unit', 1, 'Package'),
('5-7', 'unit', 'Family & Friends Unit', 'Design a 6-week unit for ages 5-7 (A1) on ''Family & Friends''. Cover family members, possessive pronouns, describing people, and daily routines. Include role-play activities and a family tree project.', 'unit', 2, 'Users'),
('5-7', 'unit', 'Colors & Shapes Unit', 'Create a 4-week unit for ages 5-7 (Pre-A1) on ''Colors & Shapes''. Teach basic colors, shapes, sizes, and patterns through art activities, songs, and games.', 'unit', 3, 'Sparkles'),
('5-7', 'unit', 'Food & Drinks Unit', 'Design a 4-week unit for ages 5-7 (A1) on ''Food & Drinks''. Cover food vocabulary, likes/dislikes, healthy eating, and simple recipes. Final activity: ''My Healthy Plate'' craft.', 'unit', 4, 'BookOpen'),
('5-7', 'unit', 'Seasons & Weather Unit', 'Create a 6-week unit for ages 5-7 (A1) on ''Seasons & Weather''. Teach weather vocabulary, clothing for seasons, and seasonal activities through songs and crafts.', 'unit', 5, 'Calendar'),

-- Ages 8-11
('8-11', 'unit', 'Food & Health Unit', 'Create a 4-week unit for ages 8-11 (A2) on ''Food & Health''. Include lessons on food vocabulary, healthy eating dialogues, cooking instructions, and a final project: ''My Healthy Recipe Book''. Integrate reading about food groups and writing food descriptions.', 'unit', 6, 'Package'),
('8-11', 'unit', 'Travel & Adventure Unit', 'Design a 6-week unit for ages 8-11 (A2/B1) on ''Travel & Adventure''. Cover countries, transport, holiday activities, and past simple for travel stories. Final project: ''My Dream Vacation'' presentation.', 'unit', 7, 'Target'),
('8-11', 'unit', 'Technology & Innovation', 'Create an 8-week unit for ages 8-11 (B1) on ''Technology & Innovation''. Teach tech vocabulary, present perfect for recent inventions, comparatives for gadgets. Include debates and invention projects.', 'unit', 8, 'Sparkles'),
('8-11', 'unit', 'Environment & Nature', 'Design a 6-week unit for ages 8-11 (A2) on ''Environment & Nature''. Cover environmental vocabulary, modal verbs for suggestions, imperatives for instructions. Final project: eco-poster campaign.', 'unit', 9, 'BookOpen'),
('8-11', 'unit', 'Sports & Competition', 'Create a 4-week unit for ages 8-11 (A2) on ''Sports & Competition''. Teach sports vocabulary, adverbs of manner, present continuous for current events. Include mini-sports commentary project.', 'unit', 10, 'Target'),

-- Ages 12-14
('12-14', 'unit', 'Social Media & Communication', 'Create a 6-week unit for ages 12-14 (B1) on ''Social Media & Communication''. Cover digital communication, present perfect continuous, phrasal verbs. Include debates on online safety and creating digital content.', 'unit', 11, 'MessageSquare'),
('12-14', 'unit', 'Future Careers & Skills', 'Design an 8-week unit for ages 12-14 (B1/B2) on ''Future Careers & Skills''. Teach job vocabulary, future forms, conditionals. Include career research projects and interview role-plays.', 'unit', 12, 'GraduationCap'),
('12-14', 'unit', 'Global Issues & Solutions', 'Create a 6-week unit for ages 12-14 (B1) on ''Global Issues''. Cover social issues, passive voice, reported speech. Final project: UN-style debate and solution proposals.', 'unit', 13, 'Target'),
('12-14', 'unit', 'Arts & Entertainment', 'Design a 4-week unit for ages 12-14 (B1) on ''Arts & Entertainment''. Teach entertainment vocabulary, review forms, expressing opinions. Include film/music reviews and creative projects.', 'unit', 14, 'Sparkles'),
('12-14', 'unit', 'Science & Discovery', 'Create a 6-week unit for ages 12-14 (B1/B2) on ''Science & Discovery''. Cover scientific vocabulary, passive structures, cause-effect relationships. Include experiment reports and presentations.', 'unit', 15, 'BookOpen'),

-- Ages 15-17
('15-17', 'unit', 'Academic Writing Skills', 'Create an 8-week unit for ages 15-17 (B2) on ''Academic Writing''. Cover essay structures, formal language, linking devices, and research skills. Include writing various essay types and peer review sessions.', 'unit', 16, 'FileText'),
('15-17', 'unit', 'Critical Thinking & Debate', 'Design a 6-week unit for ages 15-17 (B2/C1) on ''Critical Thinking''. Teach argumentation, advanced conditionals, discourse markers. Include structured debates and persuasive speeches.', 'unit', 17, 'MessageSquare'),
('15-17', 'unit', 'Literature & Analysis', 'Create an 8-week unit for ages 15-17 (B2) on ''Literature Analysis''. Cover literary terms, narrative tenses, figurative language. Analyze short stories and write literary essays.', 'unit', 18, 'BookMarked'),
('15-17', 'unit', 'Business English Basics', 'Design a 6-week unit for ages 15-17 (B1/B2) on ''Business English''. Teach business vocabulary, formal correspondence, negotiation language. Include mock interviews and business presentations.', 'unit', 19, 'Target'),
('15-17', 'unit', 'Exam Preparation (FCE)', 'Create an 8-week exam prep unit for ages 15-17 (B2) for Cambridge FCE. Cover all exam tasks, strategies, and practice. Include timed practice tests and feedback sessions.', 'unit', 20, 'ClipboardCheck')
ON CONFLICT DO NOTHING;