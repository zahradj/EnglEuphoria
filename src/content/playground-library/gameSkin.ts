/**
 * One look for the Playground games (owner, 2026-10-15: "improve the aesthetic of the games, the frames, the colors";
 * then: "don't use the purple color a lot — use the branded colors, shades of the Playground").
 *
 * Every game draws ONLY from the Playground brand — yellow and orange shades (owner, 2026-10-17: "for the playground,
 * don't use the Academy nor the Success branded colors; use only the playground branded colors, which is yellow shades
 * and orange shades"): bright orange #FE6A2F, tangerine #FB923C, sunshine yellow #FEAF15, golden amber #F59E0B, honey
 * #FDE68A on warm cream #FEFBDD. No purple, no blue/teal, no Success colours in the game chrome. Only the right / wrong
 * feedback keeps its green / red, so a child reads it at a glance.
 * The pictures use the same shades too (owner, 2026-10-15: "use the branded color shades in the generated images as
 * well"): every Playground picture prompt ends with `PICTURE_COLOUR_LINE`.
 *
 *  - `card`   warm cream "storybook card" with a sunny lip underneath — tiles, picture cards, answer cards
 *  - `frame`  sunshine-to-orange glass with a cream rim — boards, trays, tracks, game panels that hold other pieces
 *  - `panel`  light cream glass — sentences and questions to read
 *  - `pill`   the instruction / title chip (Playground orange, white text)
 *  - JEWELS   four answer colours from the brand (orange, golden amber, sunshine, tangerine), each with a darker lip
 *  - `cardBack` the face-down side of a card (sunny orange with a soft dot pattern)
 *
 * Tailwind only sees whole class strings, so every value below is written out in full (no string building).
 */

export const SKIN = {
  card: 'rounded-[2vh] border-[0.35vh] border-[#FDE3B0] bg-gradient-to-b from-[#FFFFFF] to-[#FEF6DA] shadow-[0_0.7vh_0_#F3C474,0_1.6vh_2.6vh_rgba(60,30,10,0.25)]',
  cardHover: 'hover:-translate-y-[0.4vh] hover:shadow-[0_1.1vh_0_#F3C474,0_2.2vh_3vh_rgba(60,30,10,0.3)] transition-transform',
  frame: 'rounded-[2.6vh] border-[0.45vh] border-[#FEFBDD] bg-gradient-to-b from-[#FEAF15]/90 to-[#FE6A2F]/90 shadow-[inset_0_0.3vh_0_rgba(255,255,255,0.4),0_1.6vh_3.6vh_rgba(150,50,10,0.4)] backdrop-blur-md',
  panel: 'rounded-[2.2vh] border-[0.35vh] border-[#FDE3B0] bg-[#FEFBDD]/95 shadow-[0_1.2vh_2.8vh_rgba(60,30,10,0.28)]',
  pill: 'rounded-full border-[0.3vh] border-white/80 bg-[#FE6A2F]/95 font-black text-white shadow-[0_0.8vh_1.8vh_rgba(150,50,10,0.35)]',
  ink: 'text-[#2A1A05]',
  inkSoft: 'text-[#7A5A2E]',
  cardBack: 'border-[0.4vh] border-white bg-gradient-to-br from-[#FFC24A] via-[#FE8A3D] to-[#FE6A2F] shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.45),0_0.7vh_0_#C2410C,0_1.6vh_2.6vh_rgba(150,50,10,0.3)]',
  /** Right / wrong states for any card or button. */
  right: 'border-[#86EFAC] bg-gradient-to-b from-[#4ADE80] to-[#16A34A] text-white shadow-[0_0.7vh_0_#166534,0_1.4vh_2.4vh_rgba(22,101,52,0.35)]',
  wrong: 'border-[#FDA4AF] bg-gradient-to-b from-[#FB7185] to-[#E11D48] text-white shadow-[0_0.7vh_0_#9F1239,0_1.4vh_2.4vh_rgba(159,18,57,0.35)]',
} as const;

/** Size of instruction text inside `SKIN.pill` (readable on a laptop and a phone). */
export const PILL_FONT = 'clamp(0.85rem, min(2.4vh, 1.6vw), 1.35rem)';

/** Answer colours, in order. Use `jewel(i)` so a game with 3-4 choices gets orange, golden amber, sunshine, tangerine. */
export const JEWELS = [
  'border-[0.35vh] border-[#FFD0B5] bg-gradient-to-b from-[#FF8A4C] to-[#FE6A2F] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.4),0_0.7vh_0_#C2410C,0_1.4vh_2.2vh_rgba(150,50,10,0.3)]',
  'border-[0.35vh] border-[#FDE68A] bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.4),0_0.7vh_0_#92400E,0_1.4vh_2.2vh_rgba(146,64,14,0.3)]',
  'border-[0.35vh] border-[#FEF08A] bg-gradient-to-b from-[#FFD24A] to-[#FEAF15] text-[#2A1A05] shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.5),0_0.7vh_0_#B45309,0_1.4vh_2.2vh_rgba(180,83,9,0.3)]',
  'border-[0.35vh] border-[#FFEDD5] bg-gradient-to-b from-[#FDBA74] to-[#FB923C] text-[#2A1A05] shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.5),0_0.7vh_0_#C2410C,0_1.4vh_2.2vh_rgba(194,65,12,0.3)]',
] as const;

export const jewel = (i: number) => JEWELS[((i % JEWELS.length) + JEWELS.length) % JEWELS.length];

/** Plain hex values of the same palette, for SVG fills, inline gradients and canvas drawing. */
export const PALETTE = {
  orange: '#FE6A2F', orangeDeep: '#C2410C', tangerine: '#FB923C', amber: '#F59E0B', amberDeep: '#92400E',
  honey: '#FDE68A', sun: '#FEAF15', sunDeep: '#B45309',
  cream: '#FEFBDD', creamDeep: '#FEF6DA', white: '#FFFFFF', ink: '#2A1A05',
} as const;

/**
 * Colour line for every generated Playground picture (Canva, Gemini). Owner, 2026-10-15: "Use the branded color shades
 * in the generated images as well"; 2026-10-17: "use only the playground branded colors, which is yellow shades and
 * orange shades." Replaces the "~35 % purple" line for the Playground; the Academy keeps its own
 * art bible. `scripts/generate-art.mjs` adds it to any Playground target that lacks it (pictureColour.test.ts).
 */
export const PICTURE_COLOUR_LINE =
  'Colour palette: ONLY the EnglEuphoria Playground brand shades, yellow and orange - bright orange (#FE6A2F), tangerine (#FB923C), sunshine yellow (#FEAF15), golden amber (#F59E0B), honey yellow (#FDE68A) and warm cream (#FEFBDD), with natural wood and skin tones; sky, water and plants only as soft, muted natural colours; no purple, no other brand colours.';
