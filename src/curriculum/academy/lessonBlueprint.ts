// Academy LESSON blueprint — owned by the Academy hub only.
// One blueprint per Live Session (560 in total), derived deterministically from the Academy roadmap (Season outlines).
// Independent of the Playground and Success blueprints and of the shared multi-hub `LessonBlueprint` in
// src/services/contentCreator/lessonBlueprint.ts: this file imports nothing outside src/curriculum/academy/ (isolation test enforces it).
//
// A blueprint is the *plan* for a session: objective, language load, run of show with the cognitive job of each segment, supports,
// comfort, recap source. It does not choose the concrete game (academy-activity-selector does) and contains no lesson content.
import { l1WatchFor, type L1WatchItem } from './l1Watch';
import { gamePlanFor, type SeasonGamePlan } from './gamePlan';
import { VOCAB_GAME_MENU, suggestVocabGames, type VocabGamePicks } from './vocabGames';
import { ACADEMY_CAST_NAMES, CAST_ROLES, GENERIC_HELPER_PART, type AcademyCastName } from './cast';
import {
  EPISODE_ORDER,
  MAX_ITEMS_PER_SESSION,
  type AcademyLevel,
  type EpisodeType,
  type LevelPlan,
  type SeasonOutline,
  type SkillKey,
  type StructureRef,
} from './types';

export type ItemKind = 'none' | 'receptive' | 'core-productive' | 'chunks';

export interface EpisodeMeta {
  no: number;
  name: string;
  primarySkill: SkillKey;
  secondarySkills: SkillKey[];
  /** what kind of new language this session may introduce */
  itemKind: ItemKind;
  /** relative share of the Season's new-item budget (E7 and E8 are 0) */
  weight: number;
  /** cognitive job of each segment (input to the activity selector) */
  jobs: { drop: string; noticeBuild: string; mission: string; release: string };
  /** how the clue of this episode is unlocked (the student must use the language) */
  clueUnlockedBy: string;
}

export const EPISODES: Record<EpisodeType, EpisodeMeta> = {
  'cold-open': {
    no: 1,
    name: 'Cold Open',
    primarySkill: 'listening',
    secondarySkills: ['reading', 'vocabulary'],
    itemKind: 'receptive',
    weight: 0.14,
    jobs: {
      drop: 'hook + short context text or dialogue (gist only, tappable words)',
      noticeBuild: 'meet the story words in context; predict, then check (receptive)',
      mission: 'predict and share an opinion in 1-2 sentences',
      release: 'one-sentence reaction to the story',
    },
    clueUnlockedBy: 'answering the gist question in your own words',
  },
  'word-lab': {
    no: 2,
    name: 'Word Lab',
    primarySkill: 'vocabulary',
    secondarySkills: ['pronunciation', 'speaking'],
    itemKind: 'core-productive',
    weight: 0.2,
    jobs: {
      drop: 'picture-word reveal of the Season words',
      noticeBuild: 'deliberate vocabulary: meaning, sound and stress, recycle, combine; minimal-pair listening',
      mission: 'use the words in an info-gap or describe-and-guess task',
      release: 'voice note: my words',
    },
    clueUnlockedBy: 'using three new words in sentences of your own',
  },
  'pattern-lab': {
    no: 3,
    name: 'Pattern Lab',
    primarySkill: 'grammar',
    secondarySkills: ['writing', 'speaking'],
    itemKind: 'chunks',
    weight: 0.1,
    jobs: {
      drop: 'three or four example sentences taken from the Cold Open',
      noticeBuild: 'find the pattern, confirm in 3 lines at most, then controlled practice',
      mission: 'guided question-and-answer or sentence-building duel using the pattern',
      release: 'write 3-5 sentences of my own with the pattern',
    },
    clueUnlockedBy: 'building a correct sentence with the pattern',
  },
  'on-air': {
    no: 4,
    name: 'On Air',
    primarySkill: 'speaking',
    secondarySkills: ['listening', 'vocabulary'],
    itemKind: 'chunks',
    weight: 0.18,
    jobs: {
      drop: 'model dialogue, heard twice',
      noticeBuild: 'phrase ladder: functional chunks, polite forms, stress and intonation',
      mission: 'role-play a real-life exchange with the teacher in a cast situation',
      release: 'record the dialogue',
    },
    clueUnlockedBy: 'completing the dialogue with the right phrases',
  },
  'deep-dive': {
    no: 5,
    name: 'Deep Dive',
    primarySkill: 'reading',
    secondarySkills: ['writing', 'vocabulary'],
    itemKind: 'receptive',
    weight: 0.16,
    jobs: {
      drop: 'longer graded text or clip at 95-98 % known words',
      noticeBuild: 'detail reading or listening; collocations; cloze',
      mission: 'summarise or discuss the text (debate from B1)',
      release: 'a short written piece with a rewrite to fix it',
    },
    clueUnlockedBy: 'finding the key detail in the text and saying it',
  },
  'side-quest': {
    no: 6,
    name: 'Side Quest',
    primarySkill: 'speaking',
    secondarySkills: ['writing', 'vocabulary', 'grammar'],
    itemKind: 'core-productive',
    weight: 0.22,
    jobs: {
      drop: 'student-chosen topic text (skin)',
      noticeBuild: 'free choice of two mechanics; second structure if the Season has one',
      mission: 'creative or fluency task the student chooses',
      release: 'a mini creation',
    },
    clueUnlockedBy: 'finishing the task you chose',
  },
  remix: {
    no: 7,
    name: 'Remix',
    primarySkill: 'vocabulary',
    secondarySkills: ['grammar', 'listening', 'reading', 'speaking', 'writing'],
    itemKind: 'none',
    weight: 0,
    jobs: {
      drop: 'boss briefing',
      noticeBuild: 'mixed retrieval grid across this Season and earlier ones',
      mission: 'boss round (Push is optional)',
      release: 'recap clip',
    },
    clueUnlockedBy: 'beating the Remix boss',
  },
  finale: {
    no: 8,
    name: 'Finale',
    primarySkill: 'speaking',
    secondarySkills: ['writing', 'listening', 'reading'],
    itemKind: 'none',
    weight: 0,
    jobs: {
      drop: 'finale briefing',
      noticeBuild: 'checkpoint warm-up',
      mission: 'peer-style task: Take 1, feedback, Take 2',
      release: 'the Season Release',
    },
    clueUnlockedBy: 'finishing your Release',
  },
};

/**
 * Vocabulary rule (owner, 2026-10-12): after EVERY vocabulary introduction the student plays TWO different memorising games
 * (e.g. drag-match + flip-memory with pictures, or a number game + flip-memory) before anything new is taught.
 * Enforced in the lesson player by src/academy-deck/__tests__/deck.test.tsx ("RULE: after every vocabulary introduction…").
 */
export const VOCAB_GAMES_RULE = { gamesPerWordSet: 2, differentKinds: true, before: 'anything new is taught' } as const;

/**
 * Fixed run of show. Core segments are never skipped; flex segments are the teacher's call.
 * `mustHave` = what a lesson plan must contain in that part for the lesson to be effective (research-based, 2026-10-10:
 * docs/academy-effective-lesson-plan.md; evidence logs docs/research/academy-fast-progress-evidence-A.md and -B.md).
 * Each line is checked by lessonBlueprint.test.ts and by the academy-quality-gate skill.
 */
export const RUN_OF_SHOW = [
  {
    name: 'Check-in', minutes: 5, core: false,
    technique: 'low-anxiety spontaneous speech; energy choice; the day\'s mission and criteria',
    mustHave: ['the student picks how they feel with pictures (never emoji), no typing needed', '2-3 quick questions the student can answer by choosing a picture or saying one short sentence', 'today\'s mission and its 3-5 success criteria are shown'],
  },
  {
    name: 'Remember?', minutes: 7, core: true,
    technique: 'retrieval practice + spaced review, errors first, production first, feedback on every item',
    mustHave: ['starts with the student\'s OWN error list from the last lesson (Mistake Bank), then the due items', '8-12 items, at least 60 % production, feedback after every item', 'the language of the last lesson is shown again before it is asked', 'each item\'s result is logged with the date (delayed checks at about 7 and 21 days)'],
  },
  {
    name: 'The Drop', minutes: 10, core: true,
    technique: 'comprehensible input with MODELLING: meaning first, then the language in use',
    mustHave: ['every new word is met first on its own page: a moving picture, its meaning, an example and a clue, BEFORE any game uses it', 'the cast MODEL the target language in use, line by line, with the pattern card (the frame stays, the part that changes is coloured), BEFORE the student produces it', 'nothing is asked that was not first shown or taught', 'after EVERY word set that is introduced come TWO different memorising games (VOCAB_GAMES_RULE) before anything new is taught', 'a quick understanding check, and a student choice (skin)'],
  },
  {
    name: 'Notice & Build', minutes: 10, core: true,
    technique: 'controlled practice with immediate feedback; noticing then a short explicit rule',
    mustHave: ['each game trains one named success criterion; no screen without a criterion', 'after every vocabulary introduction, two different memorising games (e.g. drag-match + flip-memory) help the student remember the words', 'the rule, if any, is 3 lines or fewer and comes after examples', 'beginners (A1-A2) can choose answers by picture, not only by reading; the meaning cue fades in later retrieval', 'no two neighbouring games of the same kind'],
  },
  {
    name: 'Energiser', minutes: 4, core: false,
    technique: 'attention reset; zero stakes',
    mustHave: ['a quick game with no ranking and no timer', 'it still uses the target language'],
  },
  {
    name: 'Mission', minutes: 12, core: true,
    technique: 'pushed output + interaction: dial, Take 1, specific feedback, Take 2 in the same lesson',
    mustHave: ['the student chooses the help: Chill, Normal or Push', 'Take 1, then specific feedback (prompt, clue, direct fix; a direct recast at A1) also shown on screen, then Take 2 in the same lesson', 'the teacher logs up to 3 recurring errors', 'private rehearsal and type-instead-of-speak stay available'],
  },
  {
    name: 'Release', minutes: 7, core: true,
    technique: 'generation and ownership; model hidden; private first; the delayed-evidence sample',
    mustHave: ['the exit task is done with the model hidden (shown only on "Show me", which is counted)', 'private first, then saved to the portfolio as the evidence sample of this lesson', 'uses language from all earlier lessons of the unit, not only this one'],
  },
  {
    name: 'Wrap', minutes: 5, core: true,
    technique: 'metacognition and hand-off: can-do ticks, error log, Daily 10, next clue',
    mustHave: ['can-do ticks tied to the success criteria (yes, almost, not yet)', 'the teacher\'s error log (up to 3 recurring errors) becomes the start of the next lesson\'s Remember?', 'the Daily 10 is assigned for calendar days, and the next clue is shown'],
  },
] as const;

/**
 * Pre-A1 run of show (owner 2026-10-12, docs/academy-pre-a1-curriculum.md §3): slower, with a Read part (blending and a decodable text).
 * Eight parts as well, so slides keep part indexes 0-7; the deck player mirrors it (PRE_A1_PARTS) and a test keeps them equal.
 */
export const PRE_A1_RUN_OF_SHOW = [
  { name: 'Check-in', minutes: 5, core: false, technique: 'low-anxiety start; goal shown; no new language', mustHave: ['a greeting and the day\'s goal with pictures', 'no new language'] },
  { name: 'Remember?', minutes: 10, core: true, technique: 'retrieval of the last two lessons, production-light', mustHave: ['letters, sounds and words from the last two lessons come back as hear-and-pick or flip memory', 'every item gets feedback'] },
  { name: 'The Drop', minutes: 8, core: true, technique: 'picture scene with meaning first', mustHave: ['a short picture scene or story that shows the new words in use', 'nothing is asked that was not first shown'] },
  { name: 'Learn', minutes: 10, core: true, technique: 'a few new items, then two different memorising games', mustHave: ['at most 4 new items taught on their own pages', 'two different memorising games follow (VOCAB_GAMES_RULE)'] },
  { name: 'Read', minutes: 8, core: true, technique: 'blending and a short decodable text with tap-to-hear', mustHave: ['a blending routine (letters slide together into a word)', 'a reading page whose words are blendable from the sounds taught or are taught whole words', 'every word can be tapped to hear it'] },
  { name: 'Learn more', minutes: 8, core: true, technique: 'a second small set, then two different games', mustHave: ['at most 4 new items', 'two different memorising games follow'] },
  { name: 'Mission', minutes: 6, core: true, technique: 'use the language with a cast member: tiles or speech, Take 1, feedback, Take 2', mustHave: ['the student chooses the help', 'Take 1, feedback, short Take 2', 'type-instead-of-speak stays available'] },
  { name: 'Wrap', minutes: 5, core: true, technique: 'can-do ticks, Daily 10, next clue', mustHave: ['can-do ticks tied to the success criteria', 'the Daily 10 is assigned and the next clue is shown'] },
] as const;

/** Recommended rhythm (research-based proposal 2026-10-10; frequency and structure are the strongest levers we control).
 * A guideline for planning and sales copy, never a promise of a level by a date.
 */
export const RECOMMENDED_RHYTHM = {
  lessonsPerWeek: 2,
  minimumLessonsPerWeek: 1,
  fastTrackLessonsPerWeek: 3,
  daily10DaysPerWeek: 5,
  /** Cambridge's guide: about 200 guided hours per CEFR level, cumulative from zero (A2 about 180-200 h, B1 about 350-400 h); independent study not counted */
  guidedHoursPerLevelGuide: 200,
} as const;

/** Supports fade by level and the student sees them fade (Training-Wheels meter). */
export const LEVEL_SUPPORTS: Record<AcademyLevel, { frames: string; l1Hint: string; audioSpeed: string; teacherTalkMax: number; speakingCeiling: string }> = {
  A1: { frames: 'full sentence frames', l1Hint: 'on', audioSpeed: '0.8x available', teacherTalkMax: 0.4, speakingCeiling: 'repeat, substitute, answer, ask' },
  A2: { frames: 'half frames', l1Hint: 'on, tiered', audioSpeed: '0.9x on request', teacherTalkMax: 0.35, speakingCeiling: 'exchange, extend' },
  B1: { frames: 'first words only', l1Hint: 'on request', audioSpeed: 'natural', teacherTalkMax: 0.3, speakingCeiling: 'spontaneous 2 minutes' },
  B2: { frames: 'none (optional)', l1Hint: 'dictionary only', audioSpeed: 'natural', teacherTalkMax: 0.25, speakingCeiling: 'spontaneous 3-5 minutes, defend an opinion' },
  C1: { frames: 'none', l1Hint: 'off', audioSpeed: 'natural, varied accents (approved voices only)', teacherTalkMax: 0.25, speakingCeiling: 'seminar, pitch, mediation' },
};

/** Always-on comfort controls: every lesson blueprint carries the full list. */
export const COMFORT_CONTROLS = [
  'tiered hint',
  'slow down / repeat',
  "I need a minute",
  'private rehearsal',
  'type instead of speak',
  'emoji reactions',
  'camera and self-view options',
  'easier / same / harder dial',
  'choose the next activity from two',
] as const;

export interface AcademyLessonBlueprint {
  /** 'A1-S01-E3' */
  id: string;
  seasonId: string;
  level: AcademyLevel;
  seasonNo: number;
  episode: { no: number; type: EpisodeType; name: string };
  title: string;
  /** "I can ..." */
  objective: string;
  primarySkill: SkillKey;
  secondarySkills: SkillKey[];
  /** new language this session introduces (words + chunks); <= MAX_ITEMS_PER_SESSION; 0 in E7 and E8 */
  newItems: { count: number; kind: ItemKind };
  /**
   * Cast (owner rule, 2026-10-08): lessons use ONLY the Academy characters from the cast vault. Vee is the mentor voice;
   * the lead is the character the Season hook features; one helper student is chosen by the lesson's job and the vault traits.
   */
  cast: { lead: AcademyCastName; appears: { name: AcademyCastName; part: string }[] };
  /** what every new item of THIS lesson must relate to (unit theme + this lesson's job). Reviewers check the item list against it. */
  itemFocus: string;
  /**
   * Progressive stack inside the unit (owner rule, 2026-10-08): lesson 2 = lesson 1 + new; lesson 3 = lessons 1 and 2 + new; and so on.
   * Every lesson revisits ALL earlier lessons of its unit, and its Mission and Release must reuse that language.
   */
  buildsOn: {
    /** every earlier lesson of this unit (Season), in order */
    lessonIds: string[];
    /** new items taught by those earlier lessons */
    itemsBefore: number;
    /** itemsBefore + this lesson's new items */
    itemsAfter: number;
    structuresBefore: string[];
    structuresAfter: string[];
    /** e.g. 'L3 = L1 + L2 + new' */
    stack: string;
    /** what the Mission and Release must reuse */
    mustReuse: string;
    /** input texts for this lesson: share of running words the student already knows (earlier lessons, recycled Seasons) or sees glossed */
    inputKnownWordsMinPct: number;
  };
  /** structures introduced in this session (E3: the first; E6: the second, if any) */
  structures: StructureRef[];
  /** source of the Last-Time card; null only for the very first session of the roadmap */
  recapFromLessonId: string | null;
  /** earlier Seasons whose language returns in Remember? */
  recycleFrom: string[];
  runOfShow: { name: string; minutes: number; core: boolean; technique: string; job: string; /** what the plan must contain in this part (see RUN_OF_SHOW) */ mustHave: readonly string[] }[];
  mission: { job: string; dial: ['chill', 'normal', 'push']; planningSeconds: number; take2: boolean };
  release: { job: string; privateFirst: true; seasonRelease?: string };
  clue: { no: number; of: 8; unlockedBy: string };
  supports: (typeof LEVEL_SUPPORTS)[AcademyLevel];
  /** every vocabulary introduction is followed by two different memorising games */
  vocabGames: typeof VOCAB_GAMES_RULE & {
    /** the games the lesson plan may choose from (ids in VOCAB_GAME_MENU) */
    menu: readonly string[];
    /** suggested picks for word sets 1-3 of this lesson; the plan may swap any for another menu game (validateVocabGamePicks) */
    suggested: VocabGamePicks[];
  };
  /** home-language trouble spots to listen for in this Season (ar, es, fr, tr, it); tendencies, not facts about every student */
  l1Watch: readonly L1WatchItem[];
  /** the Season's games shortlist from the 171-game catalogue + its video-game mechanic (the per-lesson internet search is still to be done) */
  gamePlan?: SeasonGamePlan;
  comfort: readonly string[];
  /** minimum fun ingredients to include when the session content is written */
  funIngredientsMin: 5;
  mediation?: string;
  /** this episode's chapter of the Season theme (academy-season-arc), when the Season has chapters */
  chapter?: { no: number; title: string; question: string; step: string; essentialQuestion?: string };
  assessment: { rememberFrom: string[]; exitCanDo: string[]; checkpoint: boolean; levelCheck: boolean; bigRemix: boolean };
  dailyTen: { focus: string };
  status: 'outline';
}

/** Spread a Season's item budget over the introducing sessions, honouring weights and the per-session cap. */
export function allocateItems(budget: number, weights: number[], cap = MAX_ITEMS_PER_SESSION): number[] {
  const n = weights.length;
  const alloc = new Array<number>(n).fill(0);
  let free = weights.map((w, i) => (w > 0 ? i : -1)).filter((i) => i >= 0);
  let left = budget;
  while (free.length) {
    const total = free.reduce((s, i) => s + weights[i], 0);
    const over = free.filter((i) => (left * weights[i]) / total > cap);
    if (over.length === 0) {
      free.forEach((i) => (alloc[i] = (left * weights[i]) / total));
      break;
    }
    over.forEach((i) => {
      alloc[i] = cap;
      left -= cap;
    });
    free = free.filter((i) => !over.includes(i));
  }
  // integer rounding that keeps the sum equal to the budget and every session <= cap
  const floor = alloc.map((x) => Math.floor(x));
  let rest = budget - floor.reduce((s, x) => s + x, 0);
  const order = alloc.map((x, i) => ({ i, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (rest <= 0) break;
    if (weights[i] > 0 && floor[i] < cap) {
      floor[i] += 1;
      rest -= 1;
    }
  }
  return floor;
}

function objectiveFor(s: SeasonOutline, type: EpisodeType): string {
  const uses = (r: StructureRef) => `${r.label}${r.use ? ` (${r.use})` : ''}`;
  switch (type) {
    case 'cold-open':
      return `I can understand the main idea of a short text about ${s.theme.toLowerCase()}.`;
    case 'word-lab':
      return `I can understand and use new words for ${s.lexicalFields.slice(0, 2).join(' and ')}.`;
    case 'pattern-lab':
      return `I can use ${uses(s.structures[0])}.`;
    case 'on-air':
      return s.canDo[0];
    case 'deep-dive':
      return s.canDo[1] ?? s.canDo[0];
    case 'side-quest':
      return s.structures[1] ? `I can use ${uses(s.structures[1])} in a task I choose.` : `I can use the language of this Season in a task I choose.`;
    case 'remix':
      return `I can remember and use the language from ${s.title} and from the Seasons before it.`;
    case 'finale':
      return `I can complete the Season Release: ${s.release.charAt(0).toLowerCase()}${s.release.slice(1)}.`;
  }
}



function stackLabel(no: number): string {
  if (no === 1) return 'L1 = new';
  if (no === 2) return 'L2 = L1 + new';
  if (no === 3) return 'L3 = L1 + L2 + new';
  if (no <= 6) return `L${no} = L1 + ... + L${no - 1} + new`;
  return `L${no} = L1 + ... + L${no - 1} (no new language)`;
}

/** What the new items of one lesson must be related to: the unit (Season) AND this lesson's job. */
export function itemFocusFor(s: SeasonOutline, type: EpisodeType): string {
  const theme = s.theme.toLowerCase();
  switch (type) {
    case 'cold-open':
      return `receptive words and collocations that the Cold Open story/dialogue about "${theme}" would contain`;
    case 'word-lab':
      return `core productive words of the lexical fields: ${s.lexicalFields.join('; ')}`;
    case 'pattern-lab':
      return `chunks that visibly use the structure "${s.structures[0].label}" in the context of "${theme}"`;
    case 'on-air':
      return `functional chunks for the real-life exchange: ${s.functions.join('; ')}`;
    case 'deep-dive':
      return `receptive words and collocations that a longer text about "${theme}" would contain`;
    case 'side-quest':
      return `core productive words for the student's chosen skin (${s.skins.map((k) => k.id).join(', ')}) within "${theme}"${s.structures[1] ? `; chunks may use "${s.structures[1].label}"` : ''}`;
    case 'remix':
    case 'finale':
      return 'none: no new language in this session';
  }
}

/** Build the blueprint of one session. `previousId` is the blueprint before it in roadmap order (null for the very first). */
export function castFor(s: SeasonOutline, type: EpisodeType): AcademyLessonBlueprint['cast'] {
  const roles = CAST_ROLES[type];
  const named = s.cast.filter((n): n is AcademyCastName => (ACADEMY_CAST_NAMES as readonly string[]).includes(n));
  const lead: AcademyCastName = (named.find((n) => n !== 'Vee') ?? named[0] ?? 'Vee') as AcademyCastName;
  const students: AcademyCastName[] = ['Ava', 'Theo', 'Mia'];
  const helper = roles.helper !== lead ? roles.helper : students.find((n) => n !== lead && n !== roles.helper) ?? 'Mia';
  const appears: { name: AcademyCastName; part: string }[] = [{ name: 'Vee', part: roles.vee }];
  if (lead !== 'Vee') appears.push({ name: lead, part: roles.lead });
  if (helper !== lead) appears.push({ name: helper, part: helper === roles.helper ? roles.helperRole : GENERIC_HELPER_PART[helper as 'Ava' | 'Theo' | 'Mia'] });
  return { lead, appears };
}

export function buildLessonBlueprint(s: SeasonOutline, episodeIndex: number, previousId: string | null): AcademyLessonBlueprint {
  const type = EPISODE_ORDER[episodeIndex];
  const meta = EPISODES[type];
  const counts = allocateItems(
    s.newItemBudget,
    EPISODE_ORDER.map((t) => EPISODES[t].weight),
  );
  const mission = meta.jobs.mission;
  const no = meta.no;
  const earlierIds = EPISODE_ORDER.slice(0, episodeIndex).map((_, k) => `${s.id}-E${k + 1}`);
  const itemsBefore = counts.slice(0, episodeIndex).reduce((n, x) => n + x, 0);
  const structuresAtOrBefore = (upTo: number) => s.structures.filter((x) => (x.introducedIn === 'pattern-lab' ? 3 : 6) <= upTo).map((x) => x.id);
  return {
    id: `${s.id}-E${meta.no}`,
    seasonId: s.id,
    level: s.level,
    seasonNo: s.no,
    episode: { no: meta.no, type, name: meta.name },
    title: `${s.title} · ${meta.name}`,
    objective: objectiveFor(s, type),
    primarySkill: meta.primarySkill,
    secondarySkills: meta.secondarySkills,
    newItems: { count: counts[episodeIndex], kind: meta.itemKind },
    cast: castFor(s, type),
    itemFocus: itemFocusFor(s, type),
    buildsOn: {
      lessonIds: earlierIds,
      itemsBefore,
      itemsAfter: itemsBefore + counts[episodeIndex],
      structuresBefore: structuresAtOrBefore(no - 1),
      structuresAfter: structuresAtOrBefore(no),
      stack: stackLabel(no),
      mustReuse:
        no === 1
          ? 'nothing earlier in this unit; about 30 % of the story words recycle from the previous two Seasons'
          : counts[episodeIndex] > 0
            ? `the Mission and the Release must use language from lessons 1-${no - 1} of this unit as well as this lesson's new items`
            : `the Mission and the Release must use language from lessons 1-${no - 1} of this unit (no new language: retrieval and integration only)`,
      inputKnownWordsMinPct: 95,
    },
    structures: type === 'pattern-lab' ? s.structures.filter((x) => x.introducedIn === 'pattern-lab') : type === 'side-quest' ? s.structures.filter((x) => x.introducedIn === 'side-quest') : [],
    recapFromLessonId: previousId,
    recycleFrom: s.recycleFrom,
    runOfShow: RUN_OF_SHOW.map((seg) => ({
      ...seg,
      job:
        seg.name === 'The Drop'
          ? meta.jobs.drop
          : seg.name === 'Notice & Build'
            ? meta.jobs.noticeBuild
            : seg.name === 'Mission'
              ? mission
              : seg.name === 'Release'
                ? meta.jobs.release
                : seg.technique,
    })),
    mission: { job: mission, dial: ['chill', 'normal', 'push'], planningSeconds: s.level === 'A1' ? 0 : 60, take2: true },
    release: { job: meta.jobs.release, privateFirst: true, seasonRelease: type === 'finale' ? s.release : undefined },
    clue: { no: meta.no, of: 8, unlockedBy: meta.clueUnlockedBy },
    supports: LEVEL_SUPPORTS[s.level],
    vocabGames: { ...VOCAB_GAMES_RULE, menu: VOCAB_GAME_MENU.map((g) => g.id), suggested: [0, 1, 2].map((i) => suggestVocabGames(s.level, meta.no, i)) },
    l1Watch: l1WatchFor(s.id),
    gamePlan: gamePlanFor(s.id),
    comfort: COMFORT_CONTROLS,
    funIngredientsMin: 5,
    mediation: type === 'finale' || type === 'deep-dive' ? s.mediation : undefined,
    chapter: s.chapters?.[episodeIndex] ? { no: meta.no, ...s.chapters[episodeIndex], essentialQuestion: s.essentialQuestion } : undefined,
    assessment: {
      rememberFrom: Array.from(new Set([...(previousId ? [previousId] : []), ...[...earlierIds].reverse(), ...s.recycleFrom])),
      exitCanDo: type === 'finale' ? s.canDo : [objectiveFor(s, type)],
      checkpoint: type === 'finale',
      levelCheck: type === 'finale' && s.levelCheck,
      bigRemix: type === 'remix' && s.bigRemix,
    },
    dailyTen: { focus: type === 'remix' || type === 'finale' ? 'mixed review of this Season and earlier ones' : `items and structures from ${meta.name}` },
    status: 'outline',
  };
}

/** All blueprints in roadmap order (560 for the approved roadmap). */
export function buildAllLessonBlueprints(plans: LevelPlan[]): AcademyLessonBlueprint[] {
  const out: AcademyLessonBlueprint[] = [];
  let prev: string | null = null;
  for (const plan of plans) {
    for (const season of plan.seasons) {
      EPISODE_ORDER.forEach((_, i) => {
        const bp = buildLessonBlueprint(season, i, prev);
        out.push(bp);
        prev = bp.id;
      });
    }
  }
  return out;
}
