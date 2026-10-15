/**
 * One look for the Playground games (owner, 2026-10-15: "improve the aesthetic of the games, the frames, the colors";
 * then: "don't use the purple color a lot — use the branded colors, shades of the Playground").
 *
 * Every game draws from the Playground brand (src/index.css `.theme-playground`): bright orange #FE6A2F, sunshine
 * yellow #FEAF15 on warm cream #FEFBDD, sky blue #38BDF8, and the kids' jungle green. Purple stays in the painted
 * pictures only, never in the game chrome.
 *
 *  - `card`   warm cream "storybook card" with a sunny lip underneath — tiles, picture cards, answer cards
 *  - `frame`  sky-blue glass with a sunshine rim — boards, trays, tracks, game panels that hold other pieces
 *  - `panel`  light cream glass — sentences and questions to read
 *  - `pill`   the instruction / title chip (Playground orange, white text)
 *  - JEWELS   four answer colours from the brand (orange, sky, green, sunshine), each with a darker lip
 *  - `cardBack` the face-down side of a card (sunny orange with a soft dot pattern)
 *
 * Tailwind only sees whole class strings, so every value below is written out in full (no string building).
 */

export const SKIN = {
  card: 'rounded-[2vh] border-[0.35vh] border-[#FDE3B0] bg-gradient-to-b from-[#FFFFFF] to-[#FEF6DA] shadow-[0_0.7vh_0_#F3C474,0_1.6vh_2.6vh_rgba(60,30,10,0.25)]',
  cardHover: 'hover:-translate-y-[0.4vh] hover:shadow-[0_1.1vh_0_#F3C474,0_2.2vh_3vh_rgba(60,30,10,0.3)] transition-transform',
  frame: 'rounded-[2.6vh] border-[0.45vh] border-[#FEAF15] bg-gradient-to-b from-[#38BDF8]/85 to-[#0284C7]/90 shadow-[inset_0_0.3vh_0_rgba(255,255,255,0.35),0_1.6vh_3.6vh_rgba(12,40,70,0.45)] backdrop-blur-md',
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

/** Answer colours, in order. Use `jewel(i)` so a game with 3-4 choices gets orange, sky, green, sunshine. */
export const JEWELS = [
  'border-[0.35vh] border-[#FFD0B5] bg-gradient-to-b from-[#FF8A4C] to-[#FE6A2F] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.4),0_0.7vh_0_#C2410C,0_1.4vh_2.2vh_rgba(150,50,10,0.3)]',
  'border-[0.35vh] border-[#BAE6FD] bg-gradient-to-b from-[#38BDF8] to-[#0EA5E9] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.4),0_0.7vh_0_#0369A1,0_1.4vh_2.2vh_rgba(3,105,161,0.3)]',
  'border-[0.35vh] border-[#BBF7D0] bg-gradient-to-b from-[#4ADE80] to-[#22C55E] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.4),0_0.7vh_0_#15803D,0_1.4vh_2.2vh_rgba(21,128,61,0.3)]',
  'border-[0.35vh] border-[#FEF08A] bg-gradient-to-b from-[#FFD24A] to-[#FEAF15] text-[#2A1A05] shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.5),0_0.7vh_0_#B45309,0_1.4vh_2.2vh_rgba(180,83,9,0.3)]',
] as const;

export const jewel = (i: number) => JEWELS[((i % JEWELS.length) + JEWELS.length) % JEWELS.length];

/** Plain hex values of the same palette, for SVG fills, inline gradients and canvas drawing. */
export const PALETTE = {
  orange: '#FE6A2F', orangeDeep: '#C2410C', sky: '#38BDF8', skyDeep: '#0369A1',
  green: '#22C55E', greenDeep: '#15803D', sun: '#FEAF15', sunDeep: '#B45309',
  cream: '#FEFBDD', creamDeep: '#FEF6DA', white: '#FFFFFF', ink: '#2A1A05',
} as const;
