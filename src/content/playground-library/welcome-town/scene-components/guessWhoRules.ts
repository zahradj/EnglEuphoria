/* Guess Who ★ (A1 U5L6) — the fixed lines the friend says (baked by scripts/generate-voice-cache.mjs). */
export const GW_ASK = 'Ask me about my monster! Tap a question and say it.';
export const GW_WHO = 'Who is it? Tap the monster and say: It’s …!';
export const GW_NOT = 'No, it isn’t! Ask me more.';
export const GW_HIDE = 'Now you! Choose a monster. I won’t look!';
export const GW_LOOK = 'Look at your monster again!';
export const gwGuess = (name: string) => `Is it ${name}?`;
export const gwRight = (name: string) => `Yes! It’s ${name}!`;
export const GW_GOT_IT = 'I found your monster! You answered so well!';

type Monster = { eyes: number; horns: number; mouth: number; wears: number[]; color: string };
type Test = { eyes?: number; horns?: number; mouth?: number; wear?: number; color?: string };
/** Does the monster fit the question? (every feature the question names must match) */
export const fitsMonster = (m: Monster, t: Test) =>
  (t.eyes === undefined || m.eyes === t.eyes) &&
  (t.horns === undefined || m.horns === t.horns) &&
  (t.mouth === undefined || m.mouth === t.mouth) &&
  (t.wear === undefined || m.wears.includes(t.wear)) &&
  (t.color === undefined || m.color === t.color);
