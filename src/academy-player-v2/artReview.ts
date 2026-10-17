// Art review register (owner rule 2026-10-17, like the Playground: "make sure all generated images are compatible with the content, every limb well generated, nothing strange or bizarre").
// Every picture a registered lesson shows must be listed here after a LOOKED-AT review (zoom on hands, faces, feet, held objects; compare cast across plates).
// artReview.test.ts (deploy gate) fails for a lesson that uses an unreviewed picture or one marked 'redo'. Never edit an entry without looking at the picture again.
export interface ArtReview {
  /** what the picture shows and which lesson content it serves */
  content: string;
  /** 'ok': every limb, hand, face and held object is well formed, nothing odd; 'redo': must be regenerated before any lesson uses it */
  anatomy: 'ok' | 'redo';
  /** characters look like their vault references (face, hair, skin, clothes) */
  cast: 'consistent' | 'inconsistent' | 'none';
  reviewedOn: string;
  note?: string;
}

const D = '2026-10-17';
export const ART_REVIEW: Record<string, ArtReview> = {
  'bg/bucket-list-wall': { content: 'bright classroom with a cork board of blank cards: the bucket list', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/classroom-morning': { content: 'sunny classroom, desks and whiteboard: Remember? warm-up', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/library-case-room': { content: 'daytime library/case room with a long table: rule, build and mission', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/detective-wall': { content: 'club room with a cork evidence board: Grammar Detective sort', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/trophy-case': { content: 'empty trophy cabinet in a bright corridor: the six verb trophies', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/trophy-reveal': { content: 'the cabinet with six lit trophies: the Wrap reward', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/story-b1s1-1': { content: 'Vee holds up a card, Ava listens at a desk: the dare begins', anatomy: 'ok', cast: 'consistent', reviewedOn: D, note: 'hands, card, legs and shoes checked at full size' },
  'bg/story-b1s1-2': { content: 'Ava shows a holiday photo on her phone to Theo: last summer in Spain', anatomy: 'ok', cast: 'consistent', reviewedOn: D, note: 'phone hand has a thumb and four fingers; Theo’s crossed hands fine' },
  'bg/story-b1s1-3': { content: 'Vee points at the viewer with the dare card, Ava and Theo beside him', anatomy: 'ok', cast: 'consistent', reviewedOn: D, note: 'pointing hand foreshortened but well formed; Ava’s crossed arms and Theo’s pockets fine' },
  'bg/story-b1s1-4': { content: 'Vee holds the dare card out to the viewer, Ava and Theo behind', anatomy: 'redo', cast: 'inconsistent', reviewedOn: D, note: 'limbs are fine, but Theo is a different person here (lighter skin, wavy hair, white tee) than in plates 2 and 3. Regenerate from the Theo reference (Canva, one picture, owner sees it first) before using it.' },
  'bg/case-board': { content: 'cork evidence board with blank note cards and red string: the Detective Board sorts', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/story-b1s3-1': { content: 'Vee points at the club case board where the Lisbon postcard was pinned', anatomy: 'ok', cast: 'consistent', reviewedOn: D, note: 'pointing hand and the other hand checked at zoom; both fine' },
  'bg/story-b1s3-2': { content: 'Theo at a library table with an open book and a globe, making a peace sign (he says how often he has been to Rome)', anatomy: 'ok', cast: 'consistent', reviewedOn: D, note: 'regenerated in Canva from the Theo reference (owner approved 2026-10-17); peace-sign hand has two raised and two curled fingers plus thumb, the other hand rests on the book; checked at full size' },
  'bg/story-b1s3-3': { content: 'Vee thinking by the case board while Theo waves beside a table', anatomy: 'redo', cast: 'inconsistent', reviewedOn: D, note: 'same Theo problem as story-b1s3-2' },
  'bg/story-b1s2-1': { content: 'Vee pins a postcard on the Travel Club postcard wall', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
  'bg/story-b1s2-2': { content: 'Ava and Theo each hold up a postcard', anatomy: 'redo', cast: 'inconsistent', reviewedOn: D, note: 'hands and postcards are fine, but Theo is the lighter wavy-haired version with a white tee; regenerate from the Theo reference.' },
  'bg/story-b1s2-3': { content: 'Vee stands by the wall while Mia looks at a postcard beside a rolled sleeping bag', anatomy: 'ok', cast: 'consistent', reviewedOn: D, note: 'Mia’s hand on the postcard and Vee’s pocketed hand are fine' },
  'bg/travel-club-room': { content: 'bright club room with a big world map, window seat and a long table', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/postcard-wall': { content: 'wall of postcards under a shelf of plants, world map: the Travel Club', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/postcard-table': { content: 'table with postcards laid out, a globe and a notebook', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'bg/locker-hall': { content: 'bright corridor with lilac and blue lockers and bunting: the Release pages', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/sc-bg-1': { content: 'student back at his desk reading a library book (been)', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'hands holding the book fine; the boy is not named in the lesson text' },
  'cards/sc-bg-2': { content: 'an empty desk and chair (gone)', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/sc-bg-3': { content: 'a student pointing at a globe (been to Paris)', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'a globe, not a map; fine for “been to”' },
  'cards/sc-bg-4': { content: 'an empty chair and a coat on a hook (gone to the canteen)', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/sc-bg-5': { content: 'a class photo at the sea (been to the sea)', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'faces are small; no extra limbs' },
  'cards/sc-bg-6': { content: 'a closed library door with a blank sign (gone home)', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-excitement': { content: 'a smiling student with a packed suitcase by the door', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-amazed': { content: 'a wide-eyed student looking up with open hands', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-disappointed': { content: 'a sad student at a closed museum door', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-embarrassed': { content: 'a red-faced student who dropped a tray', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-proud': { content: 'a student with raised arms on a hilltop', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'the hill sticker has a flat bottom edge' },
  'cards/w-frightened': { content: 'a scared student gripping a high railing', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'the knee passes the rail: reads as gripping and climbing, acceptable' },
  'cards/w-relaxed': { content: 'a student lying on grass with a book', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-grateful': { content: 'a student giving a gift to a thankful friend', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-destination': { content: 'a signpost pointing to a village', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-attraction': { content: 'a famous leaning tower with visitors', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-countryside': { content: 'green fields, a red barn and hills', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-camping': { content: 'a tent, campfire and lake at sunset', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-sightseeing': { content: 'three students with a map in front of a monument', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/w-trynew': { content: 'a student with a paintbrush beside a blank canvas', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'has a white sticker outline unlike the others (style detail, not an error)' },
  'cards/b-bucketlist': { content: 'a list with tick boxes and a gold star pinned on a cork board: bucket list', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/b-dare': { content: 'a student holds out a blank card to the viewer: a dare', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'hand and card checked: thumb and fingers well formed' },
  'cards/b-giveitago': { content: 'a student reaching up a climbing wall: give it a go', anatomy: 'ok', cast: 'none', reviewedOn: D, note: 'raised hand has five fingers; the other arm is behind her' },
  'cards/b-lifetime': { content: 'a golden ticket above a globe: once in a lifetime', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/b-tick': { content: 'a pencil ticking a box with a green tick: tick it off', anatomy: 'ok', cast: 'none', reviewedOn: D },
  'cards/b-brave': { content: 'a student in a varsity jacket standing with hands in pockets, meant to show brave', anatomy: 'redo', cast: 'none', reviewedOn: D, note: 'content does not fit: nothing in the picture shows bravery (no scary thing, no brave act). Regenerate, e.g. a student stepping up to speak on a stage or at the edge of a high board.' },
  'cast/vee/happy': { content: 'Vee portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
  'cast/ava/happy': { content: 'Ava portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
  'cast/theo/happy': { content: 'Theo portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
  'cast/mia/happy': { content: 'Mia portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
};
