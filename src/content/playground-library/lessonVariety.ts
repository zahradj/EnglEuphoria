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
  '2-3': { settings: ['town street', 'builder yard'], look: 'sunny Shape Town street with a clock tower, a house and a flag; a grassy builder yard where the friends build with shapes' },
  '3-3': { settings: ['workshop', 'park'], look: 'sunny outdoor park, kites in a blue sky' },
  '3-4': { settings: ['classroom', 'garden pool'], look: 'Show and Tell circle on the rainbow rug; summer garden with a paddling pool' },
  '4-1': { settings: ['dance studio'], look: 'bright dance studio in morning sun: mirror, barre and colourful mats; a dance class with Coach Willow' },
  '4-2': { settings: ['kitchen'], look: 'cozy sunny breakfast kitchen with pancakes and fruit; top-down plate where Pip and Mia make pancake faces' },
  '4-4': { settings: ['flower garden'], look: 'bright flower garden with big friendly mushrooms; Pip meets Bo, a round sky-blue three-eyed monster; code-drawn monsters on an empty lawn' },
  '4-5': { settings: ['animal park'], look: 'sunny animal park with a blue pond and tall trees; a tiger, a monkey, an elephant and a seal each show one move, Pip copies; a leafy bush to peek through' },
  '5-3': { settings: ['cottage'], look: "Grandma and Grandpa's cozy cottage: a red sofa by the fireplace, a warm kitchen on baking day, a garden with a little wooden gate; Grandma (grey bun, glasses, lavender cardigan) and Grandpa (moustache, glasses, flat cap)" },
  '5-2': { settings: ['backyard'], look: "sunny backyard of Pip's home: wooden fence, a tree swing, a picnic blanket; family photo day with Pip's big brother, little sister and the baby" },
  '4-6': { settings: ['space station'], look: 'bright pastel space station with round star windows and a ringed planet; Pip and Mia play Simon Says with Robo, a silver robot drawn in code' },
  '4-3': { settings: ['beach'], look: 'sunny beach day: golden sand, blue sea, sandcastle and umbrella; top-down wet sand for prints; Bella and Leo' },
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
  '2-3': {
    sources: [
      'Cambridge (Pre A1 Starters / ELT: listen and put it in the picture; "Which is correct?" picture choice)',
      'Oxford (Numicon feely bag) + British Council LearnEnglish Kids "Mystery bag game"',
      'Duolingo ABC / Khan Academy Kids (finger tracing; shape recognition in Logic+)',
      'Lingokids (shapes games; "7 ways to teach shapes") and Novakid shape games',
      'englishclub / eslkidstuff (TPR shapes: draw in the air, make shapes with the body)',
    ],
    mechanics: [
      'finger tracing (Duolingo ABC, Khan Academy Kids) + Cambridge "put it in the picture" → Magic Pencil: trace the shape and it comes alive in Shape Town',
      'the feely / mystery bag (Oxford Numicon, British Council) → What\'s Peeking?: only an edge or a corner shows; guess the shape',
      'the toddler shape-sorter toy + Cambridge colour-and-object listening → Shape Sorter: "Put in the blue square!"',
      'bubble / balloon pop (Lingokids, Wordwall) → calm Bubble Pop: pop only the shape you hear',
    ],
    betterThan: [
      'tracing is not a worksheet: every finished shape becomes a thing that stays (the sun, a present, a pizza, a ball), so the child paints a whole picture',
      'in What\'s Peeking? a wrong guess makes the shape peek out a little more — every miss is a clue, never a loss',
      'the sorter has two blocks of each shape, so the colour must be HEARD too (recycling Lessons 1-2); a wrong block is named back',
      'calm by design: no clock anywhere, bubbles wait on the spot, the right answer glows after two misses; no reading pages (the old timed Shape Dash, text storybook and "Read the word" are gone)',
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
  '4-2': {
    sources: ['Lingokids (face-parts games, Face Scramble)', 'TinyTap (parts of the face)', 'Genki English ("Make a face" song)', 'Face Maker drag-and-drop game (englishflashgames)', 'Cambridge (Pre A1 Starters body & face)'],
    mechanics: [
      'apps\' "put the features back on the face" → Pancake Faces: tap WHERE each fruit part goes on a plain pancake',
      'the classroom "Point to your …!" routine → the child gives the order to Mia (role swap)',
      'face-parts action songs → our own Eyes, Ears, Mouth and Nose song, sung while pointing',
    ],
    betterThan: [
      'no picture of the part to match: the spoken word alone tells the child where to tap (the apps show the piece)',
      'a wrong place is named back ("Not there! That\'s for the nose!"), so every mistake teaches a word',
      'the finished pancake comes alive and smiles, and the same game returns with a new order for Mia',
    ],
  },
  '4-4': {
    sources: ['Cambridge (Pre A1 Starters / ELT: listen and colour / draw the monster)', 'Lingokids (build-a-character body games)', 'Khan Academy Kids (tap-to-count)', 'Duolingo ABC (count and choose)', '"Go Away, Big Green Monster!" picture book (a face built part by part)'],
    mechanics: [
      'Cambridge "listen and draw the monster" + build-a-character apps → Monster Maker: the monster says "I have three eyes!" and the child picks the part it hears',
      'tap-to-count (Khan Academy Kids, Duolingo ABC) → How Many?: tap each eye to count it out loud, then choose the number',
      'the "Go Away, Big Green Monster!" reveal → a friendly monster, Bo, the class meets and compares bodies with',
    ],
    betterThan: [
      'the NUMBER and the SIZE decide the part (one / two / three eyes, big / small feet) — apps only ask for the part',
      'counting ends in a real sentence the child hears and says ("I have three eyes!"), and the number choice only opens after everything is counted (no guessing)',
      'calm by design: no clock, a wrong part is named back ("That\'s two eyes! Try again!") and the right one glows after two misses',
    ],
  },
  '4-5': {
    sources: ['Eric Carle "From Head to Toe" (call-and-response movement book: "Can you do it?" — "I can do it!")', 'Lingokids (action / animal games)', 'Cambridge (Pre A1 Starters listen and point; look and guess)', 'Khan Academy Kids (hide-and-reveal, calm self-paced)', 'Sesame Workshop (model → copy, pause for the child)'],
    mechanics: [
      'the movement-book call and response → a stills film where each animal shows ONE move, Pip asks "Can you do it?", pauses, then copies it',
      'listen and point → Who Can Do It?: hear the move, tap the animal, then do the move and say "I can do it!"',
      'the peekaboo "Whose tail is it?" pattern → Whose Is It?: one body part peeks out of a bush, tap the animal, the bush slides away',
    ],
    betterThan: [
      'the child must understand the verb AND the body part to find the animal, then PRODUCES the move and the sentence — the screen waits for the child, never a clock',
      'the clue in Whose Is It? is one of the unit\'s body words, so naming the part and the animal go together, and the reveal recalls the story move',
      'wrong picks are named back with that animal\'s own move ("No, the seal claps her hands!"), and the right one glows after two tries',
    ],
  },
  '5-3': {
    sources: ['Lingokids / Toca Kitchen (cook-and-serve pretend play)', 'teach-this.com and games4esl ("What\'s missing?" / Kim\'s game)', 'Khan Academy Kids (calm, self-paced build and memory play)', 'Cambridge (Pre A1 Starters listen and point)'],
    mechanics: [
      'cook-and-serve play + listen and point → Grandma\'s Cookies: "Let\'s make a Grandpa cookie!" — pick the face icing, bake it, it joins the family plate',
      '"What\'s missing?" memory game → Who\'s Missing?: Grandma\'s photo wall, lights off, one photo is gone — name who is missing',
      'the big hug picture as a jigsaw, and Grandma\'s G basket for /g/ things',
    ],
    betterThan: [
      'the family word alone picks the cookie face (no word on screen first), and every cookie baked stays on the plate as a family the child built',
      'in Who\'s Missing? the child turns the lights off when ready — no clock — and answers with a family word they say back; the empty frame glows after two tries',
      'calm by design: a wrong face is named back ("No, that\'s Grandma!") and nothing is lost for trying',
    ],
  },
  '5-2': {
    sources: ['Khan Academy Kids (camera / photo reward, calm self-paced)', 'Lingokids (family & sticker-album games)', 'Montessori (size seriation: biggest to smallest)', 'Cambridge (Pre A1 Starters listen and point)', 'classroom show-and-tell with a family photo'],
    mechanics: [
      'camera rewards + listen and point → Family Photo: "Take a photo of my sister!" — snap that person in the family picture, a polaroid slides out',
      'Montessori size seriation → Line Up!: line the family up from the biggest to the smallest for the photo',
      'family-photo show-and-tell → the child tells Pip "This is my brother" about their own family',
    ],
    betterThan: [
      'no word on screen in Family Photo: the spoken family word alone finds the person, and every photo stays on the string as a keepsake',
      'Line Up! makes each step a family word the child hears and repeats ("My big brother!"), and recycles big / small from Unit 4',
      'calm by design: no clock, a wrong pick is named back ("That\'s my brother!") and the right one glows after two tries',
    ],
  },
  '4-6': {
    sources: ['Simon electronic memory game (watch the lights, repeat the order)', 'games4esl (Simon Says / "Touch your …" TPR)', 'Cambridge (Pre A1 Starters listen and point)', 'Lingokids (Draw Path)', 'Wordwall (odd one out)', 'Khan Academy Kids (calm, self-paced)'],
    mechanics: [
      'the Simon memory game + classroom Simon Says → Robo Says: Robo lights a chain of body parts, the child touches them in the same order',
      'Lingokids Draw Path → draw a line from Pip to the body part Mia names',
      'Wordwall odd one out → face or body? three are on the face, tap the one that is not',
    ],
    betterThan: [
      'the spoken body words are what the child remembers (Simon uses colours and beeps), and every part is named again when tapped',
      'a wrong tap names the part touched ("Oops! Robo\'s ears!") and replays the chain; the next part glows after two misses — no clock, no lives',
      'the child then becomes Simon and gives the orders (role swap), on the screen and at home',
    ],
  },
  '4-3': {
    sources: ['Classroom handprint / footprint art (preschool body-parts activity)', 'Lingokids (body-parts games)', 'Khan Academy Kids (calm, self-paced; a result that stays)', 'Cambridge (Pre A1 Starters listening: put the picture in the right place)', 'Sesame Workshop touch-tablet best practices (no clocks, deliberate actions)'],
    mechanics: [
      'handprint / footprint art → Sand Prints: hear "Press your foot in the sand!", choose the body part, the print stays in the sand',
      'Cambridge "listen and place" → the print lands on the beach picture the child is making',
      'peekaboo reveal → "Whose hands?": peek at a friend from earlier lessons and say who it is',
    ],
    betterThan: [
      'the spoken word alone decides which body part to press (apps match picture to picture)',
      'the prints stay: by the end the sand is a picture the child made',
      'calm by design: no clock, nothing moving, a wrong part is named back and the right one glows after two tries',
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
