import type { ColorId, ShapeId } from './colorShapes';

/**
 * The words the colour game speaks. One module so the scene, the voice-baking script and the tests all use the very same
 * sentences (every line must exist as a recorded clip; see scripts/generate-voice-cache.mjs).
 */
export type ColorPlayMode = 'pick' | 'paint' | 'mix' | 'hunt';

export interface ColorPlayRound {
  /** pick / paint / mix: the paint pots offered (2-4). */
  options?: ColorId[];
  /** pick / paint / mix: the right pot. */
  answer?: ColorId;
  /** paint: the outline to paint. */
  shape?: ShapeId;
  /** mix: the two colours that are mixed (the answer is what they make). */
  mix?: [ColorId, ColorId];
  /** hunt: the shapes to choose among (2-4), each with its colour. */
  items?: { shape: ShapeId; color: ColorId }[];
  /** hunt: index (into items) of the right shape. */
  target?: number;
}

/** What is said when the round appears. */
export function askLine(mode: ColorPlayMode, r: ColorPlayRound): string {
  if (mode === 'pick') return r.answer ?? '';
  if (mode === 'paint') return `Paint the ${r.shape} ${r.answer}.`;
  if (mode === 'mix') return r.mix ? `What do ${r.mix[0]} and ${r.mix[1]} make?` : '';
  const t = r.items?.[r.target ?? 0];
  return t ? `Find the ${t.color} ${t.shape}.` : '';
}

/** What is said when the round is solved. */
export function solvedLine(mode: ColorPlayMode, r: ColorPlayRound): string {
  if (mode === 'pick') return `This is ${r.answer}.`;
  if (mode === 'paint') return `The ${r.shape} is ${r.answer}.`;
  if (mode === 'mix') return r.mix ? `${r.mix[0]} and ${r.mix[1]} make ${r.answer}.` : '';
  const t = r.items?.[r.target ?? 0];
  return t ? `The ${t.shape} is ${t.color}.` : '';
}

/** Every distinct line a scene can speak (for baking and tests). */
export function colorPlayLines(mode: ColorPlayMode, rounds: ColorPlayRound[], intro: ColorId[] = []): string[] {
  const out = new Set<string>(intro);
  for (const r of rounds) {
    const a = askLine(mode, r);
    const s = solvedLine(mode, r);
    if (a) out.add(a);
    if (s) out.add(s);
  }
  return [...out];
}
