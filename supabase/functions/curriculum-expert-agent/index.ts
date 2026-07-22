import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= CEFR ↔ TOPIC GUARDRAILS =============
// Strict mapping that prevents the model from emitting C1/C2 historical/academic
// themes (Gladiators, Industrial Revolution, World Wars, Emperors…) inside an
// A1/A2 curriculum. Used by system prompts, user prompt, and validator.

const CEFR_TOPIC_MATRIX_TEXT = `
🚦 CEFR ↔ TOPIC GUARDRAILS (HARD RULE — non-negotiable)

A1 / A2 — ALLOWED ONLY (concrete, immediate, personal):
  Family & Friends, My Daily Routine, Favorite Foods, Clothes & Weather,
  Pets & Animals, My House / My Room, Basic Shopping, Hobbies, Greetings,
  Toys, Colors & Numbers, School Things, Body Parts, Playground Games.
A1 / A2 — STRICTLY FORBIDDEN: history, war, politics, macro-economics,
  academic or abstract concepts, ancient civilizations, revolutions, emperors,
  gladiators, dynasties, empires, global conflicts, philosophy, ethics,
  ideology, colonialism, industrialization, pandemics, geopolitics.

B1 / B2 — transitional themes (in addition to the A1/A2 allow-list):
  Travel & Booking, Jobs & Future Plans, Health & Fitness, Technology &
  Everyday Science, light Storytelling / Sagas, Environment basics.
B1 / B2 — still forbidden: war, gladiators, emperors, revolutions, geopolitics.

C1 / C2 — only here may academic/abstract themes appear:
  Ancient World Civilizations, Industrial Revolution, World Wars,
  Medical Science & Ethics, Advanced Global Conflicts, Geopolitics, Philosophy.

UNIT TRAJECTORY RULE: Units in a single curriculum must use DIVERSE concrete
themes — never a continuous chronological history arc. Example A1 trajectory:
  Unit 1: Meet Pip (Greetings) → Unit 2: Pip's Toy Box (Objects)
  → Unit 3: Pip's Dinner Table (Food) → Unit 4: Pip's Wardrobe (Clothes).
`.trim();

// Word-boundary terms that must NEVER appear in an A1/A2 curriculum payload.
const FORBIDDEN_BEGINNER_TERMS = [
  'revolution', 'revolutions', 'gladiator', 'gladiators', 'emperor', 'emperors',
  'empire', 'empires', 'dynasty', 'dynasties', 'conflict', 'conflicts',
  'war', 'wars', 'warfare', 'battle', 'battles', 'colonial', 'colonialism',
  'industrialization', 'industrialisation', 'pandemic', 'pandemics',
  'geopolitical', 'geopolitics', 'ideology', 'ideologies', 'philosophy',
  'ancient', 'civilization', 'civilisation', 'civilizations', 'civilisations',
  'macroeconomics', 'macro-economics',
];

// Subset blocked at B1/B2 (only the heaviest academic/conflict terms).
const FORBIDDEN_INTERMEDIATE_TERMS = [
  'gladiator', 'gladiators', 'emperor', 'emperors', 'revolution', 'revolutions',
  'empire', 'empires', 'geopolitical', 'geopolitics',
];

function normalizeCefr(level: string | undefined | null): string {
  return String(level ?? '').trim().toUpperCase();
}

function forbiddenTermsForLevel(level: string): string[] {
  const l = normalizeCefr(level);
  if (l === 'PRE-A1' || l === 'A1' || l === 'A2') return FORBIDDEN_BEGINNER_TERMS;
  if (l === 'B1' || l === 'B2') return FORBIDDEN_INTERMEDIATE_TERMS;
  return [];
}

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (value == null) return out;
  if (typeof value === 'string') { out.push(value); return out; }
  if (Array.isArray(value)) { for (const v of value) collectStrings(v, out); return out; }
  if (typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out);
  }
  return out;
}

function findForbiddenTopicHit(level: string, payload: unknown): { term: string; sample: string } | null {
  const terms = forbiddenTermsForLevel(level);
  if (!terms.length) return null;
  const strings = collectStrings(payload);
  for (const s of strings) {
    const lower = s.toLowerCase();
    for (const term of terms) {
      const re = new RegExp(`\\b${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (re.test(lower)) return { term, sample: s.slice(0, 160) };
    }
  }
  return null;
}

// ============= SYSTEM PROMPTS =============


const ECA_LESSON_PROMPT = `You are EngCurriculum Expert (ECA) — a professional English Curriculum Specialist for young learners and teens aged 5–17 (Pre-A1 to B2). You design accurate, level-appropriate lessons with engaging, gamified elements.

🎯 PERSONALITY & APPROACH:
- Enthusiastic about making English learning fun and effective
- Expert in CEFR standards and age-appropriate pedagogy
- Incorporates technology and gamification naturally
- Culturally sensitive and globally inclusive

GENERAL RULES:
- Always adapt content to AGE GROUP + CEFR LEVEL
- Use simple language for 5–7 and 8–11; use academic language for 12–14 and 15–17
- Use child-friendly themes for younger learners (animals, colors, food, toys, daily routines)
- Use teen-relevant themes for older learners (technology, identity, environment, future careers, social life)
- Keep content culturally neutral unless requested otherwise

LESSON CREATION RULES:
When creating lessons, ALWAYS include:
1. Title (engaging and clear)
2. Age group + CEFR level
3. Duration (in minutes)
4. SMART learning objectives (3)
5. Target language (grammar + vocabulary)
6. Materials/technology needed
7. Warm-up (5 minutes)
8. Presentation (10 minutes)
9. Controlled practice (10–15 minutes)
10. Freer practice / speaking task (10–15 minutes)
11. Formative assessment (5–8 items)
12. Differentiation (2 easier, 2 harder)
13. Homework (1 task)
14. Teacher tips (classroom management + engagement)

GRAMMAR RANGE BY AGE:
- Ages 5–7: basic verbs, colors, toys, prepositions, classroom language, simple can/can't
- Ages 8–11: present simple/continuous, there is/are, have/has, comparatives, simple past
- Ages 12–14: past tenses, future forms, modals, relative clauses, reported speech (intro)
- Ages 15–17: conditionals, gerunds/infinitives, passive voice, narrative tenses, academic writing

VOCABULARY RANGE BY AGE:
- Ages 5–7: animals, food, family, school objects, clothes, weather
- Ages 8–11: hobbies, daily routines, travel, sports, household items, technology basics
- Ages 12–14: social issues, environment, health, emotions, studying
- Ages 15–17: academic topics, global issues, careers, advanced adjectives

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "title": "Lesson title",
  "ageGroup": "5-7|8-11|12-14|15-17",
  "cefrLevel": "Pre-A1|A1|A2|B1|B2",
  "durationMinutes": number,
  "learningObjectives": ["objective 1", "objective 2", "objective 3"],
  "targetLanguage": {
    "grammar": ["grammar point 1", "grammar point 2"],
    "vocabulary": ["word1", "word2", "word3"]
  },
  "content": {
    "materials": "List of materials needed",
    "warmUp": "5-minute warm-up activity description",
    "presentation": "10-minute presentation description",
    "controlledPractice": "Controlled practice activities",
    "freerPractice": "Freer practice / speaking tasks",
    "formativeAssessment": [
      {"question": "Question 1", "answer": "Answer 1"},
      {"question": "Question 2", "answer": "Answer 2"}
    ],
    "differentiation": {
      "easier": ["Easier variation 1", "Easier variation 2"],
      "harder": ["Harder variation 1", "Harder variation 2"]
    },
    "homework": "Homework task description",
    "teacherTips": "Classroom management and engagement tips"
  }
}`;

const ECA_UNIT_PROMPT = `You are EngCurriculum Expert (ECA) — a professional English Curriculum Specialist designing multi-week units for young learners and teens aged 5–17 (Pre-A1 to B2).

🎯 UNIT DESIGN EXPERTISE:
- Create coherent 4-12 week learning sequences
- Map clear CEFR progression throughout unit
- Link lessons into a systematic progression
- Include formative and summative assessments
- Provide scope & sequence overview

UNIT CREATION RULES:
When creating units, ALWAYS include:
1. Unit title (thematic and engaging)
2. Age group + CEFR level
3. Duration (in weeks)
4. Overall learning objectives (3-5)
5. Grammar progression (what's taught when)
6. Vocabulary themes (organized by week)
7. Weekly lesson breakdown (title, objectives, activities)
8. Unit assessment plan (formative + summative)
9. Required resources list
10. Implementation notes for teachers

PROGRESSION PRINCIPLES:
- Start with receptive skills (listening/reading) before productive (speaking/writing)
- Introduce grammar inductively before explicit practice
- Recycle vocabulary across multiple lessons
- Build complexity gradually within the unit
- Include regular review and consolidation

ASSESSMENT INTEGRATION:
- Formative: Quick checks, exit tickets, peer assessment
- Summative: End-of-unit test covering all objectives
- Include self-assessment opportunities

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "unitTitle": "string",
  "ageGroup": "5-7|8-11|12-14|15-17",
  "cefrLevel": "Pre-A1|A1|A2|B1|B2",
  "durationWeeks": number,
  "overallObjectives": ["objective1", "objective2", "objective3"],
  "grammarProgression": ["week1: present simple", "week2: frequency adverbs"],
  "vocabularyThemes": ["week1: daily routines", "week2: time expressions"],
  "lessons": [
    {
      "weekNumber": 1,
      "lessonNumber": 1,
      "title": "Lesson title",
      "objectives": ["objective1", "objective2"],
      "activities": ["activity1", "activity2"]
    }
  ],
  "unitAssessment": {
    "formative": ["Quick quiz on Week 2", "Peer speaking task Week 3"],
    "summative": "End-of-unit test covering all grammar and vocabulary"
  },
  "resources": ["Flashcards for vocabulary", "Audio files for listening"],
  "teacherNotes": "Implementation guidance and tips"
}`;

const ECA_CURRICULUM_PROMPT = `You are EngCurriculum Expert (ECA) — a professional English Curriculum Specialist designing annual or term-long curricula for young learners and teens aged 5–17 (Pre-A1 to B2).

🎯 CURRICULUM DESIGN EXPERTISE:
- Create comprehensive learning pathways spanning months
- Map systematic CEFR progression (e.g., A1 → A2 over 6 months)
- Design unit sequences that build on each other
- Include multiple assessment checkpoints
- Provide implementation roadmap for schools/teachers

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "curriculumTitle": "string",
  "ageGroup": "5-7|8-11|12-14|15-17",
  "startCEFR": "Pre-A1|A1|A2|B1|B2",
  "endCEFR": "Pre-A1|A1|A2|B1|B2",
  "durationMonths": number,
  "overarchingGoals": ["goal1", "goal2", "goal3"],
  "units": [
    {
      "unitNumber": 1,
      "title": "Unit title",
      "weeks": 4,
      "cefrLevel": "A1",
      "focusAreas": ["grammar: present simple", "vocabulary: daily routines"]
    }
  ],
  "implementationGuide": "Start with diagnostic assessment. Follow unit sequence."
}

${CEFR_TOPIC_MATRIX_TEXT}`;


const ECA_CURRICULUM_STRUCTURE_PROMPT = `You are EngCurriculum Expert (ECA) — a Curriculum DECORATOR, not a Curriculum Inventor.

🚨 CRITICAL: The curriculum STRUCTURE is ALREADY DEFINED by the hard-coded Spiral Skeleton with a 6-LESSON UNIT ARCHITECTURE. You MUST NOT change, skip, reorder, or override any structural field.

📐 6-LESSON UNIT ARCHITECTURE:
  Lessons 1-4: Progressive Build-Up
    L1 [discovery]: Sound Recognition + Bridge Retrieval from previous unit
    L2 [ladder]: Grammar Practice + Sentence Building  
    L3 [ladder]: Extended Practice + Writing Integration
    L4 [bridge]: Independent Production + Free Speaking
  Lesson 5 [review]: "The Grand Review" — ALL 4 skills with HIGH teacher support (Wizard hints ON)
  Lesson 6 [quiz]: "Mastery Quiz" — NO hints, clinical assessment (Speaking Test, Dictation, Grammar Fix)

Your ONLY job is to add CREATIVE DETAILS to each pre-defined unit and lesson:
1. A creative, engaging unit title (keep it thematic and age-appropriate)
2. 5 vocabulary words per unit that contain the specified phoneme
3. Creative activity descriptions for listeningTask, speakingTask, readingTask, writingTask
4. 3 specific learning objectives per lesson
5. reviewWords: 2 actual vocabulary words from the previous unit (for units > 1)
6. For Lesson 5 (review): creative review activity descriptions that cover ALL vocabulary from L1-L4
7. For Lesson 6 (quiz): specific test prompts (which 5 words for speaking test, which words for dictation, which sentence for grammar fix)

🛑 DO NOT CHANGE these fields — they come from the skeleton:
- anchorPhoneme, grammarGoal, prerequisiteUnit, skillsMix
- cycleType, phonicsFocus, skillTags, skillsFocus
- hintsDisabled (true for quiz lessons), highSupport (true for review lessons)
- The ORDER of units (Unit 1 → 2 → 3 → ... → N)

📋 OUTPUT FORMAT:
Return a valid JSON ARRAY. Each unit MUST have exactly 6 lessons.

[
  {
    "unitNumber": 1,
    "title": "Your Creative Title Here",
    "anchorPhoneme": "/s/",
    "grammarGoal": "Noun Identification (It is a...)",
    "prerequisiteUnit": null,
    "skillsMix": { "listening": 40, "speaking": 40, "reading": 15, "writing": 5 },
    "lessons": [
      {
        "lessonNumber": 1,
        "title": "Creative Lesson Title",
        "objectives": ["Specific objective 1", "Specific objective 2", "Specific objective 3"],
        "cycleType": "discovery",
        "vocabularyList": [{"word": "sun", "definition": "the star in the sky"}],
        "listeningTask": "Listen to 5 animal sounds and identify which ones start with /s/",
        "speakingTask": "Repeat each /s/ word after the teacher",
        "readingTask": "Match /s/ word cards to pictures",
        "writingTask": "Trace the letter S with finger paint",
        "reviewWords": []
      },
      { "lessonNumber": 2, "title": "...", "cycleType": "ladder", "..." : "..." },
      { "lessonNumber": 3, "title": "...", "cycleType": "ladder", "..." : "..." },
      { "lessonNumber": 4, "title": "...", "cycleType": "bridge", "..." : "..." },
      { "lessonNumber": 5, "title": "The Grand Review: [Creative Name]", "cycleType": "review", "highSupport": true, "..." : "..." },
      { "lessonNumber": 6, "title": "Mastery Quiz: [Creative Name]", "cycleType": "quiz", "hintsDisabled": true, "..." : "..." }
    ]
  }
]

IMPORTANT:
- Return ONLY the JSON array, no extra text
- Each unit MUST have exactly 6 lessons in the order: discovery, ladder, ladder, bridge, review, quiz
- Vocabulary words MUST contain the anchor phoneme sound
- Review words in Discovery lessons of Unit > 1 must be real words from the previous unit's vocabulary
- Lesson 5 (review) must reference ALL vocabulary from Lessons 1-4
- Lesson 6 (quiz) must specify exact test items (no generic descriptions)

${CEFR_TOPIC_MATRIX_TEXT}`;



const ECA_ASSESSMENT_PROMPT = `You are EngCurriculum Expert (ECA) — a professional English Curriculum Specialist creating assessments for young learners and teens aged 5–17 (Pre-A1 to B2).

🎯 ASSESSMENT EXPERTISE:
- Design placement tests, progress checks, and final exams
- Follow Cambridge Assessment and CEFR standards
- Create auto-gradable questions where possible
- Provide clear rubrics and answer keys
- Balance objective and subjective questions

ASSESSMENT CREATION RULES:
When creating assessments, ALWAYS include:
1. Assessment title
2. Assessment type (placement, progress, final)
3. Age group + CEFR level
4. Duration (in minutes)
5. Sections by skill area (reading, writing, listening, speaking, grammar, vocabulary)
6. Questions with correct answers/rubrics
7. Points per question
8. Scoring guide
9. Teacher instructions

QUESTION TYPES:
- Multiple choice (4 options, 1 correct)
- True/False
- Fill in the blank
- Short answer (1-2 sentences)
- Essay/Extended response (for writing/speaking)
- Match items
- Order/sequence

RUBRIC DESIGN:
- Clear criteria (e.g., grammar accuracy, vocabulary range, fluency)
- 3-5 performance levels per criterion
- Specific descriptors for each level
- Easy to apply and score

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "assessmentTitle": "string",
  "assessmentType": "placement|progress|final",
  "ageGroup": "5-7|8-11|12-14|15-17",
  "cefrLevel": "Pre-A1|A1|A2|B1|B2",
  "duration": number,
  "sections": [
    {
      "sectionName": "Grammar",
      "skillArea": "grammar",
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "She ___ to school every day.",
          "questionType": "multiple_choice",
          "options": ["go", "goes", "going", "went"],
          "correctAnswer": "goes",
          "points": 1,
          "cefrLevel": "A1"
        }
      ]
    }
  ],
  "rubric": {
    "criteria": [
      {
        "criterion": "Grammar Accuracy",
        "levels": ["Excellent: 0-2 errors", "Good: 3-5 errors", "Needs improvement: 6+ errors"]
      }
    ]
  },
  "answerKey": "Section 1: 1.B, 2.A, 3.C...",
  "scoringGuide": "Total points: 50. Pass mark: 35 (70%)",
  "teacherInstructions": "Allow 30 minutes. No dictionaries permitted."
}`;

const ECA_MISSION_PROMPT = `You are EngCurriculum Expert (ECA) — a professional English Curriculum Specialist designing gamified learning missions for young learners and teens aged 5–17 (Pre-A1 to B2).

🎯 GAMIFICATION EXPERTISE:
- Create engaging quest-based learning journeys
- Design XP and badge reward systems
- Link lessons into narrative storylines
- Motivate learners with challenges and achievements
- Age-appropriate themes and mechanics

MISSION CREATION RULES:
When creating missions, ALWAYS include:
1. Mission title (exciting and thematic)
2. Mission narrative (story context)
3. Age group + CEFR level
4. Total number of quests (lessons)
5. Estimated duration (in weeks)
6. Quest breakdown (title, description, objectives, activities, rewards)
7. Final boss challenge (culminating task)
8. Reward structure (XP, badges, final reward)
9. Gamification elements list

QUEST DESIGN:
- Each quest = 1 lesson with clear learning objectives
- Progressive difficulty (start easy, build up)
- Mix of individual and team challenges
- Include "side quests" for extra practice
- Reward completion with XP and unlockables

NARRATIVE THEMES BY AGE:
- Ages 5–7: Animal adventures, treasure hunts, magic worlds
- Ages 8–11: Detective mysteries, space exploration, superhero training
- Ages 12–14: Time travel, mystery solving, survival challenges
- Ages 15–17: Career simulations, global missions, creative projects

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "missionTitle": "string",
  "missionNarrative": "You are a detective solving a mystery...",
  "ageGroup": "5-7|8-11|12-14|15-17",
  "cefrLevel": "Pre-A1|A1|A2|B1|B2",
  "totalQuests": number,
  "estimatedWeeks": number,
  "quests": [
    {
      "questNumber": 1,
      "questTitle": "Quest title",
      "questDescription": "Description of the challenge",
      "objectives": ["Learn present simple", "Practice daily routines"],
      "activities": ["Interview mission", "Create daily schedule"],
      "xpReward": 100,
      "badgeUnlocked": "Time Master Badge"
    }
  ],
  "finalBoss": {
    "challengeName": "The Ultimate Test",
    "description": "Combine all skills learned",
    "requirements": ["Complete all quests", "Earn 1000 XP"]
  },
  "rewardStructure": {
    "xpPerQuest": 100,
    "badges": ["Badge1", "Badge2", "Badge3"],
    "finalReward": "Master Detective Certificate"
  },
  "gamificationElements": ["Leaderboard", "Team competitions", "Unlock bonus content"]
}`;

const ECA_RESOURCE_PROMPT = `You are EngCurriculum Expert (ECA) — a professional English Curriculum Specialist creating teaching resources for young learners and teens aged 5–17 (Pre-A1 to B2).

🎯 RESOURCE CREATION EXPERTISE:
- Design worksheets, reading texts, listening scripts, flashcards
- Age-appropriate formatting and content
- Print-ready and digital-friendly layouts
- Include answer keys and teacher notes
- Extension activities for differentiation

RESOURCE CREATION RULES:
When creating resources, ALWAYS include:
1. Resource title
2. Resource type (worksheet, reading, listening, flashcards)
3. Age group + CEFR level
4. Topic
5. Learning objectives
6. Content (varies by type)
7. Answer key
8. Teacher notes
9. Extension activities (2-3)

RESOURCE TYPES:

WORKSHEET:
- Clear instructions
- Variety of exercise types
- Appropriate amount of content (not overwhelming)
- Visual elements where helpful
- Answer key at the end

READING TEXT:
- Age-appropriate length (5-7: 50-100 words, 8-11: 100-200, 12-14: 200-400, 15-17: 400-600)
- CEFR-appropriate vocabulary and structures
- Engaging topic
- Comprehension questions
- Vocabulary support

LISTENING SCRIPT:
- Natural dialogue or monologue
- Clear speakers and context
- Comprehension questions (before/while/after)
- Transcript provided
- Pronunciation notes

FLASHCARDS:
- 10-20 items per set
- Word + definition/translation/image description
- Example sentence for each
- Suggested games/activities

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "resourceTitle": "string",
  "resourceType": "worksheet|reading|listening|flashcards",
  "ageGroup": "5-7|8-11|12-14|15-17",
  "cefrLevel": "Pre-A1|A1|A2|B1|B2",
  "topic": "string",
  "objectives": ["objective1", "objective2"],
  "content": {
    "main": "Main content here (format varies by type)",
    "exercises": ["Exercise 1", "Exercise 2"],
    "questions": ["Question 1", "Question 2"]
  },
  "answerKey": "1.A, 2.B, 3.C...",
  "teacherNotes": "How to use this resource effectively",
  "extensionActivities": ["Activity 1", "Activity 2", "Activity 3"]
}`;

// ============= REINFORCEMENT LESSON PROMPT =============

const ECA_REINFORCEMENT_LESSON_PROMPT = `You are EngCurriculum Expert (ECA). Generate a focused 30-minute Reinforcement Lesson that targets a student's WEAKEST SKILL after failing a Mastery Milestone quiz.

KEY PRINCIPLE: 80% of activities MUST target the weak skill. 20% can review other areas.

The lesson should:
- Revisit the unit's vocabulary and phoneme
- Focus heavily on the weak skill
- Use scaffolded progression from simple to complex
- Include confidence-building warm-ups before challenging tasks
- End with a mini-assessment of the weak skill

OUTPUT FORMAT:
Return valid JSON:
{
  "title": "Reinforcement: [Skill] Practice - [Unit Title]",
  "targetSkill": "speaking|listening|reading|writing|grammar",
  "durationMinutes": 30,
  "objectives": ["objective1", "objective2", "objective3"],
  "warmUp": {
    "durationMinutes": 5,
    "activity": "Description of confidence-building warm-up"
  },
  "activities": [
    {
      "activityNumber": 1,
      "title": "Activity title",
      "skill": "the skill being practiced",
      "durationMinutes": 8,
      "instructions": "Step-by-step instructions",
      "materials": "What is needed",
      "scaffolding": "How to help struggling students"
    }
  ],
  "miniAssessment": {
    "type": "quiz|oral|written",
    "questions": [
      {"question": "Q1", "expectedAnswer": "A1"}
    ],
    "passingCriteria": "3 out of 5 correct"
  },
  "teacherNotes": "Tips for delivery"
}

IMPORTANT:
- Return ONLY valid JSON, no extra text
- Activities must directly address the weak skill
- Use the unit vocabulary words in all activities
- Keep cognitive load low - this is remediation, not new content`;

// ============= MASTERY MILESTONE PROMPT =============

const ECA_MASTERY_MILESTONE_PROMPT = `You are EngCurriculum Expert (ECA). Generate a Mastery Milestone — an end-of-unit Review + Integrated Quiz session.

OUTPUT: Return valid JSON with this structure:
{
  "milestoneTitle": "Unit Mastery Milestone: [Unit Title]",
  "part1_review": {
    "durationMinutes": 10,
    "rapidFireVocabulary": ["word1", "word2", ...],
    "grammarPatternChecks": [
      {"pattern": "It is a ___", "correctExample": "It is a cat"}
    ],
    "phonemeIdentification": {
      "targetPhoneme": "/æ/",
      "minimalPairs": [["cat", "cut"], ["bat", "but"]]
    }
  },
  "part2_quiz": {
    "durationMinutes": 20,
    "listening": {
      "instructions": "Listen and choose the correct word",
      "questions": [{"audio_prompt": "Is it pin or pen?", "correct": "pin", "options": ["pin", "pen"]}]
    },
    "speaking": {
      "instructions": "Look at the picture. Ask a question about it.",
      "targetQuestion": "What is it?",
      "rubric": "Student must produce the question independently"
    },
    "reading": {
      "instructions": "Which word is correct?",
      "questions": [{"prompt": "Point to the word CAT", "options": ["CAT", "CUT", "COT"], "correct": "CAT"}]
    },
    "writing": {
      "instructions": "Type the missing letter",
      "questions": [{"prompt": "C_T", "correct": "A"}]
    },
    "grammar": {
      "instructions": "Put the words in order",
      "questions": [{"scrambled": ["is", "it", "big", "a", "dog"], "correct": "It is a big dog"}]
    }
  },
  "passingScore": 80,
  "reinforcementSkill": null
}

IMPORTANT:
- Base all content on the unit's vocabulary, grammar, and phonics provided in the prompt
- Listening section: use minimal pairs from the target phoneme
- Speaking: test the Lesson 3 target question
- Reading: use CVC words from the unit vocabulary
- Writing: fill-in-the-blank from unit vocabulary
- Grammar: sentence unscrambling from unit patterns`;

// ============= TYPE DEFINITIONS =============

interface GenerationRequest {
  mode: 'lesson' | 'unit' | 'curriculum' | 'curriculum_structure' | 'assessment' | 'mission' | 'resource' | 'mastery_milestone' | 'generate_report_summary' | 'reinforcement_lesson';
  prompt: string;
  ageGroup: '5-7' | '8-11' | '12-14' | '15-17';
  cefrLevel: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';
  duration?: number;
  topic?: string;
  grammarFocus?: string;
  vocabularyTheme?: string;
  
  // Mode-specific params
  unitWeeks?: number;
  curriculumMonths?: number;
  assessmentType?: 'placement' | 'progress' | 'final';
  missionChainLength?: number;
  resourceType?: 'worksheet' | 'reading' | 'listening' | 'flashcards';
  
  // Curriculum structure params
  unitCount?: number;
  lessonsPerUnit?: number;
  level?: string;
  spiralDependencyContext?: string;

  // Mastery milestone params
  unitTitle?: string;
  vocabularyWords?: string[];
  grammarPatterns?: string[];
  phonemeFocus?: string;
  targetQuestion?: string;

  // Reinforcement lesson params
  weakestSkill?: string;
  
  // Template selection
  templateId?: string;
}

// ============= HELPER FUNCTIONS =============

function getSystemPrompt(mode: string): string {
  switch(mode) {
    case 'lesson': return ECA_LESSON_PROMPT;
    case 'unit': return ECA_UNIT_PROMPT;
    case 'curriculum': return ECA_CURRICULUM_PROMPT;
    case 'curriculum_structure': return ECA_CURRICULUM_STRUCTURE_PROMPT;
    case 'assessment': return ECA_ASSESSMENT_PROMPT;
    case 'mission': return ECA_MISSION_PROMPT;
    case 'resource': return ECA_RESOURCE_PROMPT;
    case 'mastery_milestone': return ECA_MASTERY_MILESTONE_PROMPT;
    case 'reinforcement_lesson': return ECA_REINFORCEMENT_LESSON_PROMPT;
    case 'generate_report_summary': return `You are a professional ESL teacher writing a diagnostic summary for a parent. Write in a warm, encouraging, professional tone. Return a JSON object: {"summary": "your 2-3 sentence summary"}. Return ONLY valid JSON.`;
    default: return ECA_LESSON_PROMPT;
  }
}

function getModelForMode(mode: string): string {
  if (mode === 'curriculum' || mode === 'curriculum_structure' || mode === 'unit' || mode === 'mastery_milestone') {
    return 'google/gemini-2.5-pro';
  }
  if (mode === 'generate_report_summary' || mode === 'reinforcement_lesson') return 'google/gemini-2.5-flash';
  return 'google/gemini-2.5-flash';
}

function getMaxTokensForMode(mode: string): number {
  if (mode === 'curriculum' || mode === 'curriculum_structure') return 8000;
  if (mode === 'unit' || mode === 'mastery_milestone') return 6000;
  if (mode === 'assessment') return 6000;
  if (mode === 'generate_report_summary') return 500;
  if (mode === 'reinforcement_lesson') return 4000;
  return 4000;
}

function buildUserPrompt(requestData: GenerationRequest): string {
  let userPrompt = requestData.prompt || `Generate a structured curriculum for ${requestData.ageGroup || 'young learners'} at ${requestData.cefrLevel || requestData.level || 'A1'} level.`;
  
  // Add context
  userPrompt += `\n\nContext:`;
  userPrompt += `\n- Mode: ${requestData.mode}`;
  userPrompt += `\n- Age group: ${requestData.ageGroup}`;
  userPrompt += `\n- CEFR level: ${requestData.cefrLevel}`;
  
  if (requestData.duration) {
    userPrompt += `\n- Duration: ${requestData.duration} minutes`;
  }
  
  if (requestData.topic) {
    userPrompt += `\n- Topic: ${requestData.topic}`;
  }
  
  if (requestData.grammarFocus) {
    userPrompt += `\n- Grammar focus: ${requestData.grammarFocus}`;
  }
  
  if (requestData.vocabularyTheme) {
    userPrompt += `\n- Vocabulary theme: ${requestData.vocabularyTheme}`;
  }
  
  // Mode-specific context
  if (requestData.mode === 'unit' && requestData.unitWeeks) {
    userPrompt += `\n- Unit duration: ${requestData.unitWeeks} weeks`;
  }
  
  if (requestData.mode === 'curriculum' && requestData.curriculumMonths) {
    userPrompt += `\n- Curriculum duration: ${requestData.curriculumMonths} months`;
  }

  if (requestData.mode === 'curriculum_structure') {
    const unitCount = requestData.unitCount || 4;
    const lessonsPerUnit = requestData.lessonsPerUnit || 6;
    const level = requestData.level || 'beginner';
    const ageGroup = requestData.ageGroup || 'kids';
    
    const spiralContext = requestData.spiralDependencyContext || '';
    
    userPrompt = `DECORATION TASK: Add creative content to a pre-defined Spiral Curriculum skeleton for ${ageGroup} learners at ${level} level.

The skeleton below defines the EXACT structure: ${unitCount} units, ${lessonsPerUnit} lessons each.
Your job is to ADD ONLY:
- Creative, engaging unit titles (themed for ${ageGroup})
- 5 vocabulary words per unit containing the anchor phoneme
- Specific activity descriptions for listeningTask, speakingTask, readingTask, writingTask
- 3 SMART learning objectives per lesson
- reviewWords (2 words from the previous unit for Discovery lessons of Unit > 1)

DO NOT change: anchorPhoneme, grammarGoal, prerequisiteUnit, skillsMix, cycleType, phonicsFocus, skillTags, skillsFocus, or the unit ordering.

🚨 NUMBERING FIDELITY (MANDATORY):
- Each unit object MUST include "unitNumber" matching the skeleton (1, 2, 3, ..., ${unitCount}).
- Each lesson object MUST include "lessonNumber" matching the skeleton (1, 2, 3, 4, 5, 6).
- You MUST NOT repeat any unitNumber. Unit 1 appears EXACTLY ONCE.
- You MUST NOT skip any unitNumber. If ${unitCount} units are requested, return exactly ${unitCount}.
- The order MUST be Unit 1, Unit 2, ..., Unit ${unitCount}. Never restart at Unit 1.

${spiralContext ? `\n🗺️ SKELETON STRUCTURE (decorate this, do not deviate):\n${spiralContext}` : ''}

OUTPUT: Return ONLY a JSON array of ${unitCount} unit objects. No extra text.`;
  }
  
  if (requestData.mode === 'mastery_milestone') {
    const vocabWords = requestData.vocabularyWords?.join(', ') || 'cat, dog, bird, fish, frog';
    const grammarPats = requestData.grammarPatterns?.join('; ') || 'It is a ___; It is a big ___';
    const phoneme = requestData.phonemeFocus || '/æ/';
    const unitTitle = requestData.unitTitle || 'Animals';
    userPrompt = `Generate a Mastery Milestone for the unit called ${unitTitle}.

Unit Details:
- CEFR Level: ${requestData.cefrLevel || 'A1'}
- Age Group: ${requestData.ageGroup || '5-7'}
- Vocabulary Words: ${vocabWords}
- Grammar Patterns: ${grammarPats}
- Phoneme Focus: ${phoneme}
- Target Question (Lesson 3 Bridge): ${requestData.targetQuestion || 'What is it?'}

Generate the complete Review + Integrated Quiz JSON. Return ONLY valid JSON, no extra text.`;
  }

  if (requestData.mode === 'reinforcement_lesson') {
    const vocabWords = requestData.vocabularyWords?.join(', ') || 'cat, dog, bird';
    const grammarPats = requestData.grammarPatterns?.join('; ') || 'It is a ___';
    const phoneme = requestData.phonemeFocus || '/æ/';
    const unitTitle = requestData.unitTitle || 'Review Unit';
    const weakSkill = requestData.weakestSkill || 'speaking';
    userPrompt = `Generate a Reinforcement Lesson targeting the "${weakSkill}" skill for the unit "${unitTitle}".

Unit Details:
- CEFR Level: ${requestData.cefrLevel || 'A1'}
- Age Group: ${requestData.ageGroup || '5-7'}
- Weakest Skill: ${weakSkill}
- Vocabulary Words: ${vocabWords}
- Grammar Patterns: ${grammarPats}
- Phoneme Focus: ${phoneme}

Remember: 80% of activities must target "${weakSkill}". Return ONLY valid JSON.`;
  }

  if (requestData.mode === 'assessment' && requestData.assessmentType) {
    userPrompt += `\n- Assessment type: ${requestData.assessmentType}`;
  }
  
  if (requestData.mode === 'mission' && requestData.missionChainLength) {
    userPrompt += `\n- Number of quests: ${requestData.missionChainLength}`;
  }
  
  if (requestData.mode === 'resource' && requestData.resourceType) {
    userPrompt += `\n- Resource type: ${requestData.resourceType}`;
  }
  
  // Append CEFR ↔ topic guardrails to curriculum modes
  if (requestData.mode === 'curriculum' || requestData.mode === 'curriculum_structure') {
    const level = normalizeCefr(requestData.cefrLevel || requestData.level);
    if (level === 'PRE-A1' || level === 'A1' || level === 'A2') {
      userPrompt += `

🚦 STRICT LEVEL LOCK: CEFR ${level}
- Use ONLY these themes: Family & Friends, Daily Routine, Foods, Clothes & Weather, Pets & Animals, House/Room, Basic Shopping, Hobbies, Greetings, Toys, Colors & Numbers, School Things, Body Parts, Playground Games.
- DO NOT use: history, wars, revolutions, gladiators, emperors, empires, dynasties, global conflicts, ethics, philosophy, macro-economics, ancient civilizations, geopolitics, pandemics, ideologies.
- Each unit MUST have a DIFFERENT concrete theme — no chronological history arc.
- Vocabulary must be concrete, everyday, child/learner-immediate.`;
    } else if (level === 'B1' || level === 'B2') {
      userPrompt += `

🚦 LEVEL LOCK: CEFR ${level}
- Themes may include travel, jobs, health, technology, light storytelling, environment basics — alongside concrete A1/A2 themes.
- DO NOT use: war, gladiators, emperors, revolutions, empires, geopolitics, advanced philosophy.`;
    } else if (level === 'C1' || level === 'C2') {
      userPrompt += `

🚦 LEVEL LOCK: CEFR ${level}
- Academic and abstract themes (history, civilizations, geopolitics, ethics, philosophy) are permitted here, with sophisticated discourse and analytical tasks.`;
    }
  }

  return userPrompt;

}

function validateOutput(mode: string, data: any): void {
  // Basic validation - check for required fields based on mode
  if (!data) {
    throw new Error('Generated data is empty');
  }
  
  // Mode-specific validation
  switch(mode) {
    case 'lesson':
      if (!data.title || !data.ageGroup || !data.cefrLevel || !data.content) {
        throw new Error('Missing required lesson fields');
      }
      break;
    case 'unit':
      if (!data.unitTitle || !data.durationWeeks || !data.lessons) {
        throw new Error('Missing required unit fields');
      }
      break;
    case 'curriculum':
      if (!data.curriculumTitle || !data.units) {
        throw new Error('Missing required curriculum fields');
      }
      break;
    case 'curriculum_structure':
      // curriculum_structure returns an array of units directly, or an object with units
      if (Array.isArray(data)) {
        if (data.length === 0) throw new Error('No units generated');
        if (!data[0].lessons || data[0].lessons.length === 0) throw new Error('Units must contain lessons');
        // Validate unique unitNumbers — reject repeated Unit 1
        const unitNumbers = data.map((u: any) => u.unitNumber ?? u.unit_number);
        const uniqueNumbers = new Set(unitNumbers.filter((n: any) => typeof n === 'number'));
        if (uniqueNumbers.size < data.length) {
          console.warn('⚠️ AI returned duplicate unit numbers — client will deduplicate');
        }
      } else if (data.units) {
        // Also valid
      } else {
        throw new Error('Missing curriculum structure data');
      }
      break;
    case 'assessment':
      if (!data.assessmentTitle || !data.sections) {
        throw new Error('Missing required assessment fields');
      }
      break;
    case 'mission':
      if (!data.missionTitle || !data.quests) {
        throw new Error('Missing required mission fields');
      }
      break;
    case 'mastery_milestone':
      if (!data.part1_review || !data.part2_quiz) {
        throw new Error('Missing required mastery milestone fields');
      }
      break;
    case 'reinforcement_lesson':
      if (!data.title || !data.targetSkill || !data.activities) {
        throw new Error('Missing required reinforcement lesson fields');
      }
      break;
      if (!data.summary) {
        throw new Error('Missing summary field');
      }
      break;
    case 'resource':
      if (!data.resourceTitle || !data.content) {
        throw new Error('Missing required resource fields');
      }
      break;
  }
}

// ============= MAIN HANDLER =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: GenerationRequest = await req.json();
    const { mode = 'lesson' } = requestData;
    
    console.log(`🎯 Generating ${mode}:`, requestData);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get appropriate system prompt and settings
    let systemPrompt = getSystemPrompt(mode);
    const model = getModelForMode(mode);
    const maxTokens = getMaxTokensForMode(mode);

    // Build user prompt
    let userPrompt = buildUserPrompt(requestData);

    // Cycle 3 — Slot-Filling: pre-assign Unit themes + grammar from THEME_MATRIX
    // BEFORE the LLM runs. For curriculum modes we also swap to the formatter
    // system prompt and post-overwrite any drift. Hard guardrails that every
    // downstream stage (unit, lesson) inherits via the same shared module.
    let preAssignedSlots: Array<{ unitNumber: number; theme: string; target_grammar: string }> = [];
    let pedagogyHub: "playground" | "academy" | "success" | null = null;
    let pedagogyCefr:
      | "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
      | null = null;
    let enforceAssignedThemeFn:
      | ((u: any, slot: any, c: any) => any)
      | null = null;
    try {
      const {
        buildHubCefrPreamble,
        buildFormatterSystemPrompt,
        buildPreAssignedUnitsBlock,
        assignThemesForUnits,
        enforceAssignedTheme,
        normalizeHub,
        normalizeCefr: normCefr,
      } = await import("../_shared/pedagogy/index.ts");
      pedagogyHub = normalizeHub((requestData as any).hub || (requestData as any).ageGroup);
      pedagogyCefr = normCefr(requestData.cefrLevel || requestData.level);
      if (pedagogyHub && pedagogyCefr) {
        const isCurriculumModeForSlots =
          mode === "curriculum" || mode === "curriculum_structure";
        if (isCurriculumModeForSlots) {
          const unitCount =
            Number((requestData as any).unitCount) ||
            (Array.isArray((requestData as any).units) ? (requestData as any).units.length : 0) ||
            6;
          preAssignedSlots = assignThemesForUnits(pedagogyHub, pedagogyCefr, unitCount);
        }
        const preamble = `${buildHubCefrPreamble(pedagogyHub, pedagogyCefr)}\n\n`;
        if (preAssignedSlots.length) {
          // Formatter mode: server pre-assigned the themes.
          systemPrompt =
            `${preamble}${buildFormatterSystemPrompt(pedagogyHub, pedagogyCefr)}\n\n${systemPrompt}`;
          userPrompt = `${userPrompt}\n\n${buildPreAssignedUnitsBlock(preAssignedSlots)}`;
          enforceAssignedThemeFn = enforceAssignedTheme;
          console.log(
            `🧭 Pre-assigned ${preAssignedSlots.length} unit slots for ${pedagogyHub}/${pedagogyCefr}`,
          );
        } else {
          systemPrompt = `${preamble}${systemPrompt}`;
        }
      }

    } catch (e) {
      console.warn("Pedagogy preamble injection skipped:", (e as Error).message);
    }


    console.log(`📝 Using model: ${model}, max tokens: ${maxTokens}`);

    const callModel = async (sysPrompt: string, usrPrompt: string) => {
      const response = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: usrPrompt },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AI error:', response.status, errorText);
        if (response.status === 429) {
          return { ok: false as const, status: 429, error: 'Rate limit exceeded. Please try again in a moment.' };
        }
        if (response.status === 402) {
          return { ok: false as const, status: 402, error: 'AI credits depleted. Please add credits to your workspace.' };
        }
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      let parsedData;
      let cleanedContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
      const jsonObjMatch = cleanedContent.match(/(\{[\s\S]*\})/);
      const jsonArrMatch = cleanedContent.match(/(\[[\s\S]*\])/);
      if (cleanedContent.startsWith('{') || cleanedContent.startsWith('[')) {
        parsedData = JSON.parse(cleanedContent);
      } else if (jsonObjMatch) {
        parsedData = JSON.parse(jsonObjMatch[1]);
      } else if (jsonArrMatch) {
        parsedData = JSON.parse(jsonArrMatch[1]);
      } else {
        throw new Error('No JSON found in response');
      }
      return { ok: true as const, parsed: parsedData };
    };

    const isCurriculumMode = mode === 'curriculum' || mode === 'curriculum_structure';
    const lockLevel = normalizeCefr(requestData.cefrLevel || requestData.level);

    let parsedData: any;
    let attempts = 0;
    const maxAttempts = isCurriculumMode ? 2 : 1;

    while (attempts < maxAttempts) {
      attempts++;
      const result = await callModel(systemPrompt, userPrompt);
      if (!result.ok) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: result.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      parsedData = result.parsed;

      validateOutput(mode, parsedData);

      if (isCurriculumMode) {
        const hit = findForbiddenTopicHit(lockLevel, parsedData);
        if (hit) {
          console.warn(`⛔ LEVEL_TOPIC_MISMATCH (attempt ${attempts}): term="${hit.term}" level=${lockLevel} sample="${hit.sample}"`);
          if (attempts < maxAttempts) {
            userPrompt += `

🚨 PREVIOUS OUTPUT REJECTED: it used the forbidden term "${hit.term}" which is NOT allowed at CEFR ${lockLevel}.
Regenerate using ONLY the allow-list above (concrete, immediate, personal themes for A1/A2).
Do NOT use: history, wars, revolutions, gladiators, emperors, empires, dynasties, conflicts, geopolitics, ancient civilizations, ideologies, philosophy, macro-economics, colonialism, industrialization, pandemics.`;
            continue;
          }
          return new Response(
            JSON.stringify({
              error: 'LEVEL_TOPIC_MISMATCH',
              details: `Generated curriculum at CEFR ${lockLevel} contained forbidden topic term "${hit.term}". Please regenerate.`,
              offending_sample: hit.sample,
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
      }
      break;
    }

    // Cycle 3 — post-generation Slot-Fill enforcement. Force-overwrite the
    // LLM's title/theme/grammar with the server-assigned values so any drift
    // is silently corrected. The LLM only keeps its prose contributions.
    if (
      enforceAssignedThemeFn &&
      preAssignedSlots.length &&
      pedagogyCefr &&
      (mode === "curriculum" || mode === "curriculum_structure")
    ) {
      const applySlot = (unit: any, idx: number) => {
        const slot = preAssignedSlots[idx] ?? preAssignedSlots[preAssignedSlots.length - 1];
        return enforceAssignedThemeFn!(unit, slot, pedagogyCefr);
      };
      if (Array.isArray(parsedData)) {
        parsedData = parsedData.map(applySlot);
      } else if (parsedData && Array.isArray(parsedData.units)) {
        parsedData.units = parsedData.units.map(applySlot);
      }
      console.log(`🔒 Slot-Fill enforced on ${preAssignedSlots.length} unit slots`);
    }

    console.log(`✅ ${mode} generated successfully`);

    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );



  } catch (error) {
    console.error('❌ Error in curriculum-expert-agent:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate curriculum material',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
