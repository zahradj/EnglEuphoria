// Pure logic of the Postcard Finder (borrows Codenames' one-clue-many-targets, referential communication and Taboo's banned words). No React here (unit-tested).
// A card is a bundle of "tags" (place, feeling, chunk, details). A clue is a set of tags; a card FITS a clue when it has every tag of it.
// Find rounds: the partner's clue comes in steps (vague first) and the meter shows how many cards still fit. Build rounds: the student picks chips that are true of the secret card.
export type FinderTone = 'sea' | 'city' | 'field' | 'tower' | 'camp' | 'hill';
export interface FinderCard {
  id: string;
  place: string;
  feeling: string;
  chunk?: string;
  /** small things on the postcard (tent, lake, tower...): they make lookalike cards differ */
  details: string[];
  /** words the student may not use when this card is the secret card (the Taboo round) */
  forbidden?: string[];
  tone: FinderTone;
}
export interface FinderChip {
  id: string;
  /** what the student sees and says */
  text: string;
  group: 'feeling' | 'place' | 'chunk' | 'detail';
  /** the card tag this chip stands for */
  tag: string;
  /** a word or chunk from this lesson (counts for the "new words" counter) */
  isNew?: boolean;
}
export interface FinderClue { text: string; tags: string[] }
export interface FinderGrid {
  id: string;
  /** find: the partner gives the clue, the student taps the card; build: the student builds a clue, the partner picks */
  mode: 'find' | 'build';
  cards: FinderCard[];
  targetId: string;
  /** the lookalike the partner picks first when a clue is too vague */
  trapId: string;
  /** find: the clue in steps, vague to exact */
  clues?: FinderClue[];
  /** build: the clue, the new words needed, the chips and which of them are true of the secret card */
  clueText?: string;
  minNewWords?: number;
  chips?: FinderChip[];
  acceptedChips?: string[];
}

const low = (s: string) => s.trim().toLowerCase();
export const tagsOf = (c: FinderCard): string[] => [c.place, c.feeling, ...(c.chunk ? [c.chunk] : []), ...c.details].map(low);
export const fits = (c: FinderCard, tags: string[]): boolean => { const have = tagsOf(c); return tags.every((t) => have.includes(low(t))); };
export const fitIds = (cards: FinderCard[], tags: string[]): string[] => cards.filter((c) => fits(c, tags)).map((c) => c.id);
export const cardOf = (g: FinderGrid, id: string): FinderCard => g.cards.find((c) => c.id === id) ?? g.cards[0];

/** tags heard after `step` clues (0 = the first clue only) */
export const clueTags = (g: FinderGrid, step: number): string[] => (g.clues ?? []).slice(0, step + 1).flatMap((c) => c.tags);

/** the tags of the chosen chips */
export const chipTags = (g: FinderGrid, chosen: string[]): string[] => (g.chips ?? []).filter((c) => chosen.includes(c.id)).map((c) => c.tag);
export const newWords = (g: FinderGrid, chosen: string[]): number => (g.chips ?? []).filter((c) => chosen.includes(c.id) && c.isNew).length;
/** chips the student may not use in this round (the Taboo list) */
export const bannedChips = (g: FinderGrid): string[] => {
  const ban = (cardOf(g, g.targetId).forbidden ?? []).map(low);
  return (g.chips ?? []).filter((c) => ban.includes(low(c.tag)) || ban.includes(low(c.text))).map((c) => c.id);
};
export const canSend = (g: FinderGrid, chosen: string[]): boolean => chosen.length > 0 && newWords(g, chosen) >= (g.minNewWords ?? 0);

/** the partner's pick for a clue: the only card that fits, or (too vague) the designated lookalike, or the first lookalike */
export function partnerPick(g: FinderGrid, tags: string[]): { id: string | null; ambiguous: boolean } {
  const ids = fitIds(g.cards, tags);
  if (!ids.length) return { id: null, ambiguous: false };
  if (ids.length === 1) return { id: ids[0], ambiguous: false };
  const pick = ids.includes(g.trapId) ? g.trapId : ids.find((id) => id !== g.targetId) ?? ids[0];
  return { id: pick, ambiguous: pick !== g.targetId || ids.length > 1 };
}

/** what makes the picked lookalike different from the secret card: a detail, else the feeling, else the place, else the chunk */
export function diffOf(picked: FinderCard, target: FinderCard): { kind: 'detail' | 'feeling' | 'place' | 'chunk'; value: string } {
  const d = picked.details.find((x) => !target.details.map(low).includes(low(x)));
  if (d) return { kind: 'detail', value: d };
  if (low(picked.feeling) !== low(target.feeling)) return { kind: 'feeling', value: picked.feeling };
  if (low(picked.place) !== low(target.place)) return { kind: 'place', value: picked.place };
  return { kind: 'chunk', value: picked.chunk ?? '' };
}

/** chips that would separate the secret card from the lookalike (they glow after a too-vague clue) */
export const separatingChips = (g: FinderGrid, pickedId: string): string[] => {
  const pickTags = tagsOf(cardOf(g, pickedId));
  return (g.acceptedChips ?? []).filter((id) => { const c = g.chips?.find((x) => x.id === id); return !!c && !pickTags.includes(low(c.tag)); });
};

/** the first clue tag a card does not have (for "That postcard does not have ...") */
export const missingTag = (c: FinderCard, tags: string[]): string | undefined => tags.find((t) => !tagsOf(c).includes(low(t)));

/** is the grid playable: the data is consistent and the round can be won */
export function checkGrid(g: FinderGrid): string[] {
  const p: string[] = [];
  const ids = g.cards.map((c) => c.id);
  if (g.cards.length !== 6) p.push(`${g.id}: a grid has exactly 6 postcards`);
  if (new Set(ids).size !== ids.length) p.push(`${g.id}: duplicate card ids`);
  if (!ids.includes(g.targetId)) p.push(`${g.id}: the target is not on the grid`);
  if (!ids.includes(g.trapId) || g.trapId === g.targetId) p.push(`${g.id}: the trap must be another card on the grid`);
  if (p.length) return p;
  const target = cardOf(g, g.targetId);
  if (g.mode === 'find') {
    const cl = g.clues ?? [];
    if (cl.length < 2 || cl.length > 3) p.push(`${g.id}: a find round needs 2-3 clue steps`);
    cl.forEach((c, i) => { if (!c.text.trim() || !c.tags.length) p.push(`${g.id}: clue ${i + 1} needs text and tags`); });
    for (let i = 0; i < cl.length; i++) {
      const tags = clueTags(g, i);
      if (!fits(target, tags)) p.push(`${g.id}: clue ${i + 1} is not true of the target`);
      const n = fitIds(g.cards, tags).length;
      if (i === 0 && n < 3) p.push(`${g.id}: the first clue should still fit 3+ cards (it fits ${n})`);
      if (i > 0 && n > fitIds(g.cards, clueTags(g, i - 1)).length) p.push(`${g.id}: clue ${i + 1} must narrow the board`);
    }
    if (cl.length && fitIds(g.cards, clueTags(g, cl.length - 1)).join() !== g.targetId) p.push(`${g.id}: the last clue must fit only the target`);
    if (cl.length && !fits(cardOf(g, g.trapId), clueTags(g, 0))) p.push(`${g.id}: the trap must fit the first clue`);
  } else {
    const chips = g.chips ?? [];
    const acc = g.acceptedChips ?? [];
    if (chips.length < 6) p.push(`${g.id}: a build round needs 6+ chips`);
    if (!g.clueText?.trim()) p.push(`${g.id}: a build round needs its clueText (the model clue)`);
    for (const id of acc) if (!chips.some((c) => c.id === id)) p.push(`${g.id}: accepted chip ${id} does not exist`);
    for (const c of chips) {
      const isTrue = fits(target, [c.tag]);
      if (acc.includes(c.id) !== isTrue) p.push(`${g.id}: chip ${c.id} is ${isTrue ? 'true of the target but not accepted' : 'accepted but not true of the target'}`);
    }
    if (!chips.some((c) => !acc.includes(c.id))) p.push(`${g.id}: needs some chips that are not true (decoys)`);
    const banned = bannedChips(g);
    const usable = acc.filter((id) => !banned.includes(id));
    const tags = chipTags(g, usable);
    if (fitIds(g.cards, tags).join() !== g.targetId) p.push(`${g.id}: with the banned words removed, the true chips must still point to the target alone`);
    const newN = (g.chips ?? []).filter((c) => usable.includes(c.id) && c.isNew).length;
    if (newN < (g.minNewWords ?? 0)) p.push(`${g.id}: only ${newN} new words are available but ${g.minNewWords} are needed`);
    // the trap must be a real lookalike: it fits a clue made of the new words alone, so the retry beat can happen
    const vague = chipTags(g, usable.filter((id) => g.chips?.find((c) => c.id === id)?.isNew)).filter((t) => t);
    if (vague.length && !fits(cardOf(g, g.trapId), vague)) p.push(`${g.id}: the trap does not fit a clue made of the new words (no lookalike to learn from)`);
  }
  return p;
}
