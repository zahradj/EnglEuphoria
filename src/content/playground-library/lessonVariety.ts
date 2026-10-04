/**
 * Lesson Variety Engine (owner's standing rule, 2026-10-04: "In every next
 * lesson vary the activities, the look, the scenes and the themes — research
 * Khan Academy Kids, Lingokids, LingoAce, VIPKid, Oxford, Cambridge and the
 * top apps, and do better than them. Avoid boring the student.")
 *
 * Every new Playground lesson registers two things here and must pass
 * `checkLessonVariety` (run by lessonVariety.test.ts, part of the deploy gate):
 *
 *  1. LESSON_PROFILE  — its settings (where it happens) and its theme/look.
 *  2. RESEARCH_LOG    — the research done for it: at least 3 sources from the
 *     benchmark list, the mechanic(s) taken from them, and what we did BETTER.
 *
 * The check compares the lesson with the lesson right before it AND with the
 * same lesson slot of the previous unit (the one a child played a few weeks
 * ago), so games, pictures, settings and look keep changing.
 * Method and benchmark list: .claude/skills/lesson-variety-engine/SKILL.md.
 */
import type { Scene } from './unit1/scenes';

/** The shared lesson spine: routine kinds every lesson may repeat (hello, story, songs, rewards…). */
export const ROUTINE_KINDS: ReadonlySet<string> = new Set([
  'title-card', 'song', 'cinematic', 'story-video', 'story-order', 'listen-repeat-cards', 'tpr-actions',
  'join-stage', 'spin-wheel', 'sound-model', 'trace', 'echo', 'sticker-reward', 'home-mission', 'finale',
]);

/** Apps, schools and exam boards to research before every lesson (rotate; never only one). */
export const BENCHMARKS = [
  'Khan Academy Kids', 'Lingokids', 'LingoAce', 'VIPKid', 'Novakid', 'Duolingo ABC', 'ABCmouse',
  'Oxford (Owl / Discover / Phonics World)', 'Cambridge (Pre A1 Starters / ELT)', 'Wordwall', 'Kahoot', 'Sesame Workshop',
] as const;

export type LessonProfile = {
  /** Where the lesson's pictures happen (e.g. 'bedroom', 'beach'). Must differ from the previous lesson's. */
  settings: string[];
  /** One-line theme + visual look (palette, time of day, mood). */
  look: string;
};

export type ResearchEntry = {
  /** Benchmarks studied for this lesson (≥ 3, from BENCHMARKS or a named school/app). */
  sources: string[];
  /** Mechanics taken from them (the underlying idea, never copied content). */
  mechanics: string[];
  /** What this lesson does better than the benchmark (≥ 1 concrete point). */
  betterThan: string[];
};

/** Lessons from here on must have a profile + research entry (older lessons are grandfathered). */
export const VARIETY_ENFORCED_FROM = { unit: 3, lesson: 4 };
/** Built before the rule (rebuild them to the rule when they are next touched). */
export const GRANDFATHERED: readonly string[] = ['5-1'];

export const LESSON_PROFILE: Record<string, LessonProfile> = {
  '2-2': { settings: ['art studio', 'fruit market', 'meadow'], look: "Pip's sunny paint studio indoors, a striped market stall, the rainbow meadow; colour-mixing mission" },
  '3-3': { settings: ['workshop', 'park'], look: 'sunny outdoor park, kites in a blue sky' },
  '3-4': { settings: ['classroom', 'garden pool'], look: 'Show and Tell circle on the rainbow rug; summer garden with a paddling pool' },
  '4-1': { settings: ['dance studio'], look: 'bright dance studio in morning sun: mirror, barre and colourful mats; a dance class with Coach Willow' },
  '3-6': { settings: ['toy fair'], look: 'outdoor fair: sunny day with striped tents, then a golden evening with string lights' },
  '3-5': { settings: ['bedroom'], look: 'cozy bedroom in warm afternoon light; tidy-up mission with a surprise kitten' },
};

export const RESEARCH_LOG: Record<string, ResearchEntry> = {
  '2-2': {
    sources: ['Lingokids', 'Khan Academy Kids', 'Cambridge (Pre A1 Starters / ELT)', '7ESL / TinyTap "Feed the colour monster"'],
    mechanics: [
      'Lingokids "Mixing Colors" audiobook + colour games → Magic Paint Pots inside a painting story',
      'classroom / 7ESL "Feed the colour monster" → Colour Monsters (the monster ASKS by voice)',
      'catch-in-the-right-basket colour sort (Khan Academy Kids sorting) → Catch it! at the market',
    ],
    betterThan: [
      'the colour is only HEARD (no printed word), and a wrong food is named back ("The carrot is orange!") so every mistake teaches',
      'the monsters ask in turn: the child must listen to WHO is hungry and WHAT colour',
      'eaten food stays on each monster\'s plate (permanence); the story film labels each colour with a line to the thing',
    ],
  },
  '3-4': {
    sources: ['Cambridge (Pre A1 Starters / ELT)', 'Wordwall', 'Lingokids'],
    mechanics: ['Guess Who information gap (child asks yes/no questions)', 'magnet fishing for the word you hear'],
    betterThan: ['toys float and bob in a living pool instead of a static grid', 'big/small pairs force listening to the size word, not just the toy'],
  },
  '3-5': {
    sources: ['Lingokids', 'Cambridge (Pre A1 Starters / ELT)', 'Khan Academy Kids', 'VIPKid', 'Novakid'],
    mechanics: [
      'Lingokids × Toy Story "pack the box with toys" → Tidy Up (put the toy in / on / under)',
      'ESL hide-and-seek "where is the toy?" → Peekaboo Toys',
      'Cambridge Starters Listening Part 4: prepositions while listening',
    ],
    betterThan: [
      'the same toy peeks from two places at once, so the child must hear the PLACE word (apps only check the noun)',
      'tidied toys stay where the child put them: the room visibly gets tidier (permanence), with arcs and squash',
      'drag OR tap-tap, never a timer, wrong answers wobble back gently',
    ],
  },
  '3-6': {
    sources: ['Toy-grabber apps (Yateland "Claw Machine Games for kids")', 'Wordwall', 'Khan Academy Kids', 'Duolingo ABC'],
    mechanics: [
      'claw machine (toy grabber) → Toy Grabber: steer the claw to the toy the voice names',
      'fairground ring toss with Wordwall-style one-tap review → Ring Toss (toys, then Unit 3 sounds)',
      'end-of-unit review loop (Khan Academy Kids mastery, Duolingo ABC review) → every Unit 3 skill replayed in one story world',
    ],
    betterThan: [
      'our claw never slips: luck never decides, only choosing the toy the words describe wins (claw apps are random)',
      'the colour decides: two balls and two cars, so "the blue ball" must be heard, not just "ball"',
      'rings stay on the pegs and prizes pile up on a shelf (permanence); wrong throws bounce back gently',
    ],
  },
  '4-1': {
    sources: ['Lingokids', 'Body-parts kids apps (tap / place the part)', 'games4esl / tefl.net classroom games', 'Cambridge (Pre A1 Starters / ELT)'],
    mechanics: [
      'classroom Simon Says → Simon Says Touch on Leo\'s painted body',
      'apps\' "assemble the body" (place each part) → Stack the Friend: rebuild Leo from head to toes',
      'the Head, Shoulders, Knees and Toes action song, slow then fast (teachingexpertise / eslkidstuff)',
    ],
    betterThan: [
      'the whole sentence decides, not just the noun: without "Simon says" the right move is to wait (apps only check the tap)',
      'the friend comes alive when rebuilt — he bounces and thanks you, a story reason to listen',
      'every part is touched on the child\'s own body too (TPR) before it is tapped on screen',
    ],
  },
};

export type VarietyIssue = { code: string; message: string };

const games = (scenes: readonly Pick<Scene, 'kind'>[]) => new Set(scenes.map((s) => s.kind).filter((k) => !ROUTINE_KINDS.has(k)));
/** Main pictures (lesson-specific art), ignoring the shared hello/goodbye cast pictures. */
const pictures = (scenes: readonly Scene[]) =>
  new Set(scenes.map((s) => (s as { bg?: string }).bg).filter((b): b is string => !!b && !/bg-(hello|goodbye)-cast/.test(b)));

export function checkLessonVariety(
  key: string,
  scenes: readonly Scene[],
  prev?: { key: string; scenes: readonly Scene[] },
  sameSlotLastUnit?: { key: string; scenes: readonly Scene[] },
): VarietyIssue[] {
  const out: VarietyIssue[] = [];
  // 1. Never more than 2 of the same kind in a row.
  for (let i = 2; i < scenes.length; i++) {
    if (scenes[i].kind === scenes[i - 1].kind && scenes[i].kind === scenes[i - 2].kind) {
      out.push({ code: 'same-kind-run', message: `three "${scenes[i].kind}" scenes in a row (${scenes[i - 2].id} … ${scenes[i].id})` });
    }
  }
  // 2. Enough different games inside the lesson.
  const g = games(scenes);
  if (g.size < 4) out.push({ code: 'few-games', message: `only ${g.size} different game kinds (need ≥ 4 besides the routine spine)` });
  // 3. No game from the lesson right before.
  if (prev) {
    const rep = [...g].filter((k) => games(prev.scenes).has(k));
    if (rep.length) out.push({ code: 'game-from-previous-lesson', message: `${rep.join(', ')} already used in ${prev.key}` });
    const pics = [...pictures(scenes)].filter((p) => pictures(prev.scenes).has(p));
    if (pics.length) out.push({ code: 'picture-from-previous-lesson', message: `pictures reused from ${prev.key}: ${pics.join(', ')}` });
    const a = LESSON_PROFILE[key]?.settings ?? [];
    const b = LESSON_PROFILE[prev.key]?.settings ?? [];
    const same = a.filter((x) => b.includes(x));
    if (same.length) out.push({ code: 'same-setting', message: `setting "${same.join(', ')}" also used by ${prev.key}` });
  }
  // 4. The same slot of the previous unit: at least half of the games must be new to the child.
  if (sameSlotLastUnit) {
    const old = games(sameSlotLastUnit.scenes);
    const rep = [...g].filter((k) => old.has(k));
    if (g.size && rep.length * 2 > g.size) out.push({ code: 'stale-slot', message: `${rep.length}/${g.size} games repeat ${sameSlotLastUnit.key} (${rep.join(', ')}); swap or upgrade them` });
  }
  // 5. Profile + research registered.
  const p = LESSON_PROFILE[key];
  if (!p || !p.settings.length || !p.look) out.push({ code: 'no-profile', message: 'add LESSON_PROFILE (settings + look)' });
  const r = RESEARCH_LOG[key];
  if (!r) out.push({ code: 'no-research', message: 'add RESEARCH_LOG: ≥ 3 benchmark sources, mechanics, betterThan' });
  else {
    if (r.sources.length < 3) out.push({ code: 'thin-research', message: `only ${r.sources.length} sources (need ≥ 3)` });
    if (!r.mechanics.length || !r.betterThan.length) out.push({ code: 'no-better', message: 'name the mechanics taken and what we do better' });
  }
  return out;
}
