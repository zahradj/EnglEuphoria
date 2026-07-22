// Expert Lesson Architect — Novakid-Inspired Early-Learner Progression Map
// ----------------------------------------------------------------------------
// Verified against the Novakid public curriculum (programs Pre-K → Level 5):
//   Pre-K  (4–5)  → 67 lessons, Pre-Pre-A1
//   L1 Juniors  (6–7)  → 49 lessons, Pre-A1 (14 confirmed units)
//   L2 Starters (8–9)  → 49 lessons, Pre-A1 / Cambridge YLE Starters
//   L3 Movers   (10–11)→ 63 lessons, A1     / Cambridge YLE Movers
//   L4 Flyers   (11–12)→ 83 lessons, A2     / Cambridge YLE Flyers
//   L5 Advanced (14+)  → 80 lessons, B1
// Lesson = 25 min, framework = PPP + TPR + 100% English immersion +
// Game World gamification + optional CLIL at L3/L4.
//
// We adapt that into Engleuphoria's 6-lesson-unit structure with the Pip
// mascot story arc and our claymorphism vault. The Architect uses this map
// to anchor Playground blueprints to a proven sequence instead of inventing
// off-syllabus topics.


import type { Cefr } from '@/governance/types';

export interface NovakidUnit {
  unitNumber: number;
  topic: string;
  vocab: string[];
  grammar: string[];
  function: string;
  storyHook: string;
}

export interface NovakidLevelMap {
  level: Cefr;
  yearTarget: string; // approx ages
  totalUnits: number;
  unitsPerCycle: number;
  units: NovakidUnit[];
}

// ── Pre-A1 (Pre-Reader / Beginner, ages 4–6) ────────────────────────────────
const PRE_A1_MAP: NovakidLevelMap = {
  level: 'Pre-A1',
  yearTarget: '4–6',
  totalUnits: 12,
  unitsPerCycle: 6,
  units: [
    { unitNumber: 1, topic: 'Hello!', vocab: ['hello', 'hi', 'bye', 'my name is'], grammar: ['I am'], function: 'greet & say my name', storyHook: 'Pip meets new friends in the forest.' },
    { unitNumber: 2, topic: 'Colors', vocab: ['red', 'blue', 'yellow', 'green', 'pink'], grammar: ['it is + color'], function: 'name colors', storyHook: 'A rainbow brings each color to life.' },
    { unitNumber: 3, topic: 'Numbers 1–10', vocab: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'], grammar: ['How many? Number'], function: 'count objects', storyHook: 'Count the magic stars.' },
    { unitNumber: 4, topic: 'My family', vocab: ['mum', 'dad', 'brother', 'sister', 'baby'], grammar: ['this is my…'], function: 'introduce family', storyHook: 'Pip\'s family photo album.' },
    { unitNumber: 5, topic: 'Animals', vocab: ['cat', 'dog', 'cow', 'duck', 'fish', 'bird'], grammar: ['it is a…', 'plural -s'], function: 'name animals', storyHook: 'Visit the farm with Pip.' },
    { unitNumber: 6, topic: 'My body', vocab: ['head', 'eyes', 'nose', 'mouth', 'hands', 'feet'], grammar: ['I have got…'], function: 'point to body parts', storyHook: 'Pip teaches a monster about bodies.' },
    { unitNumber: 7, topic: 'Toys', vocab: ['ball', 'doll', 'car', 'teddy', 'kite'], grammar: ['I like…'], function: 'say what I like', storyHook: 'A toy that came to life.' },
    { unitNumber: 8, topic: 'Food', vocab: ['apple', 'banana', 'milk', 'bread', 'cake'], grammar: ['I want…'], function: 'ask for food', storyHook: 'A magical picnic.' },
    { unitNumber: 9, topic: 'Clothes', vocab: ['t-shirt', 'shoes', 'hat', 'socks'], grammar: ['put on / take off'], function: 'name clothes', storyHook: 'Dressing up for the parade.' },
    { unitNumber: 10, topic: 'My house', vocab: ['kitchen', 'bedroom', 'door', 'window', 'bed'], grammar: ['this is the…'], function: 'name rooms', storyHook: 'A tour of the treehouse.' },
    { unitNumber: 11, topic: 'Weather', vocab: ['sunny', 'rainy', 'windy', 'snowy'], grammar: ['it is + weather'], function: 'say the weather', storyHook: 'Pip\'s weather adventure.' },
    { unitNumber: 12, topic: 'Review & celebrate', vocab: [], grammar: [], function: 'recycle 1–11 in a story', storyHook: 'Grand carnival.' },
  ],
};

// ── A1 (ages 6–8) ────────────────────────────────────────────────────────────
const A1_MAP: NovakidLevelMap = {
  level: 'A1',
  yearTarget: '6–8',
  totalUnits: 18,
  unitsPerCycle: 6,
  units: [
    { unitNumber: 1, topic: 'About me', vocab: ['name', 'age', 'country'], grammar: ['How old are you? — I am…'], function: 'introduce self', storyHook: 'Pip\'s new pen-pal.' },
    { unitNumber: 2, topic: 'My day', vocab: ['wake up', 'eat', 'play', 'sleep'], grammar: ['present simple — I/you'], function: 'describe daily routine', storyHook: 'A day at adventure camp.' },
    { unitNumber: 3, topic: 'School', vocab: ['book', 'pen', 'desk', 'teacher', 'classroom'], grammar: ['there is / there are'], function: 'describe classroom', storyHook: 'A magic school appears.' },
    { unitNumber: 4, topic: 'Hobbies', vocab: ['draw', 'sing', 'dance', 'ride a bike'], grammar: ['I can / can\'t'], function: 'say what I can do', storyHook: 'Talent show!' },
    { unitNumber: 5, topic: 'Pets', vocab: ['rabbit', 'parrot', 'turtle', 'hamster'], grammar: ['have got — neg/quest'], function: 'talk about pets', storyHook: 'The lost pet quest.' },
    { unitNumber: 6, topic: 'Places in town', vocab: ['park', 'shop', 'school', 'library'], grammar: ['prepositions in/on/under/next to'], function: 'locate places', storyHook: 'Treasure map of the village.' },
    // Units 7–18 follow the same shape — themes broaden into seasons, parties, sports, jobs, transport, holidays, feelings, food meals, nature, festivals, technology basics, review.
  ],
};

// ── A2 (ages 8–10) ───────────────────────────────────────────────────────────
const A2_MAP: NovakidLevelMap = {
  level: 'A2',
  yearTarget: '8–10',
  totalUnits: 18,
  unitsPerCycle: 6,
  units: [
    { unitNumber: 1, topic: 'My weekend', vocab: ['went', 'played', 'visited', 'watched'], grammar: ['past simple — regular'], function: 'narrate weekend', storyHook: 'Pip\'s mystery weekend.' },
    { unitNumber: 2, topic: 'Adventures', vocab: ['climb', 'jump', 'swim', 'explore'], grammar: ['past simple — irregular'], function: 'narrate adventures', storyHook: 'Lost in the cave.' },
    { unitNumber: 3, topic: 'Future plans', vocab: ['next week', 'tomorrow', 'soon'], grammar: ['going to'], function: 'state plans', storyHook: 'Planning the festival.' },
    { unitNumber: 4, topic: 'Compare things', vocab: ['big', 'small', 'fast', 'tall', 'old'], grammar: ['comparatives & superlatives'], function: 'compare', storyHook: 'Who is the fastest creature?' },
    { unitNumber: 5, topic: 'Healthy living', vocab: ['fruit', 'vegetables', 'exercise', 'sleep'], grammar: ['should / shouldn\'t'], function: 'give simple advice', storyHook: 'The hero training camp.' },
    { unitNumber: 6, topic: 'Storytime', vocab: ['once upon a time', 'suddenly', 'finally'], grammar: ['past simple narrative'], function: 'tell a short story', storyHook: 'Pip writes a fairytale.' },
  ],
};

// ── B1 (ages 9–12 Playground top end — story-first, NEVER drill-heavy) ─────
const B1_MAP: NovakidLevelMap = {
  level: 'B1',
  yearTarget: '9–12',
  totalUnits: 12,
  unitsPerCycle: 6,
  units: [
    { unitNumber: 1, topic: 'Quests & journeys', vocab: ['discover', 'rescue', 'escape'], grammar: ['present perfect via stories'], function: 'narrate completed adventures', storyHook: 'The Dragon Chronicles, ch.1.' },
    { unitNumber: 2, topic: 'Inventions', vocab: ['invent', 'design', 'try'], grammar: ['used to'], function: 'describe how things used to be', storyHook: 'A time-machine workshop.' },
    { unitNumber: 3, topic: 'Big dreams', vocab: ['wish', 'imagine', 'dream'], grammar: ['first conditional (story-bound)'], function: 'hypothesise playfully', storyHook: 'If you find the golden key…' },
    { unitNumber: 4, topic: 'Mysteries', vocab: ['clue', 'suspect', 'discover'], grammar: ['past continuous + past simple'], function: 'narrate two-strand events', storyHook: 'The case of the missing crown.' },
    { unitNumber: 5, topic: 'Heroes & helpers', vocab: ['brave', 'kind', 'clever'], grammar: ['relative clauses (who/which)'], function: 'describe people', storyHook: 'Meet the legendary heroes.' },
    { unitNumber: 6, topic: 'Grand finale', vocab: [], grammar: [], function: 'recycle in epic story finale', storyHook: 'The Dragon Chronicles ending.' },
  ],
};

export const NOVAKID_PROGRESSION_MAP: Partial<Record<Cefr, NovakidLevelMap>> = {
  'Pre-A1': PRE_A1_MAP,
  A1: A1_MAP,
  A2: A2_MAP,
  B1: B1_MAP,
};

/**
 * Returns the next-unit context for a given level + completed unit number,
 * so the Architect can produce a blueprint that fits the progression rather
 * than starting from zero.
 */
export function getNovakidUnitContext(level: Cefr, completedUnits = 0): {
  nextUnit?: NovakidUnit;
  upcoming: NovakidUnit[];
  recyclePool: string[];
} {
  const map = NOVAKID_PROGRESSION_MAP[level];
  if (!map) return { upcoming: [], recyclePool: [] };
  const idx = Math.min(completedUnits, map.units.length - 1);
  const nextUnit = map.units[idx];
  const upcoming = map.units.slice(idx + 1, idx + 4);
  const recyclePool = map.units.slice(Math.max(0, idx - 3), idx).flatMap((u) => u.vocab);
  return { nextUnit, upcoming, recyclePool };
}

export function buildNovakidPrompt(level: Cefr, completedUnits = 0): string {
  const map = NOVAKID_PROGRESSION_MAP[level];
  if (!map) return '';
  const ctx = getNovakidUnitContext(level, completedUnits);
  const lines: string[] = [];
  lines.push(`### EARLY-LEARNER PROGRESSION MAP — Playground ${map.level} (ages ${map.yearTarget})`);
  lines.push(`Total units: ${map.totalUnits}, ${map.unitsPerCycle} per cycle. Lessons are story chapters of a continuing arc with recurring characters (Pip + friends).`);
  if (ctx.nextUnit) {
    lines.push(`\nSUGGESTED NEXT UNIT (slot ${ctx.nextUnit.unitNumber}):`);
    lines.push(`- Topic: ${ctx.nextUnit.topic}`);
    lines.push(`- Target vocab seed: ${ctx.nextUnit.vocab.join(', ')}`);
    lines.push(`- Grammar focus: ${ctx.nextUnit.grammar.join(', ')}`);
    lines.push(`- Communication function: ${ctx.nextUnit.function}`);
    lines.push(`- Story hook: ${ctx.nextUnit.storyHook}`);
  }
  if (ctx.recyclePool.length) {
    lines.push(`\nRECYCLE POOL (weave ≥3 into review_targets): ${ctx.recyclePool.join(', ')}`);
  }
  if (ctx.upcoming.length) {
    lines.push(`\nDO NOT consume upcoming topics yet: ${ctx.upcoming.map((u) => u.topic).join(' · ')}`);
  }
  return lines.join('\n');
}
