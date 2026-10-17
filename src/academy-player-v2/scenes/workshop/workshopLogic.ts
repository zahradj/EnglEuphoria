// Pure logic of the Chunk Workshop: which halves make a chunk, and how a gap sentence is split. No React here (unit-tested).
export interface WorkshopItem {
  /** the travel-kit item's tag (short): "tent" */
  kit: string;
  /** one line of context: what the traveller wants to do */
  goal: string;
  first: { options: string[]; correct: string };
  second: { options: string[]; correct: string };
  /** one calm sentence shown when a pair does not snap */
  explainWrong: string;
  /** a gap sentence that uses the chunk, inflected forms accepted (went camping, going sightseeing) */
  sentence: { stem: string; accepts: string[]; hint: string; sample: string };
}
export const chunkOf = (it: WorkshopItem): string => `${it.first.correct} ${it.second.correct}`;
export function halvesFit(it: WorkshopItem, a: string, b: string): { ok: boolean; firstOk: boolean; secondOk: boolean } {
  const firstOk = a === it.first.correct;
  const secondOk = b === it.second.correct;
  return { ok: firstOk && secondOk, firstOk, secondOk };
}
/** the text before and after the blank of a stem */
export function splitStem(stem: string): [string, string] {
  const k = stem.indexOf('___');
  return k < 0 ? [stem, ''] : [stem.slice(0, k), stem.slice(k + 3)];
}

/** the stem with the blank filled by `text` ("Last summer we went camping near a lake.") */
export const fillStem = (stem: string, text: string): string => stem.replace('___', text);
