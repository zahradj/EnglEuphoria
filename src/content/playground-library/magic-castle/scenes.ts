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
 * 25 scenes (extended from an initial 16 after direct feedback that the
 * first pass felt short and under-challenging for a 30-minute slot — see
 * the added scenes below, each grounded in a named, researched technique
 * or an explicit user request rather than added as filler). Hard Variety
 * Rule (activity-pattern-library) respected throughout: the only
 * back-to-back repeats are meet→meet (Wim, Cat-cat) and vocab-spot→
 * vocab-spot (the living-room/hallway and bathroom/dining-room pairs),
 * both at the 2-in-a-row cap. The garden `echo` reveal leads that block
 * (not trails it) specifically so vocab-spot never touches scene 6's own
 * room-intro vocab-spot and runs three in a row. Kinds used: title-card,
 * cinematic, echo ×3, meet ×2, vocab-spot ×4, drag-sticker, picture-match,
 * drag-match, join-stage, listen-tap ×3, true-false ×2, flipbook ×2,
 * roleplay, hello-doors, finale — eight-plus distinct purpose categories per
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
 * `mc-match-rooms` (scene 13, on request): a self-check picture ↔ word
 * matching slide for the six rooms, right after the listen-and-tap — the
 * rooms block's written-word check (every earlier room scene was spoken).
 * Sequence around it stays within the Hard Variety Rule: drag-sticker →
 * listen-tap → picture-match → vocab-spot → drag-match (no kind repeated
 * back to back).
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
// Regenerated per direct request: now shows Pip standing alongside Wim and
// Cat-cat (previously just the two of them), same hallway/door/tapestry
// composition. Nothing else references this file, so it was updated in
// place rather than introducing a second near-duplicate title image.
const bgTitle = `${M}/scenes/bg-castle-title.png`;
// bgWide is reused by several OTHER scenes below (the storybook chapters,
// hello-doors) that depend on its hallway/door composition specifically —
// left untouched. mc-setting-castle's own "Castle!" reveal gets its own
// new bgCastleExterior instead (see that scene), regenerated per direct
// request: the old bgWide was just the same interior hallway already
// shown twice by this point, not an actual castle building.
const bgWide = `${M}/scenes/bg-castle-wide.png`;
const bgCastleExterior = `${M}/scenes/bg-castle-exterior.png`;
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
// Dedicated manga-panel story art for mc-storybook (per-page, generated to
// match this lesson's existing flat-vector illustration style rather than
// reusing the room-establishing backgrounds above) — see FlipbookScene's
// two-panel diagonal-cut layout. "-main" is the dominant story-beat panel,
// "-accent" is the smaller character reaction close-up.
const S1 = `${M}/scenes`;
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
// Crop windows (percent of the image) for the left / right room of each
// two-room cutaway (bg-castle-rooms, -livingroom-hallway, -bathroom-dining),
// used by mc-match-rooms' picture cards.
const ROOM_LEFT = { x: 5.5, y: 17, w: 46.5, h: 69 };
const ROOM_RIGHT = { x: 55.5, y: 17, w: 39, h: 69 };

const KITCHEN_SPOT = { left: '20%', top: '75%' };
const BEDROOM_SPOT = { left: '80%', top: '55%' };
const TABLE_SPOT = { left: '32%', top: '75%' };
const CHAIR_SPOT = { left: '63%', top: '78%' };
// Real approximate footprint of each piece of furniture in
// bg-castle-kitchen.png, as percentages of the scene — passed to
// mc-drag-furniture's items as targetWidth/targetHeight below so a drop
// is scored against the object's actual (wide-and-low for the table,
// narrower-and-taller for the chair) shape instead of one fixed-radius
// circle. Per direct report: dropping near the table's edge, and
// separately near the top of the chair's backrest, still registered as a
// miss with the old single-radius circle. Generous on purpose — these
// two items sit far enough apart in the scene that over-covering either
// one carries no real risk of matching the wrong item (see
// DragMatchScene's hit-test: a drop is only ever checked against the
// item currently being dragged, never compared against its neighbor).
const TABLE_SIZE = { targetWidth: '42%', targetHeight: '26%' };
const CHAIR_SIZE = { targetWidth: '26%', targetHeight: '55%' };

export const LESSON_A1U9L1_TITLE = 'Rooms in the Castle: Kitchen, Bedroom';
export const LESSON_A1U9L1_OBJECTIVE =
  'Name two castle rooms (kitchen, bedroom) and two furniture items (table, chair), and say what is (and is not) in a room using "There is a ___" / "There is no ___." Phonics: the CH /tʃ/ sound (chair, kitchen, cheese, chick) with a tongue twister and a short reading. (Reviews Unit 3’s in/on prepositions; Lesson 2 continues with bed, lamp, door, window.)';

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

  // bgCastleExterior is composed with the castle filling the left ~2/3 of
  // the frame and open sky on the right — textSide explicitly set to
  // 'right' (matches the default, but stated directly per the exact
  // "castle on the left, word on the right" request rather than relying
  // silently on EchoScene's fallback).
  { id: 'mc-setting-castle', kind: 'echo', bg: bgCastleExterior, who: 'pip', textSide: 'right', teacher: 'Shh... listen! Creaky floors, flickering torches, echoing halls! We found somewhere old and magical.', word: 'Castle!' },

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
    id: 'mc-model-wim-bedroom', kind: 'echo', bg: bgBedroomWim, who: 'pip', textSide: 'top',
    teacher: 'Look! Do you see Wim? Listen to what Pip says about him.',
    word: 'Wim is in the bedroom!',
    // Wim -> his own CAST color (#4A4E69, matches every pointer/chip that
    // names him elsewhere); "is in the" -> one fixed color shared by every
    // future "<char> is in the <room>" scene so the pattern reads as one
    // recognizable chunk; "bedroom!" -> the room's own established teal
    // (#2EC4B6, same hotspot color used for Bedroom at lines 196 and 299 in
    // this file) so the taught word visually ties back to the room itself.
    wordColors: ['#4A4E69', '#EF4444', '#EF4444', '#EF4444', '#2EC4B6'],
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
    // ROOM_HIT: the whole 6-room cutaway is a clean 3-column x 2-row grid
    // (matches the OVERVIEW_* anchor spacing above) — every room gets the
    // SAME generous region size so the entire room is clickable, not just
    // an ~88px dot at its center. Per direct report: with the resting
    // circle now invisible (see ListenTapScene), a student had nothing to
    // aim at and kept mis-clicking blank space.
    targets: (() => {
      const ROOM_HIT = { hitWidth: '30%', hitHeight: '36%' };
      return [
        { label: 'Living Room', ...OVERVIEW_LIVING_ROOM, ...ROOM_HIT, color: '#8B5A2B' },
        { label: 'Hallway', ...OVERVIEW_HALLWAY, ...ROOM_HIT, color: '#F4A340' },
        { label: 'Bathroom', ...OVERVIEW_BATHROOM, ...ROOM_HIT, color: '#2EC4B6' },
        { label: 'Bedroom', ...OVERVIEW_BEDROOM, ...ROOM_HIT, color: '#2EC4B6' },
        { label: 'Kitchen', ...OVERVIEW_KITCHEN, ...ROOM_HIT, color: '#C97A2F' },
        { label: 'Dining Room', ...OVERVIEW_DINING_ROOM, ...ROOM_HIT, color: '#C97A2F' },
      ];
    })(),
    // stickerWim/stickerCatcat (already generated for drag-sticker above)
    // reused here so a correct tap reveals the real character art instead
    // of the generic CAST-emoji fallback — "more clean, more presentable"
    // per direct request.
    rounds: [
      { prompt: 'Where is Wim? He is in the kitchen!', answerLabel: 'Kitchen', who: 'wim', stickerImg: stickerWim },
      { prompt: 'Where is Cat-cat? She is in the living room!', answerLabel: 'Living Room', who: 'catcat', stickerImg: stickerCatcat },
      { prompt: 'Where is Wim? He is in the bathroom!', answerLabel: 'Bathroom', who: 'wim', stickerImg: stickerWim },
      { prompt: 'Where is Cat-cat? She is in the bedroom!', answerLabel: 'Bedroom', who: 'catcat', stickerImg: stickerCatcat },
      { prompt: 'Where is Wim? He is in the dining room!', answerLabel: 'Dining Room', who: 'wim', stickerImg: stickerWim },
      { prompt: 'Where is Cat-cat? She is in the hallway!', answerLabel: 'Hallway', who: 'catcat', stickerImg: stickerCatcat },
    ],
  },

  {
    // Added on direct request (page 13, right after the "Where is Wim?"
    // listen-and-tap): the student's own reading check of the six rooms,
    // modelled on a competitor's auto-evaluation matching slide — pictures
    // with empty slots, room names in the middle, the student drags each
    // name under its room on their own (`studentOnly`), the teacher watches.
    // Closes the rooms block with the one skill it hadn't asked for yet:
    // recognising the WRITTEN word (the tour/listen-tap were all spoken).
    //
    // Pictures are crops of the exact two-room cutaways the words were
    // taught on (mc-vocab-rooms / -living-hall / -bath-dining), so each card
    // shows the same room the student already met under that name. Crop
    // boxes checked against the art: left room ≈ 5.5-52% x, right room ≈
    // 55.5-94.5% x, both ≈ 17-86% y of the 1376×768 images.
    id: 'mc-match-rooms', kind: 'picture-match',
    prompt: 'Match the rooms!',
    studentOnly: true,
    teacher: 'Self-check: the student drags each room name under its picture on their own — no help needed. Afterwards point to a picture and ask: "What room is this?"',
    items: [
      { word: 'kitchen', img: bgRooms, crop: ROOM_LEFT },
      { word: 'bathroom', img: bgCastleBathDining, crop: ROOM_LEFT },
      { word: 'hallway', img: bgCastleLivingHall, crop: ROOM_RIGHT },
      { word: 'bedroom', img: bgRooms, crop: ROOM_RIGHT },
      { word: 'living room', img: bgCastleLivingHall, crop: ROOM_LEFT },
      { word: 'dining room', img: bgCastleBathDining, crop: ROOM_RIGHT },
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
      { label: 'Table', color: '#8B5A2B', targetLeft: TABLE_SPOT.left, targetTop: TABLE_SPOT.top, ...TABLE_SIZE },
      { label: 'Chair', color: '#C97A2F', targetLeft: CHAIR_SPOT.left, targetTop: CHAIR_SPOT.top, ...CHAIR_SIZE },
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
      { who: 'catcat', img: `${S1}/story1-p1-main.png`, img2: `${S1}/story1-p1-accent.png`, text: 'Cat-cat loves to hide! Today she hides in the kitchen.' },
      { who: 'catcat', img: `${S1}/story1-p2-main.png`, img2: `${S1}/story1-p2-accent.png`, text: 'There is a cat... under the table!' },
      { who: 'wim', img: `${S1}/story1-p3-main.png`, img2: `${S1}/story1-p3-accent.png`, text: 'Wim looks everywhere. Is Cat-cat in his study?' },
      { who: 'catcat', img: bgCatcat, img2: `${S1}/story1-p4-accent.png`, text: 'There is a cat... on the windowsill!' },
      { who: 'wim', img: `${S1}/story1-p5-splash.png`, splash: true, text: 'Wim finds her at last! "There you are, Cat-cat!"' },
    ],
    checkpoints: [
      { afterPage: 2, who: 'pip', question: 'Where is Cat-cat hiding?', options: ['Under the table', 'On the bed', 'In the kitchen'], answer: 'Under the table' },
      { afterPage: 4, who: 'pip', question: 'Where does Wim find Cat-cat?', options: ['On the windowsill', 'Under the table', 'In the bedroom'], answer: 'On the windowsill' },
    ],
  },

  {
    // A dedicated Discovery/model step for under/on/in, sitting right
    // before mc-preposition-review — the review only ever tested the
    // prepositions, it never actually taught them first (per direct
    // follow-up: "it should be an introduction of the vocabulary").
    // Reuses VocabSpotScene's own tap-to-hear/reveal/dismiss flow (its
    // `img`-item variant, added alongside listen-tap's `img`-target one)
    // with the same three illustrations the review uses, so the student
    // meets each picture once, calmly, before being asked to listen and
    // pick between them. All three images are the SAME page-20 kitchen
    // background (table/chair/fireplace pot) with only Cat-cat's position
    // changing, rather than three unrelated locations (windowsill, a
    // standalone basket) — per direct follow-up ("keep the background
    // image from page 20... use just the cat").
    id: 'mc-preposition-intro', kind: 'vocab-spot', bg: bgKitchen,
    teacher: 'Let’s learn UNDER, ON, and IN! Tap each picture to hear the word.',
    items: [
      { label: 'Under', sentence: 'Cat-cat is under the table.', emoji: '\u{2B07}\u{FE0F}', left: '18%', top: '46%', color: '#8B5A2B', who: 'catcat', img: `${S1}/prep-under-table.png` },
      { label: 'On', sentence: 'Cat-cat is on the table.', emoji: '\u{1FA9F}', left: '50%', top: '46%', color: '#F4A340', who: 'catcat', img: `${S1}/prep-on-table.png` },
      { label: 'In', sentence: 'Cat-cat is in the pot.', emoji: '\u{1F9FA}', left: '82%', top: '46%', color: '#3B7FC9', who: 'catcat', img: `${S1}/prep-in.png` },
    ],
  },

  {
    // British Council/Oxford ELT's "Do As I Say" preposition game has
    // students act out in/on/under commands live — this engine has no
    // motion capture, so the honest adaptation is listen-and-locate
    // instead of listen-and-move. Originally this reused Table/Chair/Pot
    // as invisible hotspots on the kitchen photo, which tested room-
    // furniture vocabulary (already covered earlier in the lesson) rather
    // than the actual preposition — reviewed for clarity and redesigned
    // to directly test in/on/under: three always-visible illustrated
    // cards (see ListenTapScene's `img`-target variant), one per
    // preposition, matching mc-preposition-intro's own three pictures —
    // all three the SAME page-20 kitchen background with only Cat-cat's
    // position changing (under the table / on the table / in the fireplace
    // pot), per direct follow-up, rather than mismatched locations.
    id: 'mc-preposition-review', kind: 'listen-tap', bg: bgKitchen,
    teacher: 'Listen carefully, then tap the picture for UNDER, ON, or IN!',
    targets: [
      { label: 'Under', left: '18%', top: '58%', color: '#8B5A2B', img: `${S1}/prep-under-table.png` },
      { label: 'On', left: '50%', top: '58%', color: '#F4A340', img: `${S1}/prep-on-table.png` },
      { label: 'In', left: '82%', top: '58%', color: '#3B7FC9', img: `${S1}/prep-in.png` },
    ],
    rounds: [
      { prompt: 'Cat-cat is hiding under the table!', answerLabel: 'Under', who: 'catcat' },
      { prompt: 'Cat-cat is sitting on the table!', answerLabel: 'On', who: 'wim' },
      { prompt: 'Cat-cat is in the pot!', answerLabel: 'In', who: 'wim' },
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
    // assessment scenes. Dedicated manga-panel art per page (same pipeline
    // as mc-storybook — see story1-p*.png and project_manga_panel_layout_
    // implementation.md), not reused room backgrounds.
    id: 'mc-storybook-2', kind: 'flipbook', bg: bgWide, title: 'Chapter 2: The Missing Wand',
    pages: [
      { who: 'wim', img: `${S1}/story2-p1-main.png`, img2: `${S1}/story2-p1-accent.png`, text: 'Oh no! Wim can’t find his magic wand. "Where is it?" he asks.' },
      { who: 'pip', img: `${S1}/story2-p2-main.png`, img2: `${S1}/story2-p2-accent.png`, text: 'Pip looks in the great hall. "There is no wand here," says Pip.' },
      { who: 'catcat', img: `${S1}/story2-p3-main.png`, img2: `${S1}/story2-p3-accent.png`, text: 'Cat-cat looks by the window. "There is no wand here either!" says Cat-cat.' },
      { who: 'wim', img: `${S1}/story2-p4-main.png`, img2: `${S1}/story2-p4-accent.png`, text: 'They look in the kitchen. "There it is! There is a wand on the table!" says Wim.' },
      { who: 'wim', img: `${S1}/story2-p5-splash.png`, splash: true, text: '"Thank you, friends!" says Wim. Everyone is happy again.' },
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

  /* ---- Phonics segment: Wim's Sound Magic (CH /tʃ/) ------------------
   * End-of-lesson phonics block in the castle's wizard theme (per direct
   * request: phonics at the end, magic/wizard style, with a tongue twister
   * and reading). CH is chosen because it's already inside this lesson's
   * own words (CHair, kitCHen) — the sound is discovered in vocabulary the
   * student just learned rather than introduced cold — and a real recorded
   * /tʃ/ clip exists (public/lep1/audio/letters/phon-ch.ogg). Sequence is
   * the standard hear → blend/build → say fluently → read: sound-model,
   * word-build (CH as ONE tile, so the digraph is treated as one sound),
   * tongue-twister (fluency, three speeds), then a short decodable
   * flipbook whose text is written to match this unit's existing art. */
  {
    id: 'mc-ph-sound-ch', kind: 'sound-model', bg: bgWim, who: 'wim', magic: true,
    letter: 'CH', phoneme: '/tʃ/', sound: 'ch',
    teacher: 'Wim’s magic sound is CH! Say /ch/ /ch/ like a train: ch-ch-ch! Tap each magic box to find a CH word.',
    anchors: [
      { word: 'chair', emoji: '\u{1FA91}' },
      { word: 'kitchen', emoji: '\u{1F373}' },
      { word: 'cheese', emoji: '\u{1F9C0}' },
      { word: 'chick', emoji: '\u{1F424}' },
    ],
  },

  {
    id: 'mc-ph-build-ch', kind: 'word-build', bg: bgKitchen, magic: true,
    teacher: 'Cast the spell! Which magic sound finishes the word?',
    rounds: [
      { word: 'chip', tiles: ['ch', 'i', 'p'], blankIndex: 0, answer: 'ch', choices: ['ch', 'sh', 'c'], emoji: '\u{1F35F}' },
      { word: 'chick', tiles: ['ch', 'i', 'ck'], blankIndex: 0, answer: 'ch', choices: ['s', 'ch', 't'], emoji: '\u{1F424}' },
      { word: 'chest', tiles: ['ch', 'e', 's', 't'], blankIndex: 0, answer: 'ch', choices: ['ch', 'b', 'sh'], emoji: '\u{1F9F0}' },
      { word: 'lunch', tiles: ['l', 'u', 'n', 'ch'], blankIndex: 3, answer: 'ch', choices: ['sh', 'ch', 'k'], emoji: '\u{1F371}' },
    ],
  },

  {
    id: 'mc-ph-twister', kind: 'tongue-twister', bg: bgWim, who: 'wim', focus: 'ch',
    teacher: 'Listen to Wim’s magic tongue twister. Then say it slow, faster, and at magic speed!',
    line: 'Wim’s chick chews cheese chips on a chair.',
  },

  {
    // Decodable reading: every sentence uses this lesson's words + CH words
    // + "there is", and each page's text matches what its picture shows.
    id: 'mc-ph-reading', kind: 'flipbook', bg: bgWide, title: '✨ Read with Wim: Chip, Chop, Cheese!',
    pages: [
      { who: 'wim', img: bgWim, text: 'Wim is a wizard. His magic spell is "Chip, chop, cheese!"' },
      { who: 'wim', img: bgKitchen, text: 'Wim is in the kitchen. There is a chair. There is a pot on the fire.' },
      { who: 'catcat', img: bgCatcat, text: '"Is it lunch? Is it cheese?" asks Cat-cat.' },
      { who: 'wim', img: bgKitchen, text: 'Wim waves his wand. "Chip, chop, cheese!" Chips pop out of the pot!' },
      { who: 'pip', img: bgFriends, text: 'Wim, Cat-cat and Pip have lunch. Chomp, chomp! Cheers!' },
    ],
    checkpoints: [
      { afterPage: 2, who: 'wim', question: 'Where is Wim?', options: ['In the kitchen', 'In the bedroom', 'In the garden'], answer: 'In the kitchen' },
      { afterPage: 4, who: 'catcat', question: 'What is Wim’s magic spell?', options: ['Chip, chop, cheese!', 'Hocus pocus!', 'Hello, hello!'], answer: 'Chip, chop, cheese!' },
    ],
  },

  { id: 'mc-finale', kind: 'finale', bg: bgFriends, who: 'pip', line: 'You explored the castle and learned kitchen, bedroom, table, and chair — and the magic CH sound! Look around your home tonight and say "There is a ___!" ✨\u{1F3F0}' },
];

/* =============================================================================
 * Magic Castle — A1 Unit 9 Lesson 2: "Castle Furniture: Bed, Lamp, Door, Window"
 *
 * Scope from the curriculum_lessons blueprint for this lesson (row
 * 9f083b5c…): objective "name more furniture (bed, lamp, door, window) and
 * use 'There is a ___' for each"; story — Cat-cat leads Pip through the
 * bedroom, pointing out furniture one piece at a time; phonics /l/ (lamp)
 * and /w/ (window); review target = Lesson 1's rooms. No new grammar: L2
 * consolidates "There is a ___" (and L1's "There is no ___") on four new
 * nouns; prepositions (next to / behind) stay in Lesson 3 as planned.
 *
 * New art (scripts/art-targets.json, styled from bg-castle-bedroom-wim +
 * bg-castle-friends so Pip and Cat-cat keep their exact designs):
 * bg-castle-bedroom-tour.png (door / window / lamp / bed, each clearly
 * separate, Pip and Cat-cat painted in), bg-castle-bedroom-nolamp.png (the
 * same room with only the lamp removed — the "there is no lamp" evidence),
 * bg-castle-catcat-pip-door.png (the cinematic opener). Hotspots below are
 * measured on the 1376×768 tour art.
 *
 * Shape (25 scenes, ~30 min live): warm-up review of L1 → story hook →
 * teach 4 nouns in two pairs → written-word drag → model sentence →
 * production → listening check → find-the-difference (there is no) →
 * memory with L1 furniture → self-check picture match → roleplay →
 * spin-and-say → knock-knock doors → wizard phonics segment (L, W, word
 * spells, tongue twister, decodable reading) → finale. No kind runs more
 * than twice in a row (Hard Variety Rule).
 * ========================================================================= */

const bgBedroomTour = `${M}/scenes/bg-castle-bedroom-tour.png`;
const bgBedroomNoLamp = `${M}/scenes/bg-castle-bedroom-nolamp.png`;
const bgCatcatPipDoor = `${M}/scenes/bg-castle-catcat-pip-door.png`;
const bgTitleL2 = `${M}/scenes/bg-castle-title-l2.png`;

const DOOR_SPOT = { left: '17%', top: '42%' };
const WINDOW_SPOT = { left: '47%', top: '30%' };
const LAMP_SPOT = { left: '60%', top: '52%' };
const BED_SPOT = { left: '83%', top: '58%' };
const DOOR_SIZE = { targetWidth: '24%', targetHeight: '72%' };
const WINDOW_SIZE = { targetWidth: '15%', targetHeight: '48%' };
const LAMP_SIZE = { targetWidth: '9%', targetHeight: '18%' };
const BED_SIZE = { targetWidth: '32%', targetHeight: '62%' };

export const LESSON_A1U9L2_TITLE = 'Castle Furniture: Bed, Lamp, Door, Window';
export const LESSON_A1U9L2_OBJECTIVE =
  'Name four more things in a castle bedroom (bed, lamp, door, window) and say what is (and is not) in the room with "There is a ___" / "There is no ___." Phonics: the L /l/ and W /w/ sounds with word spells, a tongue twister and a short reading. (Reviews Lesson 1’s rooms and furniture; Lesson 3 adds where things are: in, on, under, next to, behind.)';

export const LESSON_A1U9L2_SCENES: Scene[] = [
  // Lesson 2 uses the calm cream-card look (look: 'card') on its title,
  // story opener and finale, on request; L1 keeps the classic hopping title.
  { id: 'mc2-title', kind: 'title-card', bg: bgTitleL2, level: 'A1', unit: 'Unit 9', lessonLabel: 'Lesson 2', title: 'Magic Castle: Castle Furniture', subtitle: 'Explore the bedroom with Cat-cat and Pip', cta: '\u{1F6CF}️ LET’S GO!', look: 'card' },

  {
    // Full warm-up review of Lesson 1 before anything new (per direct
    // request: "all of the rooms of the house — a full revision of the
    // first lesson"): the same six-room castle cutaway L1 taught on, one
    // round per room, each spoken with L1's own sentences (This is the ___ /
    // There is a ___ in the ___), so every room and both furniture words
    // come back before the bedroom tour starts.
    id: 'mc2-review-rooms', kind: 'listen-tap', bg: bgCastleOverview,
    teacher: 'Remember Wim’s castle? Listen and tap the right room!',
    targets: (() => {
      const ROOM_HIT = { hitWidth: '30%', hitHeight: '36%' };
      return [
        { label: 'Living Room', ...OVERVIEW_LIVING_ROOM, ...ROOM_HIT, color: '#8B5A2B' },
        { label: 'Hallway', ...OVERVIEW_HALLWAY, ...ROOM_HIT, color: '#F4A340' },
        { label: 'Bathroom', ...OVERVIEW_BATHROOM, ...ROOM_HIT, color: '#2EC4B6' },
        { label: 'Bedroom', ...OVERVIEW_BEDROOM, ...ROOM_HIT, color: '#2EC4B6' },
        { label: 'Kitchen', ...OVERVIEW_KITCHEN, ...ROOM_HIT, color: '#C97A2F' },
        { label: 'Dining Room', ...OVERVIEW_DINING_ROOM, ...ROOM_HIT, color: '#C97A2F' },
      ];
    })(),
    rounds: [
      { prompt: 'There is a table in the kitchen.', answerLabel: 'Kitchen', who: 'wim' },
      { prompt: 'This is the bedroom.', answerLabel: 'Bedroom', who: 'catcat' },
      { prompt: 'This is the living room.', answerLabel: 'Living Room', who: 'pip' },
      { prompt: 'This is the bathroom.', answerLabel: 'Bathroom', who: 'wim' },
      { prompt: 'There is a chair in the dining room.', answerLabel: 'Dining Room', who: 'catcat' },
      { prompt: 'This is the hallway.', answerLabel: 'Hallway', who: 'pip' },
    ],
  },

  {
    id: 'mc2-intro', kind: 'cinematic', bg: bgCatcatPipDoor, title: 'Cat-cat’s Secret Room', subtitle: 'Cat-cat has something to show Pip', narrator: 'catcat',
    script: [
      { who: 'catcat', line: 'Pip! Come here! This is my favourite room in the castle.' },
      { who: 'pip', line: 'A secret room? Open the door, Cat-cat!' },
    ],
    cta: '\u{1F6AA} OPEN THE DOOR!',
    look: 'card',
  },

  {
    id: 'mc2-vocab-bed-lamp', kind: 'vocab-spot', bg: bgBedroomTour,
    teacher: 'Welcome to the bedroom! Tap to learn two new things.',
    items: [
      { label: 'Bed', sentence: 'There is a bed.', emoji: '\u{1F6CF}️', ...BED_SPOT, color: '#C0392B', who: 'catcat' },
      { label: 'Lamp', sentence: 'There is a lamp.', emoji: '\u{1FA94}', ...LAMP_SPOT, color: '#F4A340', who: 'pip' },
    ],
  },
  {
    id: 'mc2-vocab-door-window', kind: 'vocab-spot', bg: bgBedroomTour,
    teacher: 'Two more! Tap the door and the window.',
    items: [
      { label: 'Door', sentence: 'There is a door.', emoji: '\u{1F6AA}', ...DOOR_SPOT, color: '#8B5A2B', who: 'pip' },
      { label: 'Window', sentence: 'There is a window.', emoji: '\u{1FA9F}', ...WINDOW_SPOT, color: '#4FA9E0', who: 'catcat' },
    ],
  },

  {
    id: 'mc2-drag-words', kind: 'drag-match', bg: bgBedroomTour,
    teacher: 'Listen, then drag each word onto the right thing in the bedroom!',
    items: [
      { label: 'Bed', color: '#C0392B', targetLeft: BED_SPOT.left, targetTop: BED_SPOT.top, ...BED_SIZE },
      { label: 'Lamp', color: '#F4A340', targetLeft: LAMP_SPOT.left, targetTop: LAMP_SPOT.top, ...LAMP_SIZE },
      { label: 'Door', color: '#8B5A2B', targetLeft: DOOR_SPOT.left, targetTop: DOOR_SPOT.top, ...DOOR_SIZE },
      { label: 'Window', color: '#4FA9E0', targetLeft: WINDOW_SPOT.left, targetTop: WINDOW_SPOT.top, ...WINDOW_SIZE },
    ],
  },

  {
    // Model before production: the full target sentence, once, in the
    // same colour chunks L1 used ("There is a" = one red chunk).
    id: 'mc2-model', kind: 'echo', bg: bgBedroomTour, who: 'catcat', textSide: 'top',
    teacher: 'Listen to Cat-cat, then say the whole sentence!',
    word: 'There is a lamp in the bedroom!',
    wordColors: ['#EF4444', '#EF4444', '#EF4444', '#F4A340', '#6B7280', '#6B7280', '#2EC4B6'],
  },

  {
    id: 'mc2-join-stage', kind: 'join-stage', bg: bgBedroomTour,
    teacher: 'Your turn! When it says YOU, look around the bedroom and say "There is a ___!"',
    cast: ['catcat', 'pip'],
    turns: [
      { who: 'catcat', line: 'There is a bed in the bedroom!' },
      { who: 'pip', line: 'There is a window in the bedroom!' },
      { who: 'student', line: 'Now YOU! Look and say: "There is a ___!"' },
    ],
  },

  {
    id: 'mc2-listen-tap', kind: 'listen-tap', bg: bgBedroomTour,
    teacher: 'Listen carefully, then tap what you hear!',
    targets: [
      { label: 'Door', ...DOOR_SPOT, color: '#8B5A2B', hitWidth: '24%', hitHeight: '70%' },
      { label: 'Window', ...WINDOW_SPOT, color: '#4FA9E0', hitWidth: '15%', hitHeight: '46%' },
      { label: 'Lamp', ...LAMP_SPOT, color: '#F4A340', hitWidth: '10%', hitHeight: '20%' },
      { label: 'Bed', ...BED_SPOT, color: '#C0392B', hitWidth: '30%', hitHeight: '60%' },
    ],
    rounds: [
      { prompt: 'There is a window.', answerLabel: 'Window', who: 'pip' },
      { prompt: 'There is a lamp.', answerLabel: 'Lamp', who: 'catcat' },
      { prompt: 'There is a door.', answerLabel: 'Door', who: 'pip' },
      { prompt: 'There is a bed.', answerLabel: 'Bed', who: 'catcat' },
    ],
  },

  {
    // Same Find-the-Differences adaptation as L1's mc-find-differences, now
    // on the bedroom: the lamp has really gone (bg-castle-bedroom-nolamp),
    // so "there is no lamp" has visual evidence.
    id: 'mc2-find-differences', kind: 'true-false', bg: bgBedroomNoLamp,
    teacher: 'Uh-oh! Something is missing from the bedroom! Is each sentence true or false?',
    rounds: [
      { who: 'catcat', statement: 'There is a lamp in the bedroom.', isTrue: false },
      { who: 'pip', statement: 'There is a window in the bedroom.', isTrue: true },
      { who: 'catcat', statement: 'There is no lamp in the bedroom.', isTrue: true },
      { who: 'pip', statement: 'There is no bed in the bedroom.', isTrue: false },
    ],
  },

  {
    // Cumulative with Lesson 1: the two kitchen words come back.
    id: 'mc2-memory', kind: 'memory', bg: bgRooms,
    teacher: 'Find the matching pairs! Say each word when you flip it.',
    pairs: [
      { id: 'bed', label: 'Bed', emoji: '\u{1F6CF}️' },
      { id: 'lamp', label: 'Lamp', emoji: '\u{1FA94}' },
      { id: 'door', label: 'Door', emoji: '\u{1F6AA}' },
      { id: 'window', label: 'Window', emoji: '\u{1FA9F}' },
      { id: 'table', label: 'Table', emoji: '\u{1FAB5}' },
      { id: 'chair', label: 'Chair', emoji: '\u{1FA91}' },
    ],
  },

  {
    // Written-word self-check, cropped from the very picture the words were
    // taught on (crop boxes measured on the 1376×768 tour art).
    id: 'mc2-match', kind: 'picture-match',
    prompt: 'Match the words!',
    studentOnly: true,
    teacher: 'Self-check: the student drags each word under its picture on their own. Afterwards point to a picture and ask: "What is this?"',
    items: [
      { word: 'door', img: bgBedroomTour, crop: { x: 4, y: 6, w: 28, h: 80 } },
      { word: 'window', img: bgBedroomTour, crop: { x: 38, y: 5, w: 18, h: 52 } },
      { word: 'lamp', img: bgBedroomTour, crop: { x: 54, y: 42, w: 13, h: 22 } },
      { word: 'bed', img: bgBedroomTour, crop: { x: 64, y: 8, w: 36, h: 80 } },
    ],
  },

  {
    id: 'mc2-roleplay', kind: 'roleplay', bg: bgBedroomTour,
    teacher: 'Story time! Listen to Cat-cat and Pip, then repeat each line.',
    cast: ['catcat', 'pip'],
    script: [
      { who: 'catcat', line: 'Welcome to my bedroom, Pip!', repeat: true },
      { who: 'pip', line: 'Wow! There is a big bed!', repeat: true },
      { who: 'catcat', line: 'There is a lamp, too.', repeat: true },
      { who: 'pip', line: 'And there is a window. I love this room!', repeat: true },
    ],
  },

  {
    id: 'mc2-spin', kind: 'spin-wheel', bg: bgBedroomTour,
    title: 'Spin and say!',
    teacher: 'Have the student spin the wheel, then say "There is a ___" for the thing with that number. If you prefer, tap a number instead of spinning.',
    items: [
      { label: 'There is a door.', ...DOOR_SPOT },
      { label: 'There is a window.', ...WINDOW_SPOT },
      { label: 'There is a lamp.', ...LAMP_SPOT },
      { label: 'There is a bed.', ...BED_SPOT },
    ],
  },

  {
    // Knock-knock doors fits a lesson about doors: each friend answers with
    // one of today's sentences.
    id: 'mc2-hello-doors', kind: 'hello-doors', bg: bgWide,
    teacher: 'Knock knock! Listen for the clue, then tap the right door!',
    cast: ['catcat', 'pip', 'wim'],
    rounds: [
      { target: 'catcat', prompt: 'Who says "There is a lamp"?', helloLine: 'I say there is a lamp!', echoLine: 'There is a lamp.' },
      { target: 'pip', prompt: 'Who says "There is a window"?', helloLine: 'I say there is a window!', echoLine: 'There is a window.' },
      { target: 'wim', prompt: 'Who says "There is a door"?', helloLine: 'I say there is a door!', echoLine: 'There is a door.' },
    ],
  },

  /* ---- Phonics segment: Wim's Sound Magic (L /l/, W /w/) ----------------
   * The blueprint's own phonics focus for this lesson: /l/ (lamp) and /w/
   * (window) — both inside today's words, so the sounds are discovered in
   * vocabulary the student just learned. Same wizard styling and sequence
   * as Lesson 1's CH segment: hear → trace → build → discriminate → say
   * fluently → read. Both letters are straight-line, so they trace cleanly
   * (TRACE_SEGMENTS gained L and W). */
  {
    id: 'mc2-ph-sound-l', kind: 'sound-model', bg: bgWim, who: 'wim', magic: true,
    letter: 'L', phoneme: '/l/', sound: 'lll',
    teacher: 'Wim’s first magic sound is L! Say /l/ /l/ with your tongue up. Tap each magic box to find an L word.',
    anchors: [
      { word: 'lamp', emoji: '\u{1FA94}' },
      { word: 'lion', emoji: '\u{1F981}' },
      { word: 'leaf', emoji: '\u{1F343}' },
      { word: 'lollipop', emoji: '\u{1F36D}' },
    ],
  },
  { id: 'mc2-ph-trace-l', kind: 'trace', bg: bgWim, who: 'wim', letter: 'L', phoneme: '/l/', word: 'lamp', teacher: 'Trace the letter L! Say /l/ /l/ /l/ as you draw.' },
  {
    id: 'mc2-ph-sound-w', kind: 'sound-model', bg: bgWim, who: 'wim', magic: true,
    letter: 'W', phoneme: '/w/', sound: 'www',
    teacher: 'Now the W sound! Make a little circle with your lips: /w/ /w/. Tap each box to find a W word.',
    anchors: [
      { word: 'window', emoji: '\u{1FA9F}' },
      { word: 'wand', emoji: '\u{1FA84}' },
      { word: 'wizard', emoji: '\u{1F9D9}' },
      { word: 'web', emoji: '\u{1F578}️' },
    ],
  },
  { id: 'mc2-ph-trace-w', kind: 'trace', bg: bgWim, who: 'wim', letter: 'W', phoneme: '/w/', word: 'window', teacher: 'Trace the letter W! Say /w/ /w/ /w/ as you draw.' },
  {
    id: 'mc2-ph-listen', kind: 'letter-game', bg: bgWim, who: 'wim', mode: 'sound',
    teacher: 'Listen to the sound. Is it L or W?',
    rounds: [
      { letter: 'L', phoneme: '/l/', choices: ['W', 'L', 'M'] },
      { letter: 'W', phoneme: '/w/', choices: ['L', 'W', 'T'] },
      { letter: 'L', phoneme: '/l/', choices: ['L', 'W', 'S'] },
      { letter: 'W', phoneme: '/w/', choices: ['W', 'A', 'L'] },
    ],
  },
  {
    id: 'mc2-ph-build', kind: 'word-build', bg: bgBedroomTour, magic: true,
    teacher: 'Cast the spell! Which magic sound starts the word?',
    rounds: [
      { word: 'lamp', tiles: ['l', 'a', 'm', 'p'], blankIndex: 0, answer: 'l', choices: ['w', 'l', 'b'], emoji: '\u{1FA94}' },
      { word: 'web', tiles: ['w', 'e', 'b'], blankIndex: 0, answer: 'w', choices: ['w', 'l', 'd'], emoji: '\u{1F578}️' },
      { word: 'leg', tiles: ['l', 'e', 'g'], blankIndex: 0, answer: 'l', choices: ['t', 'w', 'l'], emoji: '\u{1F9B5}' },
      { word: 'wig', tiles: ['w', 'i', 'g'], blankIndex: 0, answer: 'w', choices: ['l', 'p', 'w'], emoji: '\u{1F487}' },
    ],
  },
  {
    id: 'mc2-ph-twister', kind: 'tongue-twister', bg: bgWim, who: 'wim', focus: 'l|w',
    teacher: 'Listen to Wim’s magic tongue twister. Then say it slow, faster, and at magic speed!',
    line: 'Wim’s little lamp wobbles by the window.',
  },
  {
    // Decodable reading built from today's nouns, "there is / there is no"
    // and L/W words; each page's text matches its picture (the lamp really
    // vanishes on page 3 — bg-castle-bedroom-nolamp).
    id: 'mc2-ph-reading', kind: 'flipbook', bg: bgWide, title: '✨ Read with Wim: The Lost Lamp',
    pages: [
      { who: 'catcat', img: bgBedroomTour, text: 'Look, Pip! There is a little lamp in the bedroom.' },
      { who: 'pip', img: bgBedroomTour, text: 'There is a big window, and there is a wooden door.' },
      { who: 'catcat', img: bgBedroomNoLamp, text: 'Oh no! Where is the lamp? There is no lamp!' },
      { who: 'wim', img: bgWim, text: 'Wim waves his wand. "Wiggle, wobble, lamp come back!"' },
      { who: 'pip', img: bgBedroomTour, text: 'Look! The lamp is back. Well done, Wim!' },
    ],
    checkpoints: [
      { afterPage: 3, who: 'catcat', question: 'What is missing?', options: ['The lamp', 'The bed', 'The window'], answer: 'The lamp' },
      { afterPage: 5, who: 'pip', question: 'Who brings the lamp back?', options: ['Wim', 'Pip', 'Cat-cat'], answer: 'Wim' },
    ],
  },

  { id: 'mc2-finale', kind: 'finale', bg: bgFriends, who: 'pip', look: 'card', cast: ['pip', 'wim', 'catcat'], line: 'You explored the bedroom and learned bed, lamp, door and window — and the magic L and W sounds! Tonight, look around your room and say "There is a ___!" ✨\u{1F6CF}️' },
];
