-- Seed remaining 88 quick actions for Curriculum, Assessment, Mission, and Resource modes
-- Total breakdown: Curriculum (16), Assessment (24), Mission (24), Resource (24)

INSERT INTO curriculum_quick_actions (age_group, mode, button_label, prompt_text, category, order_index, icon)
VALUES
-- ============================================
-- CURRICULUM MODE (16 actions - 4 per age group)
-- ============================================

-- Ages 5-7 Curriculum (4 actions)
('5-7', 'curriculum', 'Full Year Program Pre-A1', 
 'Create a complete 36-week curriculum for ages 5-7 (Pre-A1 to A1). Include 9 thematic units (4 weeks each): Family, Colors & Shapes, Animals, Food, My Body, Weather, Toys & Games, School, Friends. Each unit has learning objectives, vocabulary lists (20-30 words), simple grammar patterns, songs/chants, TPR activities, story time, crafts, and assessment activities.',
 'curriculum', 101, 'BookMarked'),

('5-7', 'curriculum', '12-Week Term Program', 
 'Design a 12-week term curriculum for ages 5-7 (Pre-A1). Cover 3 major themes with 4 weeks each. Include daily lesson outlines, materials list, parent communication templates, progress tracking sheets, and end-of-term celebration activities. Focus on play-based learning, movement, songs, and multisensory activities.',
 'curriculum', 102, 'BookMarked'),

('5-7', 'curriculum', 'Summer Intensive Course', 
 'Create an 8-week summer intensive curriculum for ages 5-7. Theme: "English Adventure Camp". Include daily 90-minute sessions with: warm-up games (15min), story time (20min), activity stations (30min), snack & chat (15min), outdoor games (10min). Cover basic vocabulary, simple phrases, and social English through fun activities.',
 'curriculum', 103, 'BookMarked'),

('5-7', 'curriculum', 'Phonics Foundation Program', 
 'Design a 20-week phonics-based curriculum for ages 5-7. Systematically introduce letter sounds, blending, and simple reading. Week-by-week breakdown with: letter introduction, sound practice, blending activities, reading simple CVC words, writing practice, and assessment checkpoints every 4 weeks.',
 'curriculum', 104, 'BookMarked'),

-- Ages 8-11 Curriculum (4 actions)
('8-11', 'curriculum', 'Full Year A1→A2 Program', 
 'Create a comprehensive 36-week curriculum for ages 8-11 progressing from A1 to A2. Include 9 thematic units (4 weeks each), integrated skills development, systematic grammar progression, vocabulary expansion (600+ words), continuous assessment, project-based learning, and complete resource lists. Balance all four skills with age-appropriate content.',
 'curriculum', 105, 'BookMarked'),

('8-11', 'curriculum', 'Intensive Conversation Course', 
 'Design a 16-week speaking-focused curriculum for ages 8-11 (A2). Each week covers a different conversational topic: hobbies, school life, family routines, weekend plans, sports, food preferences, travel, technology. Include role-plays, pair work activities, presentation projects, and speaking assessments.',
 'curriculum', 106, 'BookMarked'),

('8-11', 'curriculum', 'Reading & Writing Program', 
 'Create a 24-week literacy-focused curriculum for ages 8-11 (A2). Alternate weeks between reading comprehension and writing skills. Reading weeks: story analysis, comprehension strategies, vocabulary building. Writing weeks: paragraph structure, creative writing, descriptive writing, letter writing. Include rubrics and portfolios.',
 'curriculum', 107, 'BookMarked'),

('8-11', 'curriculum', 'Grammar Mastery Course', 
 'Design a 20-week systematic grammar curriculum for ages 8-11 (A1 to A2). Cover: present simple/continuous, past simple, future forms, comparative/superlatives, modals, prepositions, conjunctions, question formation. Each week includes: presentation, controlled practice, freer practice, games, and weekly quizzes.',
 'curriculum', 108, 'BookMarked'),

-- Ages 12-14 Curriculum (4 actions)
('12-14', 'curriculum', 'A2→B1 Transition Program', 
 'Create a 40-week curriculum for ages 12-14 transitioning from A2 to B1. Include 10 thematic units (4 weeks each): technology, environment, culture, health, education, entertainment, careers, global issues, communication, innovation. Integrate all skills with emphasis on critical thinking, debates, projects, and authentic materials.',
 'curriculum', 109, 'BookMarked'),

('12-14', 'curriculum', 'Academic English Course', 
 'Design a 24-week academic English curriculum for ages 12-14 (B1). Focus on school subjects vocabulary, note-taking, essay writing, research skills, presentations, formal language. Include cross-curricular content (science, history, geography topics) and prepare students for academic contexts.',
 'curriculum', 110, 'BookMarked'),

('12-14', 'curriculum', 'Digital Literacy & English', 
 'Create a 16-week modern curriculum for ages 12-14 (A2-B1) combining English with digital skills. Topics: social media, online safety, blogging, podcasting, video creation, digital communication. Include project-based learning, collaborative online activities, and digital citizenship themes.',
 'curriculum', 111, 'BookMarked'),

('12-14', 'curriculum', 'Literature & Creative Writing', 
 'Design a 20-week literature-based curriculum for ages 12-14 (B1). Study 4-5 age-appropriate short stories/novels. Each text includes: pre-reading activities, reading strategies, comprehension work, vocabulary study, creative response tasks, and final project (book review, alternative ending, character analysis).',
 'curriculum', 112, 'BookMarked'),

-- Ages 15-17 Curriculum (4 actions)
('15-17', 'curriculum', 'B1→B2 Advanced Program', 
 'Create a comprehensive 40-week curriculum for ages 15-17 progressing from B1 to B2. Include 10 advanced thematic units focusing on abstract topics, complex grammar, academic vocabulary (1500+ words), critical analysis, extended writing, formal presentations, and authentic materials. Prepare for upper-intermediate proficiency.',
 'curriculum', 113, 'BookMarked'),

('15-17', 'curriculum', 'FCE Exam Preparation', 
 'Design a 30-week FCE (B2 First) exam preparation curriculum for ages 15-17. Systematic coverage of all exam papers: Reading & Use of English (7 parts), Writing (2 tasks), Listening (4 parts), Speaking (4 parts). Include exam strategies, timed practice, mock exams, and skills development.',
 'curriculum', 114, 'BookMarked'),

('15-17', 'curriculum', 'Advanced Writing Skills', 
 'Create a 24-week writing-intensive curriculum for ages 15-17 (B2). Cover: essay types (opinion, for-against, problem-solution), formal letters, reports, reviews, articles. Each unit includes: model texts, structure analysis, language focus, planning strategies, drafting, peer review, and revision.',
 'curriculum', 115, 'BookMarked'),

('15-17', 'curriculum', 'Global Issues & Debates', 
 'Design a 20-week discussion-based curriculum for ages 15-17 (B2). Topics: climate change, technology ethics, education systems, media influence, cultural identity, economic inequality. Each unit includes: reading/listening input, vocabulary study, structured debates, presentations, and argumentative writing.',
 'curriculum', 116, 'BookMarked'),

-- ============================================
-- ASSESSMENT MODE (24 actions - 6 per age group)
-- ============================================

-- Ages 5-7 Assessments (6 actions)
('5-7', 'assessment', 'Picture-Based Placement Test', 
 'Create a 20-minute placement assessment for ages 5-7 to determine Pre-A1/A1 level. Include: picture identification (10 items), color/shape recognition (5 items), listening comprehension with images (5 items), simple TPR commands (5 items). Scoring guide: 0-8 = Pre-A1, 9-16 = A1 emerging, 17+ = A1. Make it colorful and engaging.',
 'assessment', 117, 'ClipboardCheck'),

('5-7', 'assessment', 'End-of-Unit Progress Check', 
 'Design a 15-minute progress check for ages 5-7 after completing a thematic unit. Include: vocabulary matching with pictures (8 items), listen and circle (6 items), simple speaking task (describe 3 pictures), TPR assessment (5 commands). Total: 30 points. Include sticker reward system.',
 'assessment', 118, 'ClipboardCheck'),

('5-7', 'assessment', 'Listening Skills Test', 
 'Create a 10-minute listening assessment for ages 5-7 (A1). Include: listen and point (6 items), listen and circle the correct picture (6 items), listen and color (4 items), listen and draw (2 items). Use simple commands, questions, and short dialogues. Provide audio script and answer key.',
 'assessment', 119, 'ClipboardCheck'),

('5-7', 'assessment', 'Speaking Portfolio Check', 
 'Design a 5-minute individual speaking assessment for ages 5-7. Tasks: greet the teacher, answer 5 personal questions (name, age, favorite color/animal/food), identify 8 flashcards, describe 1 simple picture. Scoring: pronunciation (5pts), fluency (5pts), vocabulary (5pts), interaction (5pts). Total: 20 points.',
 'assessment', 120, 'ClipboardCheck'),

('5-7', 'assessment', 'Term Final Assessment', 
 'Create a comprehensive 30-minute term final for ages 5-7 covering 3 units. Sections: listening (10 items, 10pts), vocabulary recognition (15 items, 15pts), simple reading (5 items, 5pts), speaking task (10pts). Total: 40 points. Pass mark: 24/40 (60%). Include certificates for successful completion.',
 'assessment', 121, 'ClipboardCheck'),

('5-7', 'assessment', 'Fun Skills Olympics', 
 'Design a gamified assessment event for ages 5-7 (30 minutes). Set up 5 stations: Listening Lake (6pts), Vocabulary Village (8pts), Speaking Square (6pts), Reading Road (5pts), Action Arena (5pts). Students rotate through stations. Total: 30 points. Award gold/silver/bronze certificates.',
 'assessment', 122, 'ClipboardCheck'),

-- Ages 8-11 Assessments (6 actions)
('8-11', 'assessment', 'A1-A2 Placement Test', 
 'Create a 40-minute placement test for ages 8-11 to assess A1-A2 level. Sections: grammar & vocabulary (20 items, 20pts), reading comprehension (2 texts, 10 items, 10pts), listening (2 dialogues, 10 items, 10pts), writing task (simple email, 10pts). Total: 50 points. Scoring: 0-20 = A1, 21-35 = A2 emerging, 36+ = A2.',
 'assessment', 123, 'ClipboardCheck'),

('8-11', 'assessment', 'Mid-Term Examination', 
 'Design a 60-minute mid-term exam for ages 8-11 (A2) covering units 1-4. Sections: vocabulary & grammar (25 items, 25pts), reading (2 texts, 15 items, 15pts), listening (3 tracks, 15 items, 15pts), writing (paragraph about hobbies, 15pts). Total: 70 points. Pass: 42/70 (60%). Include detailed marking scheme.',
 'assessment', 124, 'ClipboardCheck'),

('8-11', 'assessment', 'Speaking Skills Test', 
 'Create a 10-minute paired speaking assessment for ages 8-11 (A2). Part 1: personal questions (2 min), Part 2: picture description (3 min), Part 3: role-play scenario (5 min). Assess: grammar accuracy, vocabulary range, pronunciation, fluency, interaction. Each criterion: 0-5 points. Total: 25 points.',
 'assessment', 125, 'ClipboardCheck'),

('8-11', 'assessment', 'Writing Portfolio Task', 
 'Design a 45-minute writing assessment for ages 8-11 (A2). Task 1: Write an email to a pen pal (80-100 words, 15pts). Task 2: Write a story beginning with "Last weekend..." (80-100 words, 15pts). Assess: task achievement, organization, vocabulary, grammar, mechanics. Total: 30 points.',
 'assessment', 126, 'ClipboardCheck'),

('8-11', 'assessment', 'End-of-Year Final Exam', 
 'Create a comprehensive 90-minute final exam for ages 8-11 (A2) covering the full year. Sections: listening (25pts), reading (25pts), grammar & vocabulary (25pts), writing (25pts). Total: 100 points. Pass: 60/100. Include separate speaking test (20pts, not included in total). Provide detailed rubrics.',
 'assessment', 127, 'ClipboardCheck'),

('8-11', 'assessment', 'Project-Based Assessment', 
 'Design a 2-week project assessment for ages 8-11 (A2). Students create a "My Country" presentation: research (5pts), poster creation (10pts), 3-minute oral presentation (10pts), Q&A handling (5pts). Total: 30 points. Include project guidelines, timeline, self-assessment, and peer feedback forms.',
 'assessment', 128, 'ClipboardCheck'),

-- Ages 12-14 Assessments (6 actions)
('12-14', 'assessment', 'B1 Progress Check', 
 'Create a 60-minute progress assessment for ages 12-14 (B1) covering units 1-4. Sections: Use of English - grammar & vocabulary (30 items, 30pts), reading comprehension (2 texts, 10 questions, 20pts), listening (3 tracks, 15 items, 15pts), writing task (opinion paragraph, 15pts). Total: 80 points. Pass: 48/80 (60%).',
 'assessment', 129, 'ClipboardCheck'),

('12-14', 'assessment', 'Extended Writing Test', 
 'Design a 60-minute writing assessment for ages 12-14 (B1). Task 1: Formal email/letter (120-150 words, 20pts). Task 2: Article or essay (150-180 words, 30pts). Assess: content, organization, language range, accuracy, style appropriacy. Total: 50 points. Include detailed rubric and sample answers.',
 'assessment', 130, 'ClipboardCheck'),

('12-14', 'assessment', 'Speaking Examination', 
 'Create a 15-minute individual speaking test for ages 12-14 (B1). Part 1: interview questions (3 min, 10pts), Part 2: individual long turn - describe and compare photos (4 min, 15pts), Part 3: discussion on related topic (5 min, 15pts). Total: 40 points. Record criteria and scoring descriptors.',
 'assessment', 131, 'ClipboardCheck'),

('12-14', 'assessment', 'Comprehensive Mid-Year', 
 'Design a 120-minute mid-year examination for ages 12-14 (B1). Paper 1: Reading & Use of English (60 min, 50pts). Paper 2: Writing (60 min, 30pts). Separate: Listening (30 min, 20pts), Speaking (15 min, 20pts). Total: 120 points. Pass: 72/120 (60%). Include all materials and keys.',
 'assessment', 132, 'ClipboardCheck'),

('12-14', 'assessment', 'Portfolio Assessment', 
 'Create a semester-long portfolio assessment for ages 12-14 (B1). Students submit: 3 written assignments (30pts), 2 reading response journals (10pts), 1 research project (20pts), speaking recording (10pts), self-reflection (5pts). Total: 75 points. Include guidelines, rubrics, and submission schedule.',
 'assessment', 133, 'ClipboardCheck'),

('12-14', 'assessment', 'Skills Integration Test', 
 'Design a 90-minute integrated skills assessment for ages 12-14 (B1). Students read an article, listen to a related interview, then write a summary and opinion piece (200 words) and give a 5-minute presentation. Reading input (20pts), listening comprehension (20pts), writing (30pts), speaking (30pts). Total: 100 points.',
 'assessment', 134, 'ClipboardCheck'),

-- Ages 15-17 Assessments (6 actions)
('15-17', 'assessment', 'FCE Mock Exam (Full)', 
 'Create a complete FCE mock examination for ages 15-17 (B2). Reading & Use of English (75 min, 7 parts, 52 items), Writing (80 min, 2 tasks), Listening (40 min, 4 parts, 30 items), Speaking (14 min, 4 parts). Include all exam materials, audio scripts, answer keys, and sample answers. Follow official exam format.',
 'assessment', 135, 'ClipboardCheck'),

('15-17', 'assessment', 'Advanced Writing Assessment', 
 'Design a 90-minute writing exam for ages 15-17 (B2). Part 1: Essay (compulsory - 140-190 words, 25pts). Part 2: Choose 1 from article/review/report/email (140-190 words, 25pts). Assess: content, communicative achievement, organization, language. Total: 50 points. Include FCE-style rubrics.',
 'assessment', 136, 'ClipboardCheck'),

('15-17', 'assessment', 'Academic Reading Test', 
 'Create a 75-minute advanced reading assessment for ages 15-17 (B2). 3 texts: multiple choice (8 items), gapped text (6 items), multiple matching (10 items). 4 Use of English tasks: multiple-choice cloze (8), word formation (8), key word transformation (6), open cloze (8). Total: 54 items. Include answer key.',
 'assessment', 137, 'ClipboardCheck'),

('15-17', 'assessment', 'Oral Proficiency Interview', 
 'Design a 15-minute advanced speaking test for ages 15-17 (B2). Part 1: interview (2 min), Part 2: long turn with photos (4 min), Part 3: collaborative task (4 min), Part 4: discussion (5 min). Assess: grammar/vocabulary, discourse management, pronunciation, interactive communication. Each: 0-5. Total: 20 points.',
 'assessment', 138, 'ClipboardCheck'),

('15-17', 'assessment', 'Comprehensive Final Exam', 
 'Create a 180-minute final examination for ages 15-17 (B2) covering the full course. Paper 1: Reading & Use of English (90 min, 60pts), Paper 2: Writing (90 min, 40pts). Separate sessions: Listening (40 min, 30pts), Speaking (15 min, 30pts). Total: 160 points. Pass: 100/160 (63%). Full materials included.',
 'assessment', 139, 'ClipboardCheck'),

('15-17', 'assessment', 'Research Project Evaluation', 
 'Design a semester-long research assessment for ages 15-17 (B2). Students investigate an English-speaking country/topic: written report (1500 words, 40pts), bibliography (5pts), oral presentation (15 min, 30pts), Q&A session (15pts), peer evaluation (10pts). Total: 100 points. Include proposal form, milestones, rubrics.',
 'assessment', 140, 'ClipboardCheck'),

-- ============================================
-- MISSION MODE (24 actions - 6 per age group)
-- ============================================

-- Ages 5-7 Missions (6 actions)
('5-7', 'mission', 'Rainbow Quest Adventure', 
 'Create a 6-quest mission for ages 5-7 (Pre-A1) called "Rainbow Quest". Each quest focuses on a color: Quest 1: Red (food items), Quest 2: Yellow (animals), Quest 3: Blue (toys), Quest 4: Green (nature), Quest 5: Orange (clothes), Quest 6: Purple (magic finale). Each quest: 15 XP, sticker badge. Final reward: Rainbow Certificate + 50 bonus XP.',
 'mission', 141, 'Gamepad2'),

('5-7', 'mission', 'Animal Kingdom Mission', 
 'Design a 7-quest animal adventure for ages 5-7 (A1). Quest 1: Farm animals, Quest 2: Jungle animals, Quest 3: Sea creatures, Quest 4: Birds, Quest 5: Pets, Quest 6: Baby animals, Quest 7: Final Boss - Zoo Keeper Challenge. Each quest: animal vocabulary (8-10 words), sounds, actions, story. XP: 10-20 per quest. Badges: Animal Friend level 1-7.',
 'mission', 142, 'Gamepad2'),

('5-7', 'mission', 'Alphabet Hero Journey', 
 'Create a 26-quest alphabet mission for ages 5-7 (Pre-A1). Each quest covers one letter: letter recognition, sound practice, 2-3 vocabulary words, tracing activity, finding objects. Quests A-Z. XP: 5 per quest (130 total). Milestone badges every 5 letters. Final reward: Alphabet Master Crown + certificate.',
 'mission', 143, 'Gamepad2'),

('5-7', 'mission', 'Superhero Training Camp', 
 'Design a 5-quest superhero-themed mission for ages 5-7 (A1). Quest 1: Super Strength (action verbs), Quest 2: X-Ray Vision (body parts), Quest 3: Super Speed (transport), Quest 4: Mind Reading (feelings), Quest 5: Final Mission (helping others - phrases). Each quest: 20 XP, superhero badge. Final: Superhero Certificate.',
 'mission', 144, 'Gamepad2'),

('5-7', 'mission', 'Fairy Tale Quest', 
 'Create a 6-quest fairy tale mission for ages 5-7 (A1) based on classic stories. Quest 1: Three Little Pigs (houses), Quest 2: Goldilocks (family, food), Quest 3: Little Red Riding Hood (family, forest), Quest 4: Jack and the Beanstalk (nature), Quest 5: Cinderella (clothes, time), Quest 6: Happy Ever After (celebrations). 15 XP per quest. Story badges.',
 'mission', 145, 'Gamepad2'),

('5-7', 'mission', 'Daily Challenge Calendar', 
 'Design a 30-day challenge mission for ages 5-7 (A1). Each day: one mini-challenge (5 min) - sing a song, name 5 items, do TPR actions, play a game, tell a simple story. XP: 3 per day. Weekly badges (6pts, 12pts, 18pts, 24pts, 30pts). Final reward: Challenge Champion medal + 50 bonus XP. Includes parent involvement tips.',
 'mission', 146, 'Gamepad2'),

-- Ages 8-11 Missions (6 actions)
('8-11', 'mission', 'Time Traveler Quest Chain', 
 'Create a 10-quest time-travel mission for ages 8-11 (A2). Visit different eras: Quest 1: Dinosaurs (past simple), Quest 2: Ancient Egypt, Quest 3: Middle Ages, Quest 4: Pirates, Quest 5: Wild West, Quest 6: Victorian times, Quest 7: World War period, Quest 8: 1960s, Quest 9: 1990s, Quest 10: Future (will/going to). Each: 30 XP, era badge. Final: Time Master Certificate.',
 'mission', 147, 'Gamepad2'),

('8-11', 'mission', 'Mystery Detective Agency', 
 'Design an 8-quest detective mystery for ages 8-11 (A2). Students solve cases: Quest 1: The Missing Pet, Quest 2: School Mystery, Quest 3: Stolen Trophy, Quest 4: Secret Message, Quest 5: Hidden Treasure, Quest 6: The Phantom, Quest 7: Double Identity, Quest 8: Final Case - The Master Criminal. Each quest: clues, interrogations, deductions. 25-40 XP per quest. Detective badges.',
 'mission', 148, 'Gamepad2'),

('8-11', 'mission', 'World Explorer Mission', 
 'Create a 12-quest world geography mission for ages 8-11 (A2). Visit continents: Quest 1-2: Europe, Quest 3-4: Asia, Quest 5-6: Africa, Quest 7-8: Americas, Quest 9-10: Oceania, Quest 11: Antarctica, Quest 12: World Summit. Learn countries, capitals, landmarks, culture, food, customs. 30 XP per quest. Country badges and stamps. Final: World Citizen Passport.',
 'mission', 149, 'Gamepad2'),

('8-11', 'mission', 'Grammar Guardian Quest', 
 'Design an 8-quest grammar mastery mission for ages 8-11 (A1-A2). Quest 1: Present Simple Kingdom, Quest 2: Present Continuous Castle, Quest 3: Past Simple Dungeon, Quest 4: Future Fortress, Quest 5: Comparative Mountains, Quest 6: Modal Island, Quest 7: Question Maze, Quest 8: Boss Battle - Mixed Grammar Challenge. 35 XP per quest. Grammar Master badges.',
 'mission', 150, 'Gamepad2'),

('8-11', 'mission', 'Team Challenge League', 
 'Create a 6-quest collaborative mission for ages 8-11 (A2). Teams of 3-4 compete: Quest 1: Vocabulary Race, Quest 2: Grammar Relay, Quest 3: Spelling Championship, Quest 4: Speaking Tournament, Quest 5: Reading Challenge, Quest 6: Grand Final - All Skills. Team XP: 50-100 per quest. Team badges, individual contributions tracked. Winning team: Trophy + 200 bonus XP.',
 'mission', 151, 'Gamepad2'),

('8-11', 'mission', 'Vocabulary Builder Dynasty', 
 'Design a 10-quest vocabulary expansion mission for ages 8-11 (A2). Themed quests: Quest 1: Food Empire (50 words), Quest 2: Sports Kingdom (40 words), Quest 3: Technology Territory (35 words), Quest 4: Nature Nation (45 words), Quest 5: Entertainment Empire (40 words), Quest 6: School State (45 words), Quest 7: House & Home (40 words), Quest 8: Travel Tribe (45 words), Quest 9: Feelings & Opinions (35 words), Quest 10: Master Mission (review all). 30-50 XP per quest.',
 'mission', 152, 'Gamepad2'),

-- Ages 12-14 Missions (6 actions)
('12-14', 'mission', 'Space Station Omega', 
 'Create a 12-quest sci-fi mission for ages 12-14 (B1). Narrative: Students are crew members on Space Station Omega. Quest 1: Launch preparation (future forms), Quest 2: First week in space (present perfect), Quest 3: Emergency drill (modals), Quest 4: Alien contact (conditionals), Quest 5: Equipment malfunction (problem-solving), Quest 6: Scientific research (passive voice), Quest 7-11: Various challenges, Quest 12: Safe return to Earth. 40-60 XP per quest. Crew rank badges.',
 'mission', 153, 'Gamepad2'),

('12-14', 'mission', 'Environmental Hero Campaign', 
 'Design a 10-quest environmental mission for ages 12-14 (B1). Quest 1: Understanding climate change, Quest 2: Plastic pollution, Quest 3: Deforestation, Quest 4: Endangered species, Quest 5: Renewable energy, Quest 6: Water conservation, Quest 7: Sustainable living, Quest 8: Community action, Quest 9: Global solutions, Quest 10: Final Project - Student-led initiative. 50 XP per quest. Eco-Warrior badges. Research and action required.',
 'mission', 154, 'Gamepad2'),

('12-14', 'mission', 'Escape Room Challenge Series', 
 'Create a 6-quest puzzle-solving mission for ages 12-14 (B1). Each quest is an escape room: Quest 1: The Locked Library (reading codes), Quest 2: The Secret Laboratory (science vocabulary), Quest 3: The Haunted House (past tenses narrative), Quest 4: The Bank Heist (logical reasoning), Quest 5: The Submarine (following instructions), Quest 6: The Ultimate Escape (all skills). Time limits. 60 XP per quest. Master Escape Artist badges.',
 'mission', 155, 'Gamepad2'),

('12-14', 'mission', 'Cultural Exchange Program', 
 'Design an 8-quest cultural learning mission for ages 12-14 (B1). Students "travel" to English-speaking countries: Quest 1: USA, Quest 2: UK, Quest 3: Australia, Quest 4: Canada, Quest 5: New Zealand, Quest 6: Ireland, Quest 7: South Africa, Quest 8: Cultural Festival (all countries). Learn history, traditions, slang, food, education. 45 XP per quest. Cultural Ambassador badges.',
 'mission', 156, 'Gamepad2'),

('12-14', 'mission', 'Debate Championship League', 
 'Create a 10-quest debate mission for ages 12-14 (B1). Progressive debate topics: Quest 1: School uniforms, Quest 2: Social media, Quest 3: Homework, Quest 4: Technology in education, Quest 5: Environmental protection, Quest 6: Animal rights, Quest 7: Space exploration, Quest 8: Artificial intelligence, Quest 9: Global citizenship, Quest 10: Final Debate Tournament. 50-70 XP per quest. Debater rank badges.',
 'mission', 157, 'Gamepad2'),

('12-14', 'mission', 'Film Production Studio', 
 'Design a 12-week mission for ages 12-14 (B1) to create a short film in English. Week 1-2: Script writing (40 XP), Week 3-4: Storyboarding (30 XP), Week 5-6: Rehearsals (40 XP), Week 7-8: Filming (50 XP), Week 9-10: Editing (40 XP), Week 11: Premiere preparation (30 XP), Week 12: Film Festival (60 XP + bonus). Roles: director, actors, camera, editors. Team badges.',
 'mission', 158, 'Gamepad2'),

-- Ages 15-17 Missions (6 actions)
('15-17', 'mission', 'Global Journalism Project', 
 'Create a 14-quest journalism mission for ages 15-17 (B2). Quest 1-2: News writing basics, Quest 3-4: Interviewing skills, Quest 5-6: Research and fact-checking, Quest 7-8: Feature articles, Quest 9-10: Opinion pieces, Quest 11-12: Multimedia reporting, Quest 13: Final project (create news website/magazine), Quest 14: Publication and presentation. 60-80 XP per quest. Journalist rank badges.',
 'mission', 159, 'Gamepad2'),

('15-17', 'mission', 'TED-Style Speaker Series', 
 'Design a 10-quest public speaking mission for ages 15-17 (B2). Quest 1: Topic selection, Quest 2: Research, Quest 3: Speech structure, Quest 4: Storytelling techniques, Quest 5: Visual aids, Quest 6: Body language, Quest 7: Voice and delivery, Quest 8: Q&A preparation, Quest 9: Practice presentations, Quest 10: Final TED-style talk (15 min). 70 XP per quest. Speaker level badges.',
 'mission', 160, 'Gamepad2'),

('15-17', 'mission', 'Business Startup Simulation', 
 'Create a 12-quest entrepreneurship mission for ages 15-17 (B2). Teams create virtual business: Quest 1: Business idea, Quest 2: Market research, Quest 3: Business plan, Quest 4: Branding, Quest 5: Marketing strategy, Quest 6: Financial planning, Quest 7: Pitch preparation, Quest 8: Product/service development, Quest 9-10: Sales and operations, Quest 11: Competition analysis, Quest 12: Final pitch to "investors". 70-100 XP per quest.',
 'mission', 161, 'Gamepad2'),

('15-17', 'mission', 'Literary Analysis Journey', 
 'Design an 8-quest literature mission for ages 15-17 (B2). Study English literature: Quest 1: Shakespeare introduction, Quest 2: Poetry analysis, Quest 3: Classic novel study, Quest 4: Modern fiction, Quest 5: Drama and plays, Quest 6: Short story analysis, Quest 7: Literary criticism, Quest 8: Final essay and presentation. 80 XP per quest. Literature Scholar badges.',
 'mission', 162, 'Gamepad2'),

('15-17', 'mission', 'UN Model Simulation', 
 'Create a 10-quest Model UN mission for ages 15-17 (B2). Quest 1: UN system overview, Quest 2: Country research, Quest 3: Resolution writing, Quest 4: Diplomatic language, Quest 5: Negotiation skills, Quest 6: Public speaking in debates, Quest 7: Committee work, Quest 8: Crisis management, Quest 9-10: Full MUN simulation (2 sessions). 75-100 XP per quest. Diplomat rank badges.',
 'mission', 163, 'Gamepad2'),

('15-17', 'mission', 'FCE Mastery Challenge', 
 'Design a 15-quest FCE preparation mission for ages 15-17 (B2). Quest 1-3: Reading skills (3 parts), Quest 4-6: Use of English (3 parts), Quest 7-8: Writing (2 parts), Quest 9-11: Listening (3 parts), Quest 12-14: Speaking (3 parts), Quest 15: Full mock exam. Progressive difficulty. 60-100 XP per quest. FCE Ready badges. Includes strategies and tips.',
 'mission', 164, 'Gamepad2'),

-- ============================================
-- RESOURCE MODE (24 actions - 6 per age group)
-- ============================================

-- Ages 5-7 Resources (6 actions)
('5-7', 'resource', 'Alphabet Coloring Pack', 
 'Create a 26-page coloring worksheet resource for ages 5-7 (Pre-A1). Each page: one letter (uppercase and lowercase), 3-4 pictures starting with that letter to color, dotted letter tracing, simple word labels. Include teacher notes with activity suggestions (color and say, find the letter, sound practice). A-Z complete set. Extension: alphabet poster.',
 'resource', 165, 'FileText'),

('5-7', 'resource', 'Picture Flashcard Set (100 cards)', 
 'Design a comprehensive flashcard pack for ages 5-7 (A1). 100 colorful picture flashcards covering: colors (12), numbers 1-20 (20), animals (20), food (15), family (10), toys (10), body parts (8), classroom objects (5). Each card: clear image, word label, phonetic guide. Include teacher guide with 20 games and activities to use with flashcards.',
 'resource', 166, 'FileText'),

('5-7', 'resource', 'Story Time Reading Pack', 
 'Create a 10-story resource for ages 5-7 (A1). Each story: 1-page illustrated story (30-50 words), picture vocabulary page, comprehension questions (5 items), coloring activity, extension activity. Topics: family, animals, school, friends, nature. Include audio script guide for teachers to read aloud. Stories use repetitive patterns.',
 'resource', 167, 'FileText'),

('5-7', 'resource', 'TPR Action Cards Set', 
 'Design a 50-card TPR (Total Physical Response) resource for ages 5-7 (Pre-A1 to A1). Action verb cards with illustrations: jump, run, hop, clap, stomp, turn, sit, stand, dance, fly, swim, eat, drink, sleep, wake up, etc. Each card: action illustration, verb, simple instruction. Teacher guide: 15 TPR games and activities. Includes action songs suggestions.',
 'resource', 168, 'FileText'),

('5-7', 'resource', 'Craft Activity Worksheets', 
 'Create a 12-activity craft resource for ages 5-7 (A1). Each activity: instructions with pictures (cut, glue, color, fold), materials list, vocabulary focus, final product image. Crafts: paper animals, face masks, finger puppets, greeting cards, bookmarks, crowns, flowers, food items. Language focus: imperatives, colors, shapes. Extension questions for each craft.',
 'resource', 169, 'FileText'),

('5-7', 'resource', 'Phonics Workbook (Phase 1-3)', 
 'Design a 50-page phonics workbook for ages 5-7 (Pre-A1). Phase 1: Environmental sounds and oral blending (10 pages). Phase 2: Letter sounds s,a,t,p,i,n,m,d,g,o,c,k (20 pages - 2 per letter). Phase 3: Remaining letters and simple digraphs (20 pages). Each page: letter formation, sound practice, blending activities, simple words, pictures. Answers included.',
 'resource', 170, 'FileText'),

-- Ages 8-11 Resources (6 actions)
('8-11', 'resource', 'Grammar Practice Workbook', 
 'Create a 40-page grammar workbook for ages 8-11 (A2). Topics: present simple (4 pages), present continuous (4), past simple (4), future (will/going to - 4), comparatives/superlatives (4), modals can/must/should (4), prepositions (4), conjunctions (3), question formation (3), articles (3), pronouns (3). Each section: explanation, examples, 3-4 exercises. Answer key included.',
 'resource', 171, 'FileText'),

('8-11', 'resource', 'Reading Comprehension Pack', 
 'Design a 15-passage reading resource for ages 8-11 (A2). Each passage: 150-200 word text with illustration, vocabulary pre-teach (8 words), 8 comprehension questions (multiple choice, true/false, short answer), discussion questions (3), extension writing task. Topics: animals, sports, technology, travel, school life, famous people, history, nature. Answer key and teaching notes.',
 'resource', 172, 'FileText'),

('8-11', 'resource', 'Vocabulary Builder Activities', 
 'Create a 30-activity vocabulary resource for ages 8-11 (A2). Themes: food (3 activities), sports (3), house (3), weather (2), clothes (2), technology (3), school (3), hobbies (3), transport (2), jobs (2), adjectives (2), verbs (2). Activities: word searches, crosswords, matching, gap-fills, categorizing, drawing-labeling. 400+ words total. Answer key included.',
 'resource', 173, 'FileText'),

('8-11', 'resource', 'Writing Skills Worksheets', 
 'Design a 20-worksheet writing resource for ages 8-11 (A2). Topics: sentence writing (3 sheets), paragraph structure (3), descriptive writing (3), narrative writing (3), email writing (2), diary entries (2), instructions (2), book reviews (2). Each worksheet: model text, language focus, guided practice, independent task, self-check rubric. Sample answers provided.',
 'resource', 174, 'FileText'),

('8-11', 'resource', 'Listening Activity Scripts', 
 'Create a 20-listening resource for ages 8-11 (A2). Each activity: 2-3 minute dialogue or monologue, pre-listening task, while-listening questions (8-10 items), post-listening discussion, transcript, vocabulary list. Topics: daily routines, shopping, birthday party, school trip, sports day, weather report, phone conversations, announcements. Answer key and teaching notes.',
 'resource', 175, 'FileText'),

('8-11', 'resource', 'Board Game Collection', 
 'Design a 10-board-game resource for ages 8-11 (A2). Games: Grammar Race, Vocabulary Quest, Question Challenge, Story Dice, Word Building, Sentence Scramble, Conversation Cards, Past Tense Journey, Future Predictions, All Skills Champion. Each game: printable board, rules, game cards, answer key where needed. For 2-4 players. Teacher notes with variations.',
 'resource', 176, 'FileText'),

-- Ages 12-14 Resources (6 actions)
('12-14', 'resource', 'Essay Writing Templates', 
 'Create a comprehensive essay writing resource for ages 12-14 (B1). Include templates for: opinion essays (2 templates), for-and-against essays (2), problem-solution essays (2), narrative essays (2), descriptive essays (1). Each template: structure guide, useful phrases list (20+), linking words, paragraph models, complete sample essay, planning worksheet, self-assessment checklist.',
 'resource', 177, 'FileText'),

('12-14', 'resource', 'Debate & Discussion Materials', 
 'Design a 20-topic debate resource for ages 12-14 (B1). Each topic: background information, argument cards (for and against), useful language sheet (opinion expressions, agreeing/disagreeing, interrupting), debate structure guide, role cards (moderator, timekeeper, speakers). Topics: school uniforms, social media age limits, homework, zoos, vegetarianism, technology, etc. Teacher facilitation guide.',
 'resource', 178, 'FileText'),

('12-14', 'resource', 'Advanced Grammar Exercises', 
 'Create a 50-page grammar resource for ages 12-14 (B1). Topics: present perfect simple/continuous (6 pages), past perfect (4), all future forms (5), mixed conditionals (5), passive voice (5), reported speech (5), relative clauses (4), modals of deduction (4), wish/if only (3), advanced prepositions (3), participle clauses (3), emphasis structures (3). Answer key included.',
 'resource', 179, 'FileText'),

('12-14', 'resource', 'Reading Text Collection', 
 'Design a 20-text reading resource for ages 12-14 (B1). Each text: 300-400 words, authentic or adapted from real sources. Genres: news articles (5), magazine features (5), blog posts (3), reviews (3), short stories (2), instructions (2). Each text: pre-reading tasks, vocabulary work, comprehension questions (10), critical thinking questions, writing extension. Teacher notes and answer key.',
 'resource', 180, 'FileText'),

('12-14', 'resource', 'Project-Based Learning Guides', 
 'Create a 10-project resource for ages 12-14 (B1). Projects: Create a travel brochure, Design a new app, School improvement proposal, Environmental campaign, Cultural festival planning, Magazine creation, Documentary script, Invention presentation, Historical figure biography, Future predictions report. Each project: step-by-step guide, language support, assessment rubric, timeline, presentation guidelines.',
 'resource', 181, 'FileText'),

('12-14', 'resource', 'Listening Comprehension Pack', 
 'Design a 25-listening resource for ages 12-14 (B1). Each activity: 3-5 minute audio, pre-listening prediction task, while-listening questions (10-12), post-listening discussion, full transcript, vocabulary list. Content: interviews (5), talks (5), conversations (5), announcements (3), news reports (3), stories (4). Multiple accents. Answer key and teaching suggestions.',
 'resource', 182, 'FileText'),

-- Ages 15-17 Resources (6 actions)
('15-17', 'resource', 'FCE Writing Practice Pack', 
 'Create a comprehensive FCE Writing resource for ages 15-17 (B2). Part 1 Essays: 15 practice tasks with sample answers (band 5). Part 2: 10 article tasks, 10 review tasks, 10 report tasks, 10 formal email/letter tasks - all with sample answers. Include: assessment criteria explanation, examiner comments on samples, useful language banks (100+ phrases per type), writing checklist, peer-assessment forms.',
 'resource', 183, 'FileText'),

('15-17', 'resource', 'Academic Vocabulary Builder', 
 'Design a 60-page academic vocabulary resource for ages 15-17 (B2). 30 topic areas with 50 words each (1500 total): education, environment, technology, health, media, business, science, culture, politics, society, etc. Each topic: word list with definitions, example sentences, word formation table, collocations, topic-specific phrases, practice exercises (5 per topic). Answer key included.',
 'resource', 184, 'FileText'),

('15-17', 'resource', 'Critical Reading & Analysis Pack', 
 'Create a 15-text advanced reading resource for ages 15-17 (B2). Texts: opinion articles (5), analytical essays (3), research summaries (3), literary extracts (2), speeches (2). Each 500-700 words. Include: reading strategies guide, annotation practice, comprehension questions, text analysis tasks (structure, style, argument), vocabulary work, discussion questions, essay prompts. Teacher guide included.',
 'resource', 185, 'FileText'),

('15-17', 'resource', 'Advanced Speaking Activities', 
 'Design a 25-activity speaking resource for ages 15-17 (B2). Activities: FCE Part 1 practice (5 sets), FCE Part 2 photo cards (10 sets), FCE Part 3 collaborative tasks (5), FCE Part 4 discussion topics (5). Include: assessment criteria, useful language sheets, examiner questions, timing guides, self/peer assessment forms. Audio examples of band 5 performances.',
 'resource', 186, 'FileText'),

('15-17', 'resource', 'Research & Presentation Guide', 
 'Create a complete research skills resource for ages 15-17 (B2). Sections: choosing topics (5 pages), finding sources (5), note-taking (5), avoiding plagiarism (5), creating outlines (5), academic writing style (10), citations and bibliography (5), creating visual aids (5), presentation skills (10), Q&A handling (5). Include templates, examples, checklists, rubrics. 60 pages total.',
 'resource', 187, 'FileText'),

('15-17', 'resource', 'FCE Full Practice Tests (×3)', 
 'Design a complete FCE practice test resource for ages 15-17 (B2). Three full tests: Test 1 (with guidance), Test 2 (standard), Test 3 (exam conditions). Each test: Reading & Use of English (7 parts), Writing (2 tasks), Listening (4 parts), Speaking (4 parts). Include: answer keys, audio scripts, sample answers for writing/speaking, marking schemes, score conversion, examiner tips. 150+ pages.',
 'resource', 188, 'FileText')

ON CONFLICT (id) DO NOTHING;
