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
  'cast/vee/happy': { content: 'Vee portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
  'cast/ava/happy': { content: 'Ava portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
  'cast/theo/happy': { content: 'Theo portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
  'cast/mia/happy': { content: 'Mia portrait (lobby crew)', anatomy: 'ok', cast: 'consistent', reviewedOn: D },
};
