// Academy LESSON blueprint — owned by the Academy hub only.
// One blueprint per Live Session (560 in total), derived deterministically from the Academy roadmap (Season outlines).
// Independent of the Playground and Success blueprints and of the shared multi-hub `LessonBlueprint` in
// src/services/contentCreator/lessonBlueprint.ts: this file imports nothing outside src/curriculum/academy/ (isolation test enforces it).
//
// A blueprint is the *plan* for a session: objective, language load, run of show with the cognitive job of each segment, supports,
// comfort, recap source. It does not choose the concrete game (academy-activity-selector does) and contains no lesson content.
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

/** Fixed run of show. Core segments are never skipped; flex segments are the teacher's call. */
export const RUN_OF_SHOW = [
  { name: 'Check-in', minutes: 5, core: false, technique: 'low-anxiety spontaneous speech; reads the energy dial' },
  { name: 'Remember?', minutes: 7, core: true, technique: 'retrieval practice + spaced review, production first, feedback' },
  { name: 'The Drop', minutes: 10, core: true, technique: 'comprehensible input; interest and surprise; student picks a skin' },
  { name: 'Notice & Build', minutes: 10, core: true, technique: 'noticing then a short explicit rule check; deliberate vocabulary' },
  { name: 'Energiser', minutes: 4, core: false, technique: 'attention reset; zero stakes' },
  { name: 'Mission', minutes: 12, core: true, technique: 'pushed output + interaction; planning time; Take 1, feedback, Take 2' },
  { name: 'Release', minutes: 7, core: true, technique: 'generation and ownership; private first, then share' },
  { name: 'Wrap', minutes: 5, core: true, technique: 'metacognition: can-do ticks, Best Line, homework, next clue' },
] as const;

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
  /** structures introduced in this session (E3: the first; E6: the second, if any) */
  structures: StructureRef[];
  /** source of the Last-Time card; null only for the very first session of the roadmap */
  recapFromLessonId: string | null;
  /** earlier Seasons whose language returns in Remember? */
  recycleFrom: string[];
  runOfShow: { name: string; minutes: number; core: boolean; technique: string; job: string }[];
  mission: { job: string; dial: ['chill', 'normal', 'push']; planningSeconds: number; take2: boolean };
  release: { job: string; privateFirst: true; seasonRelease?: string };
  clue: { no: number; of: 8; unlockedBy: string };
  supports: (typeof LEVEL_SUPPORTS)[AcademyLevel];
  comfort: readonly string[];
  /** minimum fun ingredients to include when the session content is written */
  funIngredientsMin: 5;
  mediation?: string;
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

/** Build the blueprint of one session. `previousId` is the blueprint before it in roadmap order (null for the very first). */
export function buildLessonBlueprint(s: SeasonOutline, episodeIndex: number, previousId: string | null): AcademyLessonBlueprint {
  const type = EPISODE_ORDER[episodeIndex];
  const meta = EPISODES[type];
  const counts = allocateItems(
    s.newItemBudget,
    EPISODE_ORDER.map((t) => EPISODES[t].weight),
  );
  const mission = meta.jobs.mission;
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
    comfort: COMFORT_CONTROLS,
    funIngredientsMin: 5,
    mediation: type === 'finale' || type === 'deep-dive' ? s.mediation : undefined,
    assessment: {
      rememberFrom: previousId ? [previousId, ...s.recycleFrom] : [],
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
