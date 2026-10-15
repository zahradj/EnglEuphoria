/**
 * One look for the Playground games (owner, 2026-10-15: "improve the aesthetic of the games, the frames, the colors").
 *
 * Before this, every game picked its own flat primaries (orange cards, royal-blue boards, red/yellow/green/blue buttons)
 * and plain white boxes, so the games clashed with the painted scenes and with each other. Every game now draws from the
 * same small kit, matched to the storybook art (~35 % purple, teal, warm cream and wood, gold trim):
 *
 *  - `card`   cream "storybook card" with a warm lip underneath — tiles, picture cards, answer cards
 *  - `frame`  plum glass with a gold rim — boards, trays, tracks, game panels that hold other pieces
 *  - `panel`  light cream glass — sentences and questions to read
 *  - `pill`   the instruction / title chip (plum glass, cream text, gold edge)
 *  - JEWELS   four answer colours that sit well together (violet, teal, berry, amber), each with a darker lip
 *  - `cardBack` the face-down side of a card (violet with a soft star pattern)
 *
 * Tailwind only sees whole class strings, so every value below is written out in full (no string building).
 */

export const SKIN = {
  card: 'rounded-[2vh] border-[0.35vh] border-[#F3DDB3] bg-gradient-to-b from-[#FFFBF3] to-[#F7E8CF] shadow-[0_0.7vh_0_#D6AE78,0_1.6vh_2.6vh_rgba(46,16,101,0.28)]',
  cardHover: 'hover:-translate-y-[0.4vh] hover:shadow-[0_1.1vh_0_#D6AE78,0_2.2vh_3vh_rgba(46,16,101,0.32)] transition-transform',
  frame: 'rounded-[2.6vh] border-[0.45vh] border-[#F2C46D]/80 bg-gradient-to-b from-[#3B1E66]/90 to-[#22103F]/90 shadow-[inset_0_0.3vh_0_rgba(255,255,255,0.18),0_1.6vh_3.6vh_rgba(20,6,45,0.55)] backdrop-blur-md',
  panel: 'rounded-[2.2vh] border-[0.35vh] border-white/90 bg-[#FFFBF3]/95 shadow-[0_1.2vh_2.8vh_rgba(46,16,101,0.3)]',
  pill: 'rounded-full border-[0.3vh] border-[#F2C46D]/70 bg-[#2A1450]/85 font-black text-[#FFF4DC] shadow-[0_0.8vh_1.8vh_rgba(20,6,45,0.45)] backdrop-blur-sm',
  ink: 'text-[#3B1E66]',
  inkSoft: 'text-[#6B4E8C]',
  cardBack: 'border-[0.4vh] border-[#F2C46D] bg-gradient-to-br from-[#8B5CF6] via-[#6D28D9] to-[#4C1D95] shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.3),0_0.7vh_0_#3B1A78,0_1.6vh_2.6vh_rgba(30,10,60,0.35)]',
  /** Right / wrong states for any card or button. */
  right: 'border-[#86EFAC] bg-gradient-to-b from-[#4ADE80] to-[#16A34A] text-white shadow-[0_0.7vh_0_#166534,0_1.4vh_2.4vh_rgba(22,101,52,0.35)]',
  wrong: 'border-[#FDA4AF] bg-gradient-to-b from-[#FB7185] to-[#E11D48] text-white shadow-[0_0.7vh_0_#9F1239,0_1.4vh_2.4vh_rgba(159,18,57,0.35)]',
} as const;

/** Size of instruction text inside `SKIN.pill` (readable on a laptop and a phone). */
export const PILL_FONT = 'clamp(0.85rem, min(2.4vh, 1.6vw), 1.35rem)';

/** Answer colours, in order. Use `jewel(i)` so a game with 3-4 choices gets violet, teal, berry, amber. */
export const JEWELS = [
  'border-[0.35vh] border-[#C4B5FD] bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.35),0_0.7vh_0_#4C1D95,0_1.4vh_2.2vh_rgba(30,10,60,0.35)]',
  'border-[0.35vh] border-[#99F6E4] bg-gradient-to-b from-[#2DD4BF] to-[#0D9488] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.35),0_0.7vh_0_#115E59,0_1.4vh_2.2vh_rgba(17,94,89,0.35)]',
  'border-[0.35vh] border-[#FBCFE8] bg-gradient-to-b from-[#F472B6] to-[#DB2777] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.35),0_0.7vh_0_#9D174D,0_1.4vh_2.2vh_rgba(157,23,77,0.35)]',
  'border-[0.35vh] border-[#FDE68A] bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] text-[#3B1E66] shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.45),0_0.7vh_0_#B45309,0_1.4vh_2.2vh_rgba(180,83,9,0.35)]',
] as const;

export const jewel = (i: number) => JEWELS[((i % JEWELS.length) + JEWELS.length) % JEWELS.length];

/** Plain hex values of the same palette, for SVG fills, inline gradients and canvas drawing. */
export const PALETTE = {
  violet: '#7C3AED', violetDeep: '#4C1D95', teal: '#14B8A6', tealDeep: '#115E59',
  berry: '#EC4899', berryDeep: '#9D174D', amber: '#F59E0B', amberDeep: '#B45309',
  cream: '#FFFBF3', creamDeep: '#F7E8CF', gold: '#F2C46D', plum: '#2A1450', ink: '#3B1E66',
} as const;
