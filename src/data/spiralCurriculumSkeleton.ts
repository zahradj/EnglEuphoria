/**
 * Spiral Curriculum Skeleton — The Dependency Tree
 * 
 * 6-Lesson Unit Architecture:
 *   Lessons 1-4: Progressive build-up (Phonics → Vocab → Grammar → Production)
 *   Lesson 5: The Grand Review (integrated L/S/R/W with high teacher support)
 *   Lesson 6: The Mastery Quiz (clinical assessment, no hints)
 */

export interface SpiralUnit {
  unit: number;
  theme: string;
  phonicsGoal: string;
  phonicsCategory: 'consonant' | 'short_vowel' | 'long_vowel' | 'blend' | 'digraph';
  grammarGoal: string;
  prerequisiteUnit: number | null;
  skillsMix: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  vocabularyConstraints: {
    newWords: number;
    reviewWordsFromPrevUnit: number;
    phonemeFilter: string;
  };
  lessons: SpiralLessonTemplate[];
}

export interface SpiralLessonTemplate {
  id: string;
  focus: string;
  cycleType: 'discovery' | 'ladder' | 'bridge' | 'review' | 'quiz';
  activities: string[];
  skillTags: ('L' | 'S' | 'R' | 'W')[];
  /** If true, all scaffold hints are disabled (quiz mode) */
  hintsDisabled?: boolean;
  /** If true, this is a high-support lesson with wizard hints active */
  highSupport?: boolean;
}

// ─── Wizard Manifest Types ────────────────────────────────────────
export interface AIWizardManifest {
  unitNumber: number;
  lessonNumber: number;
  cycleType: 'discovery' | 'ladder' | 'bridge' | 'review' | 'quiz';
  anchorPhoneme: string;
  grammarGoal: string;
  vocabularyList: any[];
  prerequisiteUnit: number | null;
  reviewFromUnit: number | null;
  skillsRequired: string[];
  hintsDisabled: boolean;
  highSupport: boolean;
  masteryCriteria: string | null;
  wizardScript: string;
  wizardActions: string[];
  interactionTriggers: string[];
}

// ─── Generated unit/lesson types (output of skeleton → generated) ──
export interface SkeletonGeneratedUnit {
  unitNumber: number;
  title: string;
  anchorPhoneme: string;
  grammarGoal: string;
  prerequisiteUnit: number | null;
  skillsMix: { listening: number; speaking: number; reading: number; writing: number };
  lessons: SkeletonGeneratedLesson[];
}

export interface SkeletonGeneratedLesson {
  lessonNumber: number;
  title: string;
  objectives: string[];
  grammarFocus: string;
  vocabularyTheme: string;
  cycleType: 'discovery' | 'ladder' | 'bridge' | 'review' | 'quiz';
  phonicsFocus: string;
  vocabularyList: any[];
  grammarPattern: string;
  skillsFocus: string[];
  skillTags: string[];
  listeningTask: string;
  speakingTask: string;
  readingTask: string;
  writingTask: string;
  reviewWords: string[];
  bridgeRetrieval: any[];
  masteryCheck: string | null;
  hintsDisabled?: boolean;
  highSupport?: boolean;
  aiWizardManifest?: AIWizardManifest;
}

// ─── The 10-Unit Progressive Skeleton (Beginner/Kids) ─────────────
// Each unit = 6 lessons: 4 build-up + 1 review + 1 quiz
export const BEGINNER_KIDS_SKELETON: SpiralUnit[] = [
  {
    unit: 1,
    theme: 'The Beginning',
    phonicsGoal: '/s/',
    phonicsCategory: 'consonant',
    grammarGoal: 'Noun Identification (It is a...)',
    prerequisiteUnit: null,
    skillsMix: { listening: 40, speaking: 40, reading: 15, writing: 5 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 0, phonemeFilter: 's' },
    lessons: [
      { id: '1.1', focus: 'Sound Recognition /s/', cycleType: 'discovery', activities: ['Phonetic Slider', 'Listening Spotting', 'Sound Sort'], skillTags: ['L', 'S'] },
      { id: '1.2', focus: 'Word Integration', cycleType: 'ladder', activities: ['Grammar Blocks: "It is a ___"', 'Flat 2.0 Mapping', 'Word Builder'], skillTags: ['R', 'S'] },
      { id: '1.3', focus: 'Sentence Building', cycleType: 'ladder', activities: ['Sentence Ladder', 'Picture Label', 'Grammar Blocks'], skillTags: ['R', 'W'] },
      { id: '1.4', focus: 'Sentence Production', cycleType: 'bridge', activities: ['Speaking: "What is it?"', 'Tracing Letter S', 'Free Speaking'], skillTags: ['S', 'W'] },
      { id: '1.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '1.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 2,
    theme: 'Action & Movement',
    phonicsGoal: '/m/',
    phonicsCategory: 'consonant',
    grammarGoal: 'Article Usage (A vs AN)',
    prerequisiteUnit: 1,
    skillsMix: { listening: 30, speaking: 30, reading: 25, writing: 15 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 'm' },
    lessons: [
      { id: '2.1', focus: 'Review /s/ + Intro /m/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Contrastive Listening', 'Phoneme Tap'], skillTags: ['L', 'S'] },
      { id: '2.2', focus: 'Article Practice', cycleType: 'ladder', activities: ['Article Picker: a vs an', 'Grammar Blocks', 'Sentence Ladder'], skillTags: ['R', 'S'] },
      { id: '2.3', focus: 'Complex Vocabulary', cycleType: 'ladder', activities: ['Ghost Vector Retrieval', 'Word Builder', 'Picture Label'], skillTags: ['R', 'W'] },
      { id: '2.4', focus: 'Structural Writing', cycleType: 'bridge', activities: ['Block Snapping', 'Full Word Tracing', 'Speaking Production'], skillTags: ['W', 'S'] },
      { id: '2.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '2.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 3,
    theme: 'My World',
    phonicsGoal: '/t/',
    phonicsCategory: 'consonant',
    grammarGoal: 'Plural -s (cats, mats)',
    prerequisiteUnit: 2,
    skillsMix: { listening: 25, speaking: 30, reading: 25, writing: 20 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 't' },
    lessons: [
      { id: '3.1', focus: 'Review /m/ + Intro /t/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Sound Sort /s/ vs /m/ vs /t/', 'Odd One Out'], skillTags: ['L', 'S'] },
      { id: '3.2', focus: 'Plural Nouns', cycleType: 'ladder', activities: ['Grammar Blocks: "They are ___s"', 'Picture Label Plural', 'Sentence Transform'], skillTags: ['R', 'S'] },
      { id: '3.3', focus: 'Plural Sentences', cycleType: 'ladder', activities: ['Sentence Ladder + plurals', 'Word Builder', 'Grammar Blocks'], skillTags: ['R', 'W'] },
      { id: '3.4', focus: 'Question Formation', cycleType: 'bridge', activities: ['Speaking: "Are they ___s?"', 'Letter Hunt', 'Free Production'], skillTags: ['S', 'W'] },
      { id: '3.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '3.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 4,
    theme: 'Colors & Shapes',
    phonicsGoal: '/æ/',
    phonicsCategory: 'short_vowel',
    grammarGoal: 'Adjective + Noun (a big cat)',
    prerequisiteUnit: 3,
    skillsMix: { listening: 20, speaking: 30, reading: 25, writing: 25 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 'a' },
    lessons: [
      { id: '4.1', focus: 'Review /t/ + Intro /æ/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Minimal Pairs: cat/cut', 'Phonics Slider'], skillTags: ['L', 'S'] },
      { id: '4.2', focus: 'Adjective Placement', cycleType: 'ladder', activities: ['Grammar Blocks: "It is a ___ ___"', 'Sentence Ladder +adjective', 'Word Builder'], skillTags: ['R', 'S'] },
      { id: '4.3', focus: 'Descriptive Sentences', cycleType: 'ladder', activities: ['Picture Label + adjective', 'Sentence Transform', 'Grammar Blocks'], skillTags: ['R', 'W'] },
      { id: '4.4', focus: 'Descriptive Speaking', cycleType: 'bridge', activities: ['Speaking: "What color is it?"', 'Tactile Tracing', 'Free Production'], skillTags: ['S', 'W'] },
      { id: '4.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '4.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 5,
    theme: 'Food & Drinks',
    phonicsGoal: '/p/',
    phonicsCategory: 'consonant',
    grammarGoal: 'Question: "Do you like ___?"',
    prerequisiteUnit: 4,
    skillsMix: { listening: 20, speaking: 30, reading: 25, writing: 25 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 'p' },
    lessons: [
      { id: '5.1', focus: 'Review /æ/ + Intro /p/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Sound Spotting', 'Phoneme Tap'], skillTags: ['L', 'S'] },
      { id: '5.2', focus: 'Question Building', cycleType: 'ladder', activities: ['Grammar Blocks: "Do you like ___?"', 'Sentence Transform', 'Picture Label'], skillTags: ['R', 'S'] },
      { id: '5.3', focus: 'Question & Answer', cycleType: 'ladder', activities: ['Dialogue Practice', 'Sentence Ladder', 'Grammar Blocks'], skillTags: ['R', 'W'] },
      { id: '5.4', focus: 'Real Conversation', cycleType: 'bridge', activities: ['Speaking: Free Dialogue', 'Word Tracing', 'Free Production'], skillTags: ['S', 'W'] },
      { id: '5.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '5.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 6,
    theme: 'Animals',
    phonicsGoal: '/ɪ/',
    phonicsCategory: 'short_vowel',
    grammarGoal: 'Has / Have (It has legs)',
    prerequisiteUnit: 5,
    skillsMix: { listening: 15, speaking: 25, reading: 30, writing: 30 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 'i' },
    lessons: [
      { id: '6.1', focus: 'Review /p/ + Intro /ɪ/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Minimal Pairs: pin/pen', 'Sound Sort'], skillTags: ['L', 'S'] },
      { id: '6.2', focus: 'Has/Have Structure', cycleType: 'ladder', activities: ['Grammar Blocks: "It has ___"', 'Sentence Ladder + has/have', 'Odd One Out'], skillTags: ['R', 'S'] },
      { id: '6.3', focus: 'Animal Descriptions', cycleType: 'ladder', activities: ['Picture Label + has/have', 'Word Builder', 'Sentence Transform'], skillTags: ['R', 'W'] },
      { id: '6.4', focus: 'Animal Presentation', cycleType: 'bridge', activities: ['Speaking: "Does it have ___?"', 'Letter Hunt', 'Free Production'], skillTags: ['S', 'W'] },
      { id: '6.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '6.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 7,
    theme: 'My Family',
    phonicsGoal: '/n/',
    phonicsCategory: 'consonant',
    grammarGoal: 'Possessives (my, your, his, her)',
    prerequisiteUnit: 6,
    skillsMix: { listening: 15, speaking: 25, reading: 30, writing: 30 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 'n' },
    lessons: [
      { id: '7.1', focus: 'Review /ɪ/ + Intro /n/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Sound Spotting', 'Phonics Slider'], skillTags: ['L', 'S'] },
      { id: '7.2', focus: 'Possessive Pronouns', cycleType: 'ladder', activities: ['Grammar Blocks: "This is my ___"', 'Article Picker: my/your', 'Sentence Transform'], skillTags: ['R', 'S'] },
      { id: '7.3', focus: 'Possessive Sentences', cycleType: 'ladder', activities: ['Sentence Ladder + possessives', 'Word Builder', 'Picture Label'], skillTags: ['R', 'W'] },
      { id: '7.4', focus: 'Family Presentation', cycleType: 'bridge', activities: ['Speaking: "Who is this?"', 'Tactile Tracing', 'Free Production'], skillTags: ['S', 'W'] },
      { id: '7.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '7.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 8,
    theme: 'At Home',
    phonicsGoal: '/ɒ/',
    phonicsCategory: 'short_vowel',
    grammarGoal: 'Prepositions (in, on, under)',
    prerequisiteUnit: 7,
    skillsMix: { listening: 10, speaking: 25, reading: 30, writing: 35 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 'o' },
    lessons: [
      { id: '8.1', focus: 'Review /n/ + Intro /ɒ/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Minimal Pairs: hot/hat', 'Phoneme Tap'], skillTags: ['L', 'S'] },
      { id: '8.2', focus: 'Preposition Sentences', cycleType: 'ladder', activities: ['Grammar Blocks: "The ___ is on the ___"', 'Picture Label + prep', 'Word Builder'], skillTags: ['R', 'S'] },
      { id: '8.3', focus: 'Location Descriptions', cycleType: 'ladder', activities: ['Sentence Ladder + prepositions', 'Sentence Transform', 'Grammar Blocks'], skillTags: ['R', 'W'] },
      { id: '8.4', focus: 'Room Description', cycleType: 'bridge', activities: ['Speaking: "Where is the ___?"', 'Letter Hunt', 'Free Production'], skillTags: ['S', 'W'] },
      { id: '8.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '8.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 9,
    theme: 'Daily Routine',
    phonicsGoal: '/ʃ/',
    phonicsCategory: 'digraph',
    grammarGoal: 'Present Simple (I wake up, I eat)',
    prerequisiteUnit: 8,
    skillsMix: { listening: 10, speaking: 20, reading: 30, writing: 40 },
    vocabularyConstraints: { newWords: 5, reviewWordsFromPrevUnit: 2, phonemeFilter: 'sh' },
    lessons: [
      { id: '9.1', focus: 'Review /ɒ/ + Intro /ʃ/', cycleType: 'discovery', activities: ['Bridge Retrieval Quiz', 'Sound Sort: /s/ vs /ʃ/', 'Mouth Mirror'], skillTags: ['L', 'S'] },
      { id: '9.2', focus: 'Routine Sentences', cycleType: 'ladder', activities: ['Grammar Blocks: "I ___ every day"', 'Sentence Ladder + time', 'Sentence Transform'], skillTags: ['R', 'S'] },
      { id: '9.3', focus: 'Time Expressions', cycleType: 'ladder', activities: ['Word Builder', 'Picture Label + routine', 'Grammar Blocks'], skillTags: ['R', 'W'] },
      { id: '9.4', focus: 'Describing Your Day', cycleType: 'bridge', activities: ['Speaking: "What do you do?"', 'Paragraph Writing', 'Free Production'], skillTags: ['S', 'W'] },
      { id: '9.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '9.6', focus: 'Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
  {
    unit: 10,
    theme: 'The Big Review',
    phonicsGoal: '/tʃ/',
    phonicsCategory: 'digraph',
    grammarGoal: 'Review All: Nouns → Questions → Descriptions',
    prerequisiteUnit: 9,
    skillsMix: { listening: 10, speaking: 20, reading: 30, writing: 40 },
    vocabularyConstraints: { newWords: 3, reviewWordsFromPrevUnit: 5, phonemeFilter: 'ch' },
    lessons: [
      { id: '10.1', focus: 'Phonics Grand Review', cycleType: 'discovery', activities: ['All-Sound Sort', 'Minimal Pairs Marathon', 'Contrastive Listening'], skillTags: ['L', 'S'] },
      { id: '10.2', focus: 'Grammar Grand Review', cycleType: 'ladder', activities: ['Grammar Blocks: all patterns', 'Sentence Transform: all types', 'Word Builder'], skillTags: ['R', 'S'] },
      { id: '10.3', focus: 'Writing Grand Review', cycleType: 'ladder', activities: ['Paragraph Writing', 'Sentence Ladder: complex', 'Letter Hunt'], skillTags: ['R', 'W'] },
      { id: '10.4', focus: 'Final Presentation', cycleType: 'bridge', activities: ['Speaking: free production', 'Portfolio Showcase', 'Peer Feedback'], skillTags: ['S', 'W'] },
      { id: '10.5', focus: 'The Grand Review', cycleType: 'review', activities: ['Multi-choice Sound Matching (all vocab)', 'Speed Mimicry', 'Full Word Tracing (hardest words)', 'Grammar Fix'], skillTags: ['L', 'S', 'R', 'W'], highSupport: true },
      { id: '10.6', focus: 'Final Mastery Quiz', cycleType: 'quiz', activities: ['Speaking Test: 5 words >85% accuracy', 'Dictation: write from scratch', 'Grammar Fix: "Fix the Wizard"', 'Celebration & Certificate'], skillTags: ['L', 'S', 'R', 'W'], hintsDisabled: true },
    ],
  },
];

// ─── Teens Skeleton (adapted themes, same phonics/grammar progression) ──
export const BEGINNER_TEENS_SKELETON: SpiralUnit[] = BEGINNER_KIDS_SKELETON.map(u => ({
  ...u,
  theme: [
    'First Impressions', 'Sports & Action', 'My Digital World', 'Style & Identity',
    'Food Culture', 'Wildlife & Nature', 'Family Dynamics', 'My Space',
    'Daily Life & Routines', 'The Big Review'
  ][u.unit - 1] || u.theme,
}));

// ─── Adults Skeleton (adapted themes, same progression) ──
export const BEGINNER_ADULTS_SKELETON: SpiralUnit[] = BEGINNER_KIDS_SKELETON.map(u => ({
  ...u,
  theme: [
    'Meeting People', 'Getting Around', 'The Workplace', 'Describing Things',
    'Dining Out', 'The Natural World', 'Relationships', 'At Home & Office',
    'Daily Routine & Habits', 'Comprehensive Review'
  ][u.unit - 1] || u.theme,
}));

// ─── Pre-A1 Skeleton (Visual + Audio FIRST — no reading/writing pressure) ──
// Short 6-unit track. Each unit teaches ONE phoneme + ONE picture-chunk via
// listen-and-point, sound-mimic, chant-along. NO tracing, NO grammar blocks,
// NO sentence transform. Lessons keep the standard cycleType labels so the
// downstream wizard/validator pipeline still works unchanged.
const preA1Lesson = (
  id: string,
  focus: string,
  cycleType: SpiralLessonTemplate['cycleType'],
  activities: string[],
  extras: Partial<SpiralLessonTemplate> = {},
): SpiralLessonTemplate => ({
  id,
  focus,
  cycleType,
  activities,
  skillTags: ['L', 'S'], // Pre-A1 = audio-visual only
  ...extras,
});

const buildPreA1Unit = (
  unit: number,
  theme: string,
  phonicsGoal: string,
  phonicsCategory: SpiralUnit['phonicsCategory'],
  chunkGoal: string,
  phonemeFilter: string,
  prerequisiteUnit: number | null,
): SpiralUnit => ({
  unit,
  theme,
  phonicsGoal,
  phonicsCategory,
  grammarGoal: chunkGoal, // Pre-A1: picture-chunk only, never grammar metalanguage
  prerequisiteUnit,
  // Audio-visual dominant. Reading/writing intentionally near zero.
  skillsMix: { listening: 55, speaking: 35, reading: 7, writing: 3 },
  vocabularyConstraints: { newWords: 3, reviewWordsFromPrevUnit: prerequisiteUnit ? 1 : 0, phonemeFilter },
  lessons: [
    preA1Lesson(`${unit}.1`, `Listen & Look — ${phonicsGoal}`, 'discovery',
      ['Picture Reveal', 'Sound Mimic', 'Audio Hello']),
    preA1Lesson(`${unit}.2`, 'Point & Say', 'ladder',
      ['Picture-Tap', 'Audio Match', 'Sticker Drop']),
    preA1Lesson(`${unit}.3`, 'Chant Along', 'ladder',
      ['Echo Chant', 'Animated Singalong', 'Picture Carousel']),
    preA1Lesson(`${unit}.4`, 'Show Me!', 'bridge',
      ['Speak the Picture', 'Wave & Say', 'Free Mimic']),
    preA1Lesson(`${unit}.5`, 'Picture Playtime (Review)', 'review',
      ['Big Picture Hunt', 'Sound Sticker Race', 'Chant Replay'], { highSupport: true }),
    preA1Lesson(`${unit}.6`, 'Show What You Know', 'quiz',
      ['Picture-Tap Test', 'Speak-the-Word Test', 'Audio Listen-Match'], { hintsDisabled: true }),
  ],
});

export const PRE_A1_KIDS_SKELETON: SpiralUnit[] = [
  buildPreA1Unit(1, 'Hello, Friend!',  '/h/', 'consonant', 'Wave + say: "Hi!" / "Bye!"',      'h', null),
  buildPreA1Unit(2, 'Look at That!',   '/l/', 'consonant', 'Point + say: "Look! A ___."',      'l', 1),
  buildPreA1Unit(3, 'Happy Colors',    '/r/', 'consonant', 'Tap + say: "red / blue / yellow"', 'r', 2),
  buildPreA1Unit(4, 'One, Two, Three', '/w/', 'consonant', 'Count + say: "one, two, three"',   'w', 3),
  buildPreA1Unit(5, 'Cute Animals',    '/k/', 'consonant', 'Show + say: "a cat / a dog"',      'k', 4),
  buildPreA1Unit(6, 'Yummy Food',      '/m/', 'consonant', 'Mime + say: "I like ___ (mmm!)"',  'm', 5),
];

export const PRE_A1_TEENS_SKELETON: SpiralUnit[] = PRE_A1_KIDS_SKELETON.map(u => ({
  ...u,
  theme: ['Say Hi', 'Spot It', 'Color Vibes', 'Quick Count', 'Animal Pics', 'Food I Like'][u.unit - 1] || u.theme,
}));

export const PRE_A1_ADULTS_SKELETON: SpiralUnit[] = PRE_A1_KIDS_SKELETON.map(u => ({
  ...u,
  theme: ['Greetings', 'Pointing Things Out', 'Basic Colors', 'Numbers 1–5', 'Common Animals', 'Food Basics'][u.unit - 1] || u.theme,
}));

// ─── Helper: Get the skeleton for a given hub/level ─────────────────
export function getSpiralSkeleton(ageGroup: string, level: string): SpiralUnit[] {
  const normalized = (level || '').toLowerCase();
  const isPreA1 = normalized === 'pre-a1' || normalized === 'prea1' || normalized === 'pre_a1';

  if (isPreA1) {
    switch (ageGroup) {
      case 'teens':  return PRE_A1_TEENS_SKELETON;
      case 'adults': return PRE_A1_ADULTS_SKELETON;
      default:       return PRE_A1_KIDS_SKELETON;
    }
  }

  switch (ageGroup) {
    case 'teens':  return BEGINNER_TEENS_SKELETON;
    case 'adults': return BEGINNER_ADULTS_SKELETON;
    default:       return BEGINNER_KIDS_SKELETON;
  }
}

// ─── Helper: Build Wizard Manifest for a lesson ─────────────────────
function buildWizardManifest(
  skelUnit: SpiralUnit,
  tpl: SpiralLessonTemplate,
  lessonNumber: number,
  prevUnit: SpiralUnit | null,
): AIWizardManifest {
  const skillMap: Record<string, string> = { L: 'listening', S: 'speaking', R: 'reading', W: 'writing' };
  
  let wizardScript = '';
  let wizardActions: string[] = [];
  let interactionTriggers: string[] = [];

  switch (tpl.cycleType) {
    case 'discovery':
      wizardScript = `Welcome to Unit ${skelUnit.unit}! Today we discover the ${skelUnit.phonicsGoal} sound. ${prevUnit ? `First, let's review what we learned about ${prevUnit.phonicsGoal}.` : 'Let\'s begin!'}`;
      wizardActions = ['Wizard points to the sound card', 'Wizard listens with cupped ear', 'Wizard celebrates correct answer'];
      interactionTriggers = ['activate_bridge_retrieval', 'activate_phonics_slider', 'activate_sound_sort'];
      break;
    case 'ladder':
      wizardScript = `Now let's build sentences! We use "${skelUnit.grammarGoal}" with our new words.`;
      wizardActions = ['Wizard shows grammar pattern', 'Wizard guides block placement', 'Wizard nods encouragingly'];
      interactionTriggers = ['activate_grammar_blocks', 'activate_word_builder', 'activate_sentence_ladder'];
      break;
    case 'bridge':
      wizardScript = `You're ready to speak on your own! Show me what you've learned about ${skelUnit.phonicsGoal} and "${skelUnit.grammarGoal}".`;
      wizardActions = ['Wizard steps back', 'Wizard gives thumbs up', 'Wizard records speaking'];
      interactionTriggers = ['activate_free_speaking', 'activate_writing_canvas', 'activate_mastery_check'];
      break;
    case 'review':
      wizardScript = `The Grand Review! Let's go through everything from this unit before the big quiz. I'll help you every step of the way.`;
      wizardActions = ['Wizard provides hints', 'Wizard highlights correct answers', 'Wizard replays difficult items'];
      interactionTriggers = ['activate_review_carousel', 'activate_speed_mimicry', 'activate_grammar_fix'];
      break;
    case 'quiz':
      wizardScript = `Mastery Quiz time! No hints — show me what you know. You need 80% to unlock the next unit!`;
      wizardActions = ['Wizard observes silently', 'Wizard records scores', 'Wizard reveals final score'];
      interactionTriggers = ['activate_speaking_test', 'activate_dictation', 'activate_grammar_fix_no_hints'];
      break;
  }

  return {
    unitNumber: skelUnit.unit,
    lessonNumber,
    cycleType: tpl.cycleType,
    anchorPhoneme: skelUnit.phonicsGoal,
    grammarGoal: skelUnit.grammarGoal,
    vocabularyList: [],
    prerequisiteUnit: skelUnit.prerequisiteUnit,
    reviewFromUnit: tpl.cycleType === 'discovery' && prevUnit ? prevUnit.unit : null,
    skillsRequired: tpl.skillTags.map(t => skillMap[t] || t),
    hintsDisabled: tpl.hintsDisabled || false,
    highSupport: tpl.highSupport || false,
    masteryCriteria: tpl.cycleType === 'quiz' ? 'Score >80% across all skills to unlock next unit' :
                     tpl.cycleType === 'bridge' ? `Independent use of "${skelUnit.grammarGoal}"` : null,
    wizardScript,
    wizardActions,
    interactionTriggers,
  };
}

// ─── Helper: Convert a skeleton unit into a GeneratedUnit ──────────
export function skeletonToGeneratedUnit(
  skelUnit: SpiralUnit,
  prevUnit: SpiralUnit | null,
  lessonsPerUnit: number,
): SkeletonGeneratedUnit {
  const lessons = skelUnit.lessons.slice(0, lessonsPerUnit);
  
  return {
    unitNumber: skelUnit.unit,
    title: `Unit ${skelUnit.unit}: ${skelUnit.theme}`,
    anchorPhoneme: skelUnit.phonicsGoal,
    grammarGoal: skelUnit.grammarGoal,
    prerequisiteUnit: skelUnit.prerequisiteUnit,
    skillsMix: { ...skelUnit.skillsMix },
    lessons: lessons.map((tpl, li) => {
      const lessonNumber = li + 1;
      return {
        lessonNumber,
        title: `${getCycleEmoji(tpl.cycleType)} ${tpl.focus}`,
        objectives: buildDefaultObjectives(skelUnit, tpl),
        grammarFocus: skelUnit.grammarGoal,
        vocabularyTheme: skelUnit.theme,
        cycleType: tpl.cycleType,
        phonicsFocus: skelUnit.phonicsGoal,
        vocabularyList: [],
        grammarPattern: skelUnit.grammarGoal,
        skillsFocus: tpl.skillTags.map(t => ({ L: 'listening', S: 'speaking', R: 'reading', W: 'writing' }[t] || t)),
        skillTags: [...tpl.skillTags],
        listeningTask: tpl.activities.find(a => a.toLowerCase().includes('listen') || a.toLowerCase().includes('sound')) || `Listen for the ${skelUnit.phonicsGoal} sound`,
        speakingTask: tpl.activities.find(a => a.toLowerCase().includes('speak') || a.toLowerCase().includes('mimic')) || `Say words with ${skelUnit.phonicsGoal}`,
        readingTask: tpl.activities.find(a => a.toLowerCase().includes('read') || a.toLowerCase().includes('grammar') || a.toLowerCase().includes('block')) || `Read words with ${skelUnit.phonicsGoal}`,
        writingTask: tpl.activities.find(a => a.toLowerCase().includes('trac') || a.toLowerCase().includes('writ') || a.toLowerCase().includes('dictat')) || `Trace the letter for ${skelUnit.phonicsGoal}`,
        reviewWords: prevUnit && tpl.cycleType === 'discovery'
          ? [`[word from Unit ${prevUnit.unit}]`, `[word from Unit ${prevUnit.unit}]`]
          : [],
        bridgeRetrieval: prevUnit && tpl.cycleType === 'discovery'
          ? [{ question: `Review: What sound does ${prevUnit.phonicsGoal} make?`, type: 'recall' }]
          : [],
        masteryCheck: tpl.cycleType === 'bridge' ? `Can the student use "${skelUnit.grammarGoal}" independently?` : 
                       tpl.cycleType === 'quiz' ? `Mastery Score > 80% to unlock next Unit` : null,
        hintsDisabled: tpl.hintsDisabled || false,
        highSupport: tpl.highSupport || false,
        aiWizardManifest: buildWizardManifest(skelUnit, tpl, lessonNumber, prevUnit),
      };
    }),
  };
}

function getCycleEmoji(cycleType: string): string {
  switch (cycleType) {
    case 'discovery': return '🔍';
    case 'ladder': return '🪜';
    case 'bridge': return '🌉';
    case 'review': return '📋';
    case 'quiz': return '🏆';
    default: return '📖';
  }
}

function buildDefaultObjectives(unit: SpiralUnit, lesson: SpiralLessonTemplate): string[] {
  const base = [];
  if (lesson.cycleType === 'discovery') {
    base.push(`Recognize and produce the ${unit.phonicsGoal} sound`);
    base.push(`Identify 5 new vocabulary words containing ${unit.vocabularyConstraints.phonemeFilter}`);
    base.push(`Respond to simple questions using "${unit.grammarGoal}"`);
  } else if (lesson.cycleType === 'ladder') {
    base.push(`Build sentences using the pattern: ${unit.grammarGoal}`);
    base.push(`Read and match vocabulary words to images`);
    base.push(`Write simple words and sentences with support`);
  } else if (lesson.cycleType === 'bridge') {
    base.push(`Produce spoken sentences using ${unit.grammarGoal} independently`);
    base.push(`Demonstrate mastery of ${unit.phonicsGoal} in context`);
    base.push(`Complete a mastery check for this unit's targets`);
  } else if (lesson.cycleType === 'review') {
    base.push(`Review all vocabulary from Lessons 1–4 with high teacher support`);
    base.push(`Re-trace phonics and grammar rules from the unit`);
    base.push(`Achieve 100% confidence before the Mastery Quiz`);
  } else if (lesson.cycleType === 'quiz') {
    base.push(`Demonstrate >85% speaking accuracy on unit vocabulary`);
    base.push(`Write dictated words without tracing support`);
    base.push(`Correct grammar errors independently (no hints)`);
  }
  return base;
}

// ─── Helper: Validate AI output against skeleton (by unitNumber/lessonNumber) ──
export function validateAndEnforceProgression(
  aiUnits: any[],
  skeleton: SpiralUnit[],
  unitCount: number,
): SkeletonGeneratedUnit[] {
  const slicedSkeleton = skeleton.slice(0, unitCount);

  // Build a lookup of AI units by unitNumber (not array index)
  const aiUnitMap = new Map<number, any>();
  if (Array.isArray(aiUnits)) {
    for (const aiUnit of aiUnits) {
      const num = aiUnit?.unitNumber ?? aiUnit?.unit_number;
      if (typeof num === 'number' && num >= 1 && num <= unitCount) {
        // Only accept first occurrence — reject duplicates (e.g. repeated Unit 1)
        if (!aiUnitMap.has(num)) {
          aiUnitMap.set(num, aiUnit);
        } else {
          console.warn(`⚠️ Duplicate AI unit #${num} rejected — keeping first occurrence`);
        }
      }
    }
  }
  
  return slicedSkeleton.map((skelUnit, i) => {
    const prevSkel = i > 0 ? slicedSkeleton[i - 1] : null;
    
    // Match AI unit by unitNumber, not by array index
    const aiUnit = aiUnitMap.get(skelUnit.unit);
    
    // If no AI unit for this skeleton unit, use pure skeleton
    if (!aiUnit) {
      return skeletonToGeneratedUnit(skelUnit, prevSkel, skelUnit.lessons.length);
    }
    
    // Merge: keep AI creative content but ENFORCE skeleton structure
    const baseSkel = skeletonToGeneratedUnit(skelUnit, prevSkel, skelUnit.lessons.length);

    // Build AI lesson lookup by lessonNumber
    const aiLessonMap = new Map<number, any>();
    if (Array.isArray(aiUnit.lessons)) {
      for (const aiLesson of aiUnit.lessons) {
        const lNum = aiLesson?.lessonNumber ?? aiLesson?.lesson_number;
        if (typeof lNum === 'number' && lNum >= 1 && lNum <= 6) {
          if (!aiLessonMap.has(lNum)) {
            aiLessonMap.set(lNum, aiLesson);
          }
        }
      }
    }
    
    return {
      ...baseSkel,
      title: aiUnit.title && !aiUnit.title.startsWith('Unit')
        ? `Unit ${skelUnit.unit}: ${aiUnit.title}`
        : aiUnit.title || baseSkel.title,
      // ENFORCE structural fields from skeleton (never from AI)
      anchorPhoneme: skelUnit.phonicsGoal,
      grammarGoal: skelUnit.grammarGoal,
      prerequisiteUnit: skelUnit.prerequisiteUnit,
      skillsMix: { ...skelUnit.skillsMix },
      lessons: baseSkel.lessons.map((skelLesson) => {
        // Match by lessonNumber, not array index
        const aiLesson = aiLessonMap.get(skelLesson.lessonNumber);
        if (!aiLesson) return skelLesson;
        
        return {
          ...skelLesson,
          // Allow AI creative overrides for these fields only:
          title: aiLesson.title || skelLesson.title,
          objectives: (aiLesson.objectives?.length > 0) ? aiLesson.objectives : skelLesson.objectives,
          vocabularyTheme: aiLesson.vocabularyTheme || aiLesson.vocabulary_theme || skelLesson.vocabularyTheme,
          vocabularyList: (aiLesson.vocabularyList?.length > 0 || aiLesson.vocabulary_list?.length > 0)
            ? (aiLesson.vocabularyList || aiLesson.vocabulary_list)
            : skelLesson.vocabularyList,
          listeningTask: aiLesson.listeningTask || aiLesson.listening_task || skelLesson.listeningTask,
          speakingTask: aiLesson.speakingTask || aiLesson.speaking_task || skelLesson.speakingTask,
          readingTask: aiLesson.readingTask || aiLesson.reading_task || skelLesson.readingTask,
          writingTask: aiLesson.writingTask || aiLesson.writing_task || skelLesson.writingTask,
          reviewWords: aiLesson.reviewWords?.length > 0 ? aiLesson.reviewWords : skelLesson.reviewWords,
          // ENFORCE structural fields from skeleton:
          cycleType: skelLesson.cycleType,
          phonicsFocus: skelLesson.phonicsFocus,
          grammarFocus: skelLesson.grammarFocus,
          grammarPattern: skelLesson.grammarPattern,
          skillsFocus: skelLesson.skillsFocus,
          skillTags: skelLesson.skillTags,
          bridgeRetrieval: skelLesson.bridgeRetrieval,
          masteryCheck: skelLesson.masteryCheck,
          hintsDisabled: skelLesson.hintsDisabled,
          highSupport: skelLesson.highSupport,
          // Preserve the wizard manifest (already built from skeleton)
          aiWizardManifest: skelLesson.aiWizardManifest,
        };
      }),
    };
  });
}

// ─── Helper: Build dependency context string for AI ────────────────
export function buildDependencyContext(
  skeleton: SpiralUnit[],
  currentUnitNumber: number,
): string {
  const currentUnit = skeleton.find(u => u.unit === currentUnitNumber);
  if (!currentUnit) return '';

  const prevUnit = currentUnit.prerequisiteUnit
    ? skeleton.find(u => u.unit === currentUnit.prerequisiteUnit)
    : null;

  let context = `\n--- SPIRAL DEPENDENCY CONTEXT ---\n`;
  context += `Current Unit: ${currentUnit.unit} — "${currentUnit.theme}"\n`;
  context += `Anchor Phoneme: ${currentUnit.phonicsGoal} (${currentUnit.phonicsCategory})\n`;
  context += `Grammar Goal: ${currentUnit.grammarGoal}\n`;
  context += `Skills Mix: L=${currentUnit.skillsMix.listening}% S=${currentUnit.skillsMix.speaking}% R=${currentUnit.skillsMix.reading}% W=${currentUnit.skillsMix.writing}%\n`;
  context += `Vocabulary: ${currentUnit.vocabularyConstraints.newWords} new words with "${currentUnit.vocabularyConstraints.phonemeFilter}" sound`;

  if (prevUnit) {
    context += `\n\n--- PREREQUISITE UNIT ${prevUnit.unit}: "${prevUnit.theme}" ---\n`;
    context += `Previous Phoneme: ${prevUnit.phonicsGoal}\n`;
    context += `Previous Grammar: ${prevUnit.grammarGoal}\n`;
    context += `Review Words Required: ${currentUnit.vocabularyConstraints.reviewWordsFromPrevUnit} words from Unit ${prevUnit.unit}\n`;
    context += `Bridge Retrieval: MANDATORY 5-question pop quiz from Unit ${prevUnit.unit} content\n`;
  }

  context += `\n--- LESSON CYCLE (6 LESSONS PER UNIT) ---\n`;
  context += `  Lessons 1-4: Progressive Build-Up (Discovery → Ladder → Ladder → Bridge)\n`;
  context += `  Lesson 5: The Grand Review (High Support, Wizard Hints ON)\n`;
  context += `  Lesson 6: Mastery Quiz (No Hints, Clinical Assessment)\n\n`;
  currentUnit.lessons.forEach(l => {
    context += `  ${l.id} [${l.cycleType}] — ${l.focus} | Skills: ${l.skillTags.join(',')} | Activities: ${l.activities.join(', ')}\n`;
  });

  return context;
}

// ─── Helper: Build full curriculum map context ─────────────────────
export function buildFullCurriculumMapContext(skeleton: SpiralUnit[]): string {
  let context = `\n══════════════════════════════════════════\n`;
  context += `  SPIRAL CURRICULUM MAP — 6-Lesson Unit Architecture\n`;
  context += `══════════════════════════════════════════\n\n`;

  context += `UNIT STRUCTURE (6 LESSONS EACH):\n`;
  context += `  Lessons 1-4: Progressive Build-Up\n`;
  context += `    L1 [discovery]: Sound Recognition + Bridge Retrieval from prev unit\n`;
  context += `    L2 [ladder]: Grammar Practice + Sentence Building\n`;
  context += `    L3 [ladder]: Extended Practice + Writing Integration\n`;
  context += `    L4 [bridge]: Independent Production + Free Speaking\n`;
  context += `  Lesson 5 [review]: The Grand Review — ALL skills with HIGH teacher support\n`;
  context += `  Lesson 6 [quiz]: Mastery Quiz — NO hints, clinical assessment, >80% to pass\n\n`;

  context += `PROGRESSION RULES (MANDATORY):\n`;
  context += `  Phonics:  Individual Sounds → Blends → Digraphs\n`;
  context += `  Grammar:  Nouns → "It is a..." → "Is it a...?" → Plurals → Adjectives → Has/Have → Possessives → Prepositions → Present Simple\n`;
  context += `  Skills:   Writing % MUST increase from 5% (Unit 1) to 40% (Unit 10)\n`;
  context += `  Review:   Unit N Lesson 1 MUST include Bridge Retrieval from Unit N-1\n`;
  context += `  Mastery:  Lesson 6 score >80% required to unlock next unit\n\n`;

  skeleton.forEach(unit => {
    const prereq = unit.prerequisiteUnit ? `← requires Unit ${unit.prerequisiteUnit}` : '(start)';
    context += `Unit ${unit.unit}: "${unit.theme}" ${prereq}\n`;
    context += `  Phoneme: ${unit.phonicsGoal} | Grammar: ${unit.grammarGoal}\n`;
    context += `  Skills: L=${unit.skillsMix.listening}% S=${unit.skillsMix.speaking}% R=${unit.skillsMix.reading}% W=${unit.skillsMix.writing}%\n`;
    unit.lessons.forEach(l => {
      const flags = [];
      if (l.highSupport) flags.push('HIGH-SUPPORT');
      if (l.hintsDisabled) flags.push('NO-HINTS');
      const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
      context += `    ${l.id} [${l.cycleType}] ${l.focus} (${l.skillTags.join(',')})${flagStr}\n`;
    });
    context += `\n`;
  });

  return context;
}
