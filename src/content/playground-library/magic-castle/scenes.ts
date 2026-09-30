/* =============================================================================
 * Magic Castle — A1 Unit 9 Lesson 1: "Rooms in the Castle: Kitchen, Bedroom"
 *
 * Built with playground-curriculum-engine + smart-lesson-architect +
 * activity-pattern-library, cross-checked against the seeded roadmap
 * (src/curriculum/roadmap/a1Roadmap.ts, bucket index 8, Unit 9 "Where Is
 * It?") and world (src/curriculum/worlds/a1Worlds.ts, slug 'magic-castle').
 *
 * DB note: this unit's curriculum_lessons rows had a row-level title/
 * unit_title already correctly reading "Where Is It?" / castle-themed (from
 * an earlier bulk fix this project made), but the NESTED
 * ai_metadata.blueprint_ref JSON — the actual pre-seeded objective/grammar/
 * vocab that this methodology designs from — still held completely
 * unrelated "Clothes" unit content (shirt/pants/"It is a...") left over from
 * a generic seed template. Confirmed this was NOT unit-9-specific: every
 * unit 2-10's blueprint_ref had the same kind of mismatch (Colors & Shapes,
 * Numbers, My Body & Face, My Family, Toys & Playtime, Pets & Farm, Food &
 * Drink, Clothes, Action Verbs — a totally different, unrelated curriculum
 * sequence). Fixed for all 7 of this unit's lessons before designing this
 * one (units 2-8/10 still need the same fix — flagged separately, out of
 * scope for this lesson). blueprint_ref feeds the AI-generation pipeline
 * directly (src/components/creator-studio/steps/LibraryManager.tsx), so
 * leaving it stale would have poisoned any future AI-assisted work on this
 * unit with the wrong content entirely.
 *
 * Scope (bucket index 8): topics ['household','rooms','prepositions',
 * 'object_descriptions'], grammarFocus ['prepositions of place (in/on/
 * under/next to/behind)','there is/there are'], vocabularyFocus ['table',
 * 'chair','door','window','lamp','bed','kitchen','bedroom'],
 * reviewTargets ['prepositions of place (in/on/under)'] (Unit 3). That's
 * the whole unit's worth of vocabulary (8 nouns) and grammar — L1 takes a
 * deliberate subset, not all of it: 4 new nouns (kitchen, bedroom, table,
 * chair) + "there is + noun" as the one new grammar chunk, staying inside
 * this project's established A1 scaling rule (3-6 new vocabulary items per
 * lesson). "in/on" reappears only as REVIEW (Unit 3 already taught it,
 * reviewTargets confirms it) — never introduced as new here. door, window,
 * lamp, bed, and next to/behind/there are all belong to L2-L4 (see DB rows
 * 2-4, already correctly titled "Castle Furniture", "Listen: Where Is the
 * Magic Lamp?", "There Is / There Are in My Room!").
 *
 * Cast: Wim (a young castle wizard) and Cat-cat (his familiar) are this
 * world's OWN designed mascots per a1Worlds.ts's 'magic-castle' entry —
 * not invented from scratch, just built now since no art/voice existed yet
 * (same situation Coco was in for Jungle Adventure). Both are brand-new
 * characters, so — unlike Jungle Adventure, which had to choose between
 * reusing established Leo/Willow vs. a new Coco — there is no existing
 * character to prefer here; Pip returns as the narrator for continuity
 * across Playground A1, same role he plays in every other unit's cinematic
 * opener. "hidden-object-quest" is this world's own declared
 * gameplayIdentity (a1Worlds.ts) — Cat-cat's love of hiding is used
 * literally as the flipbook's story mechanic, tying world design to actual
 * lesson content instead of leaving it decorative.
 *
 * Art: 7 background images generated via the Gemini API directly
 * (gemini-3-pro-image-preview, same pipeline as jungle-adventure/scenes.ts
 * and supabase/functions/_shared/googleImageClient.ts), Welcome Town's own
 * bg-classroom-wide.png passed as a style + Pip-design reference on every
 * call, and this unit's own title/hero shot (Wim + Cat-cat together) then
 * reused as a second reference on the remaining 6 so both new characters'
 * designs stay locked across every scene — the same two-reference method
 * that fixed Jungle Adventure's style-drift problem.
 *
 * 24 scenes (extended from an initial 16 after direct feedback that the
 * first pass felt short and under-challenging for a 30-minute slot — see
 * the added scenes below, each grounded in a named, researched technique
 * or an explicit user request rather than added as filler). Hard Variety
 * Rule (activity-pattern-library) respected throughout: the only
 * back-to-back repeats are meet→meet (Wim, Cat-cat) and vocab-spot→
 * vocab-spot (the living-room/hallway and bathroom/dining-room pairs),
 * both at the 2-in-a-row cap. The garden `echo` reveal leads that block
 * (not trails it) specifically so vocab-spot never touches scene 6's own
 * room-intro vocab-spot and runs three in a row. Kinds used: title-card,
 * cinematic, echo ×3, meet ×2, vocab-spot ×4, drag-sticker, drag-match,
 * join-stage, listen-tap ×3, true-false ×2, flipbook ×2, roleplay,
 * hello-doors, finale — eight-plus distinct purpose categories per
 * smart-lesson-architect §18. join-stage stays mid-lesson (not saved for
 * the end): it is this lesson's actual objective made speakable — "There
 * is a ___" produced live — not another recognition/matching rep.
 *
 * Note: an earlier `choice` scene ("Where does Cat-cat like to sleep?")
 * was lost as an unintentional side effect of an earlier edit to this
 * region, not a deliberate removal — caught while adding
 * `mc-listen-find-wim` below. Left out rather than restored: that scene's
 * job (checking bedroom recognition right after it's taught) is now
 * covered more thoroughly by `mc-listen-find-wim`'s six-room listen-and-
 * tap check, so re-adding it would just be a redundant early quiz.
 *
 * Scene 3 introduces "castle" itself as new content via a sensory build-up
 * (creaky floors, flickering torches) rather than a flat instruction —
 * the same fix applied to Jungle Adventure's Unit 2 Lesson 1 after
 * feedback that stating new vocabulary flatly, or spoiling it earlier in
 * the cinematic, wastes the one moment a word can be genuinely new.
 *
 * The three added scenes (Required Research Step, activity-pattern-
 * library — real technique before inventing a new one):
 *   - `mc-find-differences` (after the first listen-tap): adapts Cambridge
 *     English Starters' real "Find the Differences" speaking task — the
 *     kitchen reappears missing its chair, giving "there is no ___" (the
 *     lesson's one genuine grammar extension) real visual evidence instead
 *     of a flat announcement. New art: bg-castle-kitchen-nochair.png,
 *     generated from bg-castle-kitchen.png as a reference so everything
 *     else in the room stays identical.
 *   - `mc-preposition-review` (after the flipbook): adapts British
 *     Council/Oxford ELT's "Do As I Say" preposition game — this engine
 *     has no motion capture, so it's honestly adapted to listen-and-locate
 *     rather than listen-and-move, reviewing Unit 3's in/on (this unit's
 *     own reviewTarget) with one extra contextual item (the cooking pot).
 *   - `mc-storybook-2` ("Chapter 2: The Missing Wand", after the
 *     roleplay): a second, independent story beat — not a longer first
 *     one — giving the lesson a real narrative arc and one more authentic
 *     reason to produce "there is / there is no" before the closing
 *     production and assessment scenes. Reuses existing art, no new images.
 *
 * Three more scenes were added directly on request — a "click the room"
 * tour of five more castle places: living room, hallway, bathroom, dining
 * room, garden. None of these five are in this unit's roadmap
 * vocabularyFocus, so — same discipline as everywhere else in this file —
 * they're built as pure exposure: introduced once, never assessed, placed
 * after the kitchen/bedroom/table/chair teaching is fully done so they
 * read as "here's more of the castle" rather than diluting the actual
 * objective. New art: bg-castle-livingroom-hallway.png,
 * bg-castle-bathroom-dining.png, bg-castle-garden.png — three smaller,
 * clearer images (two rooms per pair, garden solo) generated one pair at
 * a time, replacing a first attempt at a single wide 5-room panorama that
 * was corrected after feedback that it was too crowded to read clearly.
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type Scene } from '../welcome-town/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const M = '/magic-castle';
const bgTitle = `${M}/scenes/bg-castle-title.png`;
const bgWide = `${M}/scenes/bg-castle-wide.png`;
const bgDoorPip = `${M}/scenes/bg-castle-door-pip.png`;
const bgWim = `${M}/scenes/bg-castle-wim.png`;
const bgCatcat = `${M}/scenes/bg-castle-catcat.png`;
const bgRooms = `${M}/scenes/bg-castle-rooms.png`;
const bgKitchen = `${M}/scenes/bg-castle-kitchen.png`;
const bgKitchenNoChair = `${M}/scenes/bg-castle-kitchen-nochair.png`;
const bgFriends = `${M}/scenes/bg-castle-friends.png`;
const bgCastleLivingHall = `${M}/scenes/bg-castle-livingroom-hallway.png`;
const bgCastleBathDining = `${M}/scenes/bg-castle-bathroom-dining.png`;
const bgCastleGarden = `${M}/scenes/bg-castle-garden.png`;
const bgCastleOverview = `${M}/scenes/bg-castle-overview.png`;
const stickerWim = `${M}/scenes/sticker-wim.png`;
const stickerCatcat = `${M}/scenes/sticker-catcat.png`;
const bgBedroomWim = `${M}/scenes/bg-castle-bedroom-wim.png`;

// Hotspot coordinates on bg-castle-overview.png's six rooms, used by the
// student-facing listen-and-tap "Where is Wim?" quiz (mc-listen-find-wim).
const OVERVIEW_LIVING_ROOM = { left: '25%', top: '50%' };
const OVERVIEW_HALLWAY = { left: '50%', top: '48%' };
const OVERVIEW_BATHROOM = { left: '73%', top: '48%' };
const OVERVIEW_BEDROOM = { left: '23%', top: '80%' };
const OVERVIEW_KITCHEN = { left: '48%', top: '80%' };
const OVERVIEW_DINING_ROOM = { left: '73%', top: '80%' };

// Shared hotspot coordinates, matched to where each item actually sits in
// its background image (kitchen on the left / bedroom on the right of the
// cutaway; table left-of-center / chair right-of-center in the kitchen
// interior) — reused across every scene built on that same background so
// "where the word lives" always matches "where the student already looked".
const KITCHEN_SPOT = { left: '20%', top: '75%' };
const BEDROOM_SPOT = { left: '80%', top: '55%' };
const TABLE_SPOT = { left: '32%', top: '75%' };
const CHAIR_SPOT = { left: '63%', top: '78%' };

export const LESSON_A1U9L1_TITLE = 'Rooms in the Castle: Kitchen, Bedroom';
export const LESSON_A1U9L1_OBJECTIVE =
  'Name two castle rooms (kitchen, bedroom) and two furniture items (table, chair), and say what is (and is not) in a room using "There is a ___" / "There is no ___." (Reviews Unit 3’s in/on prepositions; Lesson 2 continues with bed, lamp, door, window.)';

export const LESSON_A1U9L1_SCENES: Scene[] = [
  { id: 'mc-title', kind: 'title-card', bg: bgTitle, level: 'A1', unit: 'Unit 9', lessonLabel: 'Lesson 1', title: 'Magic Castle: Where Is It?', subtitle: 'Explore the castle with Wim and Cat-cat', cta: '\u{1F3F0} LET’S GO!' },

  {
    id: 'mc-intro', kind: 'cinematic', bg: bgDoorPip, title: 'A Mysterious Door', subtitle: 'Pip finds an old castle door', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Whoa, look at this big door! I wonder what is behind it...' },
      { who: 'pip', line: 'Let’s open it and explore together!' },
    ],
    cta: '\u{1F6AA} OPEN THE DOOR!',
  },

  { id: 'mc-setting-castle', kind: 'echo', bg: bgWide, who: 'pip', teacher: 'Shh... listen! Creaky floors, flickering torches, echoing halls! We found somewhere old and magical.', word: 'Castle!' },

  { id: 'mc-meet-wim', kind: 'meet', bg: bgWim, who: 'wim', teacher: 'Tap Wim to meet the castle wizard!', line: 'Hello! I am Wim. I am a wizard!', repeat: 'I am a wizard!' },
  { id: 'mc-meet-catcat', kind: 'meet', bg: bgCatcat, who: 'catcat', teacher: 'Here is Wim’s magical friend! Tap Cat-cat to say hi.', line: 'Meow! I am Cat-cat. I am a cat!', repeat: 'I am a cat!' },

  {
    id: 'mc-vocab-rooms', kind: 'vocab-spot', bg: bgRooms,
    teacher: 'Wim’s castle has many rooms! Tap to learn two of them.',
    items: [
      { label: 'Kitchen', sentence: 'This is the kitchen.', emoji: '\u{1F373}', ...KITCHEN_SPOT, color: '#C97A2F', who: 'wim' },
      { label: 'Bedroom', sentence: 'This is the bedroom.', emoji: '\u{1F6CF}️', ...BEDROOM_SPOT, color: '#2EC4B6', who: 'catcat' },
    ],
  },

  {
    // Bonus exposure, not core content: these five rooms are NOT in this
    // unit's roadmap vocabularyFocus (a1Roadmap.ts bucket 8 scopes Unit 9
    // to table/chair/door/window/lamp/bed/kitchen/bedroom only). Introduced
    // here as light exposure, same "planted, not taught" treatment used for
    // incidental words like "wizard"/"cat" — but they ARE reinforced later,
    // in `mc-listen-find-wim`'s "Where is Wim?" listen-and-tap review, once
    // the whole tour is done. That's a deliberate exposure→light-review
    // arc, not a full teach-and-assess cycle: the free-drag `mc-find-wim`
    // right before it is framed as a teacher-led game with no scoring at
    // all; `mc-listen-find-wim` is the actual student-facing check.
    //
    // First built as one wide 5-room panoramic image — corrected after
    // direct feedback that cramming five rooms into a single frame made it
    // crowded and hard to see each room "wholly". Split into three smaller,
    // clearer images instead (two rooms per pair, same proven scale as
    // bg-castle-rooms.png's kitchen/bedroom cutaway), generated one pair
    // at a time rather than all at once, exactly as asked.
    //
    // Sequencing: originally this bonus block sat AFTER the kitchen-
    // furniture teach/check/practice trio (choice → vocab-furniture →
    // drag-furniture). Moved on request so the WHOLE castle tour runs
    // right after the rooms are introduced, before narrowing into kitchen
    // furniture specifically. The garden `echo` reveal leads this block
    // (rather than trailing it) specifically so vocab-spot never runs
    // three in a row against scene 6's room intro — it's already at the
    // Hard Variety Rule's 2-cap across the two room pairs.
    id: 'mc-castle-garden', kind: 'echo', bg: bgCastleGarden, who: 'pip', teacher: 'And through this arch is the castle garden! Say it with me...', word: 'Garden!' },

  {
    id: 'mc-vocab-living-hall', kind: 'vocab-spot', bg: bgCastleLivingHall,
    teacher: 'Wim’s castle has even MORE rooms! Let’s peek at a few more.',
    items: [
      { label: 'Living Room', sentence: 'This is the living room.', emoji: '\u{1F6CB}️', left: '25%', top: '72%', color: '#8B5A2B' },
      { label: 'Hallway', sentence: 'This is the hallway.', emoji: '\u{1F6AA}', left: '69%', top: '62%', color: '#F4A340' },
    ],
  },

  {
    id: 'mc-vocab-bath-dining', kind: 'vocab-spot', bg: bgCastleBathDining,
    teacher: 'Two more rooms! Tap to learn their names.',
    items: [
      { label: 'Bathroom', sentence: 'This is the bathroom.', emoji: '\u{1F6C1}', left: '18%', top: '75%', color: '#2EC4B6' },
      { label: 'Dining Room', sentence: 'This is the dining room.', emoji: '\u{1F37D}️', left: '72%', top: '70%', color: '#C97A2F' },
    ],
  },

  {
    // Model before practice: one clear worked example — Wim visibly
    // standing in the bedroom, on the same castle cutaway the game below
    // reuses — showing the exact target sentence pattern ("Wim is in the
    // bedroom") once before mc-find-wim asks the student to comprehend six
    // similar sentences on their own. Classic gradual-release sequencing
    // (model → guided practice), added directly on request, right before
    // the game it prepares the student for.
    id: 'mc-model-wim-bedroom', kind: 'echo', bg: bgBedroomWim, who: 'pip',
    teacher: 'Look! Do you see Wim? Listen to what Pip says about him.',
    word: 'Wim is in the bedroom!',
  },

  {
    // Replaces a simpler single-question "where does Cat-cat sleep?"
    // choice scene, on direct request: a full-castle cutaway showing all
    // six rooms taught so far, with the TEACHER freely dragging Wim and
    // Cat-cat between rooms live while quizzing the student out loud —
    // "Where is Wim?" — no in-app scoring at all. This matches a real
    // reference the user pointed to directly (a competitor's house-cutaway
    // slide: "Drag n Drop Slide. Teacher: Name the rooms in a random order
    // and have student repeat and drag Sally into them as you go").
    // Went through two earlier, more complicated designs first — a
    // narrated tap-to-find game, then a drag-to-nearest-zone quiz with an
    // automatic "Where is X?" check — both replaced after direct feedback
    // that the app shouldn't be grading this at all; the teacher's live
    // question IS the check. Also doubles as review for this lesson's four
    // bonus rooms (living room/hallway/bathroom/dining room), introduced
    // earlier but never revisited before this scene existed.
    id: 'mc-find-wim', kind: 'drag-sticker', bg: bgCastleOverview,
    teacher: 'Drag Wim or Cat-cat into a room, then ask: "Where is Wim?"',
    stickers: [
      { who: 'wim', stickerImg: stickerWim, startLeft: '8%', startTop: '12%' },
      { who: 'catcat', stickerImg: stickerCatcat, startLeft: '92%', startTop: '12%' },
    ],
  },

  {
    // Restored on request as a SEPARATE scene, right after the free
    // teacher-drag demo: that scene is teacher-only interaction
    // (iCaptureTaps only fires for the teacher until interaction is
    // unlocked), so it doesn't give the STUDENT their own hands-on moment
    // with this vocabulary. This is that moment — a real listen-and-tap
    // check any student (not just whoever holds the floor) can answer:
    // hear "Where is Wim?", tap the room. Same six-room review content
    // as the very first version of this activity.
    id: 'mc-listen-find-wim', kind: 'listen-tap', bg: bgCastleOverview,
    teacher: 'Listen carefully, then tap where Wim or Cat-cat is hiding!',
    targets: [
      { label: 'Living Room', ...OVERVIEW_LIVING_ROOM, color: '#8B5A2B' },
      { label: 'Hallway', ...OVERVIEW_HALLWAY, color: '#F4A340' },
      { label: 'Bathroom', ...OVERVIEW_BATHROOM, color: '#2EC4B6' },
      { label: 'Bedroom', ...OVERVIEW_BEDROOM, color: '#2EC4B6' },
      { label: 'Kitchen', ...OVERVIEW_KITCHEN, color: '#C97A2F' },
      { label: 'Dining Room', ...OVERVIEW_DINING_ROOM, color: '#C97A2F' },
    ],
    rounds: [
      { prompt: 'Where is Wim? He is in the kitchen!', answerLabel: 'Kitchen', who: 'wim' },
      { prompt: 'Where is Cat-cat? She is in the living room!', answerLabel: 'Living Room', who: 'catcat' },
      { prompt: 'Where is Wim? He is in the bathroom!', answerLabel: 'Bathroom', who: 'wim' },
      { prompt: 'Where is Cat-cat? She is in the bedroom!', answerLabel: 'Bedroom', who: 'catcat' },
      { prompt: 'Where is Wim? He is in the dining room!', answerLabel: 'Dining Room', who: 'wim' },
      { prompt: 'Where is Cat-cat? She is in the hallway!', answerLabel: 'Hallway', who: 'catcat' },
    ],
  },

  {
    id: 'mc-vocab-furniture', kind: 'vocab-spot', bg: bgKitchen,
    teacher: 'Look around the kitchen! Tap each thing to learn its name.',
    items: [
      { label: 'Table', sentence: 'There is a table.', emoji: '\u{1FAB5}', ...TABLE_SPOT, color: '#8B5A2B' },
      { label: 'Chair', sentence: 'There is a chair.', emoji: '\u{1FA91}', ...CHAIR_SPOT, color: '#C97A2F' },
    ],
  },

  {
    id: 'mc-drag-furniture', kind: 'drag-match', bg: bgKitchen,
    teacher: 'Listen, then drag each word onto the matching furniture!',
    items: [
      { label: 'Table', color: '#8B5A2B', targetLeft: TABLE_SPOT.left, targetTop: TABLE_SPOT.top },
      { label: 'Chair', color: '#C97A2F', targetLeft: CHAIR_SPOT.left, targetTop: CHAIR_SPOT.top },
    ],
  },

  {
    // Placed here (not saved for the end) so the lesson's actual grammar
    // target — "There is a ___" — gets produced live by the student right
    // after controlled practice, matching the fix applied to Jungle
    // Adventure's scene 10 (join-stage over another recognition rep).
    id: 'mc-join-stage', kind: 'join-stage', bg: bgKitchen,
    teacher: 'Your turn! When it says YOU, look around and say "There is a ___" yourself!',
    cast: ['wim', 'catcat'],
    turns: [
      { who: 'wim', line: 'There is a table in the kitchen!' },
      { who: 'catcat', line: 'There is a chair in the kitchen!' },
      { who: 'student', line: 'Now YOU! Look around and say "There is a ___!"' },
    ],
  },

  {
    id: 'mc-listen-tap', kind: 'listen-tap', bg: bgKitchen,
    teacher: 'Listen, then tap what you hear!',
    targets: [
      { label: 'Table', ...TABLE_SPOT, color: '#8B5A2B' },
      { label: 'Chair', ...CHAIR_SPOT, color: '#C97A2F' },
    ],
    rounds: [
      { prompt: 'There is a table in the kitchen.', answerLabel: 'Table', who: 'wim' },
      { prompt: 'There is a chair in the kitchen.', answerLabel: 'Chair', who: 'catcat' },
    ],
  },

  {
    // Cambridge English Starters (Pre-A1) uses a real "Find the
    // Differences" speaking task at exactly this level — describe what's
    // different between two near-identical pictures. This engine's
    // `true-false` kind has no dual-image-compare mechanic, so this is an
    // honest adaptation: the SAME kitchen reappears with the chair now
    // missing, framed as a Cat-cat mini-mystery rather than an abstract
    // comparison exercise. It's also the deliberate vehicle for this
    // lesson's one genuine grammar EXTENSION — "there is NO ___", the
    // negative form — introduced here with real visual evidence (the
    // chair really is gone) rather than announced flatly.
    id: 'mc-find-differences', kind: 'true-false', bg: bgKitchenNoChair,
    teacher: 'Wait... look closely! Something changed in the kitchen! Is each sentence true or false?',
    rounds: [
      { who: 'catcat', statement: 'There is a chair in the kitchen.', isTrue: false },
      { who: 'wim', statement: 'There is a table in the kitchen.', isTrue: true },
      { who: 'catcat', statement: 'There is no chair in the kitchen.', isTrue: true },
    ],
  },

  {
    // Ties directly into this world's own declared gameplayIdentity —
    // 'hidden-object-quest' (a1Worlds.ts) — instead of leaving it
    // decorative: Cat-cat's love of hiding IS the story mechanic, and it
    // reviews Unit 3's in/on/under prepositions inside a real narrative.
    id: 'mc-storybook', kind: 'flipbook', bg: bgWide, title: 'Cat-cat’s Hiding Game',
    pages: [
      { who: 'catcat', img: bgKitchen, text: 'Cat-cat loves to hide! Today she hides in the kitchen.' },
      { who: 'catcat', img: bgKitchen, text: 'There is a cat... under the table!' },
      { who: 'wim', img: bgWim, text: 'Wim looks everywhere. Is Cat-cat in his study?' },
      { who: 'catcat', img: bgCatcat, text: 'There is a cat... on the windowsill!' },
      { who: 'wim', img: bgFriends, text: 'Wim finds her at last! "There you are, Cat-cat!"' },
    ],
    checkpoints: [
      { afterPage: 2, who: 'pip', question: 'Where is Cat-cat hiding?', options: ['Under the table', 'On the bed', 'In the kitchen'], answer: 'Under the table' },
      { afterPage: 4, who: 'pip', question: 'Where does Wim find Cat-cat?', options: ['On the windowsill', 'Under the table', 'In the bedroom'], answer: 'On the windowsill' },
    ],
  },

  {
    // British Council/Oxford ELT's "Do As I Say" preposition game has
    // students act out in/on/under commands live — this engine has no
    // motion capture, so the honest adaptation is listen-and-locate
    // instead of listen-and-move: the target language (Unit 3's in/on/
    // under, this lesson's own reviewTarget) does the same cognitive work
    // without pretending a tap is a physical action. Adds a third item
    // (the cooking pot) purely as contextual exposure, not a taught word.
    id: 'mc-preposition-review', kind: 'listen-tap', bg: bgKitchen,
    teacher: 'Listen carefully and tap what Wim and Cat-cat are talking about!',
    targets: [
      { label: 'Table', ...TABLE_SPOT, color: '#8B5A2B' },
      { label: 'Chair', ...CHAIR_SPOT, color: '#C97A2F' },
      { label: 'Pot', left: '82%', top: '42%', color: '#F4A340' },
    ],
    rounds: [
      { prompt: 'The cooking pot is on the fire.', answerLabel: 'Pot', who: 'wim' },
      { prompt: 'There is a chair in the kitchen.', answerLabel: 'Chair', who: 'catcat' },
      { prompt: 'There is a table in the kitchen.', answerLabel: 'Table', who: 'wim' },
    ],
  },

  {
    id: 'mc-roleplay', kind: 'roleplay', bg: bgFriends,
    teacher: 'Story time! Listen to Wim and Cat-cat describe the castle, then repeat each line.',
    cast: ['wim', 'catcat'],
    script: [
      { who: 'wim', line: 'There is a table in the kitchen.', repeat: true },
      { who: 'catcat', line: 'There is a bed in the bedroom.', repeat: true },
      { who: 'wim', line: 'There is a chair in the kitchen.', repeat: true },
    ],
  },

  {
    // A second story chapter, not just a longer first one — a fresh
    // mini-mystery with its own stakes (Wim's lost wand) that gives the
    // student a reason to apply "there is / there is no" one more time in
    // a real narrative, right before the lesson's closing production and
    // assessment scenes. Reuses existing art; no new images needed.
    id: 'mc-storybook-2', kind: 'flipbook', bg: bgWide, title: 'Chapter 2: The Missing Wand',
    pages: [
      { who: 'wim', img: bgWim, text: 'Oh no! Wim can’t find his magic wand. "Where is it?" he asks.' },
      { who: 'pip', img: bgWide, text: 'Pip looks in the great hall. "There is no wand here," says Pip.' },
      { who: 'catcat', img: bgCatcat, text: 'Cat-cat looks by the window. "There is no wand here either!" says Cat-cat.' },
      { who: 'wim', img: bgKitchen, text: 'They look in the kitchen. "There it is! There is a wand on the table!" says Wim.' },
      { who: 'wim', img: bgFriends, text: '"Thank you, friends!" says Wim. Everyone is happy again.' },
    ],
    checkpoints: [
      { afterPage: 2, who: 'pip', question: 'Where does Pip look first?', options: ['Great hall', 'Kitchen', 'Bedroom'], answer: 'Great hall' },
      { afterPage: 4, who: 'catcat', question: 'Where do they find the wand?', options: ['On the table', 'Under the bed', 'In the window'], answer: 'On the table' },
    ],
  },

  {
    id: 'mc-hello-doors', kind: 'hello-doors', bg: bgWide,
    teacher: 'Knock knock! Listen for the clue, then tap the right door!',
    cast: ['wim', 'catcat'],
    rounds: [
      { target: 'wim', prompt: 'Who says "There is a table"?', helloLine: 'I say there is a table!', echoLine: 'There is a table.' },
      { target: 'catcat', prompt: 'Who says "There is a bed"?', helloLine: 'I say there is a bed!', echoLine: 'There is a bed.' },
    ],
  },

  {
    id: 'mc-true-false', kind: 'true-false', bg: bgFriends,
    teacher: 'Listen to each sentence. Is it TRUE or FALSE?',
    rounds: [
      { who: 'wim', statement: 'There is a bed in the kitchen.', isTrue: false },
      { who: 'catcat', statement: 'There is a table in the kitchen.', isTrue: true },
      { who: 'wim', statement: 'There is a bed in the bedroom.', isTrue: true },
    ],
  },

  { id: 'mc-finale', kind: 'finale', bg: bgFriends, who: 'pip', line: 'You explored the castle and learned kitchen, bedroom, table, and chair! Look around your home tonight and say "There is a ___!" ✨\u{1F3F0}' },
];
