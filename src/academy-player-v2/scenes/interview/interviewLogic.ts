// Pure logic of the Interview game (information gap): what a question is, what a persona answers, who is still in the lineup. No React here.
import type { CastName } from '../../types';
import { listJoin } from '../wave1Kit';

export interface InterviewTile {
  id: string;
  /** the rest of the question after the participle: "spicy noodles", "in a plane" */
  object: string;
  verb: { base: string; past?: string; participle: string; distractors: [string, string] };
  /** optional sticker picture under public/academy-art, as 'cards/<id>' */
  art?: string;
}
export interface Fact { done: boolean; /** the recorded answer for a yes (default "Yes, I have.") */ yes?: string; /** the recorded answer for a no (default "No, I haven’t.") */ no?: string }
export interface Persona {
  id: string;
  name: string;
  /** friends look: the cast member whose portrait and recorded voice this person has. Lineup look: omitted (the suspects are name cards). */
  cast?: CastName;
  tag?: string;
  facts: Record<string, Fact>;
}

export const YES = 'Yes, I have.';
export const NO = 'No, I haven’t.';

export const questionOf = (tile: InterviewTile, participle: string = tile.verb.participle) => `Have you ever ${participle} ${tile.object}?`;
export const replyOf = (p: Persona, tileId: string): { done: boolean; text: string } => {
  const f = p.facts[tileId];
  const done = !!f?.done;
  return { done, text: done ? f?.yes ?? YES : f?.no ?? NO };
};
export const yesCount = (p: Persona, tiles: InterviewTile[]) => tiles.filter((t) => p.facts[t.id]?.done).length;

/** the persona with strictly the most yes answers, or null for a tie */
export function winnerOf(personas: Persona[], tiles: InterviewTile[]): string | null {
  const counts = personas.map((p) => ({ id: p.id, n: yesCount(p, tiles) })).sort((a, b) => b.n - a.n);
  return counts.length && (counts.length === 1 || counts[0].n > counts[1].n) ? counts[0].id : null;
}

/** the suspects whose files agree with every answer so far */
export const remaining = (personas: Persona[], asked: { tileId: string; done: boolean }[]) =>
  personas.filter((p) => asked.every((a) => !!p.facts[a.tileId]?.done === a.done));

/** asking every tile leaves only the target (the lineup can always be solved) */
export function identifies(personas: Persona[], tiles: InterviewTile[], targetId: string): boolean {
  const target = personas.find((p) => p.id === targetId);
  if (!target) return false;
  const left = remaining(personas, tiles.map((t) => ({ tileId: t.id, done: !!target.facts[t.id]?.done })));
  return left.length === 1 && left[0].id === targetId;
}

/** "flown across the world, eaten spicy noodles and taken a photo in a cave" (all the yes facts of a persona) */
export const factsOf = (p: Persona, tiles: InterviewTile[]) => listJoin(tiles.filter((t) => p.facts[t.id]?.done).map((t) => `${t.verb.participle} ${t.object}`));

/** the three participle buttons of a tile, in a stable shuffled order */
export const participleChoices = (tile: InterviewTile, shuffle: <T>(a: readonly T[], seed: number) => T[], seed: number) =>
  shuffle([tile.verb.participle, ...tile.verb.distractors], seed);
