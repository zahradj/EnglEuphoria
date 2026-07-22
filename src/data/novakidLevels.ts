/**
 * Novakid-style Levels & Courses reference for Playground + Academy.
 *
 * CEFR strings here are APPROXIMATE — they describe the level's flavour for
 * the Methodology page and onboarding routing. Actual generation ceilings
 * still come from HUB_CEFR_MATRIX (Playground Pre-A1→B1, Academy Pre-A1→C1).
 *
 * Routing is age-driven, mirroring Novakid exactly:
 *   L0  4–6   Playground   pre-school
 *   L1  7–8   Playground   ~pre-A1, learning to read
 *   L2  9+    Playground   ~pre-A1+, reading
 *   L3  11+   Academy      ~A1 Movers
 *   L4  13+   Academy      ~A2 Flyers
 *   SP  9+    Academy      Speaking course (Time2Talk / Virtual Explorer B1+)
 *               — Academy-only add-on, surfaced after L2 completion.
 */

export type NovakidLevelId = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'SP';
export type NovakidHub = 'playground' | 'academy';

export interface NovakidLevel {
  id: NovakidLevelId;
  label: string;
  subtitle: string;
  ageMin: number;
  ageMax: number | null;
  hub: NovakidHub;
  cefrApprox: string;
  reading: 'none' | 'learning' | 'reading' | 'confident';
  readingLabel: string;
  grammar: string[];
  vocabulary: string[];
  speaking: string;
  methodology: 'TPR' | 'CLT' | 'TBLT';
  badges: string[];
  prerequisites?: NovakidLevelId[];
}

export const NOVAKID_LEVELS: Record<NovakidLevelId, NovakidLevel> = {
  L0: {
    id: 'L0',
    label: 'Level 0',
    subtitle: 'pre-school',
    ageMin: 4,
    ageMax: 6,
    hub: 'playground',
    cefrApprox: 'Pre-A1',
    reading: 'none',
    readingLabel: 'No reading',
    grammar: [],
    vocabulary: ['Basic phrases', 'Sounds'],
    speaking: 'Say single words and short phrases',
    methodology: 'TPR',
    badges: ['No prior knowledge needed'],
  },
  L1: {
    id: 'L1',
    label: 'Level 1',
    subtitle: '~pre-A1, let’s start',
    ageMin: 7,
    ageMax: 8,
    hub: 'playground',
    cefrApprox: 'Pre-A1',
    reading: 'learning',
    readingLabel: 'Learning to read',
    grammar: ['Basic vocabulary and grammar', 'Sounds and blending'],
    vocabulary: ['Basic vocabulary and grammar'],
    speaking: 'Say single words and short phrases',
    methodology: 'TPR',
    badges: ['No prior knowledge needed'],
  },
  L2: {
    id: 'L2',
    label: 'Level 2',
    subtitle: '~pre-A1, let’s continue',
    ageMin: 9,
    ageMax: null,
    hub: 'playground',
    cefrApprox: 'Pre-A1+',
    reading: 'reading',
    readingLabel: 'Blend digraphs',
    grammar: [
      'Personal pronouns, to be',
      'Can/can’t, have/has got',
      'There is/are',
      'This/that/these/those',
      'Present Simple/Continuous',
      '(Un)countable nouns',
      'Comparative adjectives',
      'Was/were',
    ],
    vocabulary: ['Food', 'Activities', 'Family', 'Feelings', 'Places', 'Animals'],
    speaking: 'Say short complete sentences',
    methodology: 'CLT',
    badges: ['+CLIL lessons included'],
    prerequisites: ['L1'],
  },
  L3: {
    id: 'L3',
    label: 'Level 3',
    subtitle: '~A1, Movers',
    ageMin: 11,
    ageMax: null,
    hub: 'academy',
    cefrApprox: 'A1',
    reading: 'confident',
    readingLabel: 'Improve reading skills',
    grammar: [
      'Present Simple/Continuous',
      'Past Simple',
      'Future',
      'Present Perfect',
      'Question words',
      'Be going to',
      'Relative clauses',
      'Some modals',
      'Quantifiers',
      'Gerunds/infinitives',
    ],
    vocabulary: ['Clothes', 'Planets', 'Animals', 'Jobs', 'Places', 'Health', 'Food', 'Hobbies'],
    speaking: 'Say complete full sentences',
    methodology: 'CLT',
    badges: ['+CLIL lessons included'],
    prerequisites: ['L2'],
  },
  L4: {
    id: 'L4',
    label: 'Level 4',
    subtitle: '~A2, Flyers',
    ageMin: 13,
    ageMax: null,
    hub: 'academy',
    cefrApprox: 'A2',
    reading: 'confident',
    readingLabel: 'Confident readers',
    grammar: [
      'Present/Past Simple and Continuous',
      'Future',
      'Present Perfect',
      'Modals',
      'Conditionals',
    ],
    vocabulary: ['Jobs', 'Places', 'Health', 'People', 'Travel', 'Films', 'Nature'],
    speaking: 'Narrate in complete full sentences with linking words; express opinions and predictions',
    methodology: 'CLT',
    badges: ['+CLIL lessons included'],
    prerequisites: ['L3'],
  },
  SP: {
    id: 'SP',
    label: 'Speaking Courses',
    subtitle: 'Time2Talk · Virtual Explorer',
    ageMin: 9,
    ageMax: null,
    hub: 'academy',
    cefrApprox: 'B1+',
    reading: 'confident',
    readingLabel: 'Focus on speaking',
    grammar: ['A wide variety of grammar constructions'],
    vocabulary: ['Topic-driven, conversational'],
    speaking:
      'Time2Talk: focus on speaking, recommended after half of Level 3 or 4. Virtual Explorer: B1+, better suited for older kids fluent in English.',
    methodology: 'CLT',
    badges: ['Add-on alongside the general course'],
    prerequisites: ['L2'],
  },
};

export const NOVAKID_LEVELS_ORDERED: NovakidLevel[] = [
  NOVAKID_LEVELS.L0,
  NOVAKID_LEVELS.L1,
  NOVAKID_LEVELS.L2,
  NOVAKID_LEVELS.L3,
  NOVAKID_LEVELS.L4,
];

export const NOVAKID_SPEAKING_COURSE = NOVAKID_LEVELS.SP;

/**
 * Resolve the canonical starting level from a student's age.
 * Mirrors Novakid age bands exactly.
 *
 * Age 9–10 qualifies for both L2 (Playground) and Speaking (Academy).
 * Default is L2 Playground — Speaking is surfaced as an Academy add-on once
 * the student has completed L2.
 */
export function resolveLevelByAge(age: number | null | undefined): NovakidLevel {
  if (age == null || Number.isNaN(age)) return NOVAKID_LEVELS.L1;
  if (age <= 6) return NOVAKID_LEVELS.L0;
  if (age <= 8) return NOVAKID_LEVELS.L1;
  if (age <= 10) return NOVAKID_LEVELS.L2;
  if (age <= 12) return NOVAKID_LEVELS.L3;
  return NOVAKID_LEVELS.L4;
}

export function hubForLevel(id: NovakidLevelId): NovakidHub {
  return NOVAKID_LEVELS[id].hub;
}
