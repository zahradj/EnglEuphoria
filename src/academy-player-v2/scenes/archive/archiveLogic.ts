// Archive Search (pure logic): a longer text is filed as clippings; the student taps KEYWORD chips and the desk returns at most `cap` clippings that carry the keyword (Her Story's capped search).
// Reading a clipping can unlock new keyword chips ("leads"). No typing (no spelling barrier), no timer.
import type { CastName, SceneBase } from '../../types';

/** one paragraph of the article, filed as a clipping: its sentences (each can be proved against later), its keywords and the chips it unlocks */
export interface Clipping { id: string; lines: string[]; keywords: string[]; leads?: string[] }
export interface ArchiveTask { q: string; /** the clippings the student must pin to answer */ needs: string[]; options: string[]; answer: number; why: string }
export interface ArchiveScene extends SceneBase {
  kind: 'archive'; title: string; who: CastName; intro: string;
  clippings: Clipping[]; chips: string[]; tasks: ArchiveTask[];
  /** passages per search (default 3) */
  cap?: number;
  story?: string;
}

export const CAP = 3;
export const textOf = (c: Clipping) => c.lines.join(' ');
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** the clippings a keyword returns, in filing order, at most `cap` */
export const search = (clippings: Clipping[], kw: string, cap = CAP): Clipping[] => clippings.filter((c) => c.keywords.some((k) => same(k, kw))).slice(0, cap);

/** every chip the student can ever reach: the starting chips plus the leads of any clipping a reachable chip returns */
export function reachableChips(s: Pick<ArchiveScene, 'clippings' | 'chips' | 'cap'>): Set<string> {
  const have = new Set(s.chips.map((c) => c.toLowerCase()));
  const queue = [...s.chips];
  while (queue.length) {
    const kw = queue.shift()!;
    for (const c of search(s.clippings, kw, s.cap ?? CAP)) for (const l of c.leads ?? []) if (!have.has(l.toLowerCase())) { have.add(l.toLowerCase()); queue.push(l); }
  }
  return have;
}

export function validateArchive(s: ArchiveScene): string[] {
  const p: string[] = [];
  const cap = s.cap ?? CAP;
  if (!s.intro?.trim()) p.push(`${s.id}: archive needs the editor's intro`);
  if ((s.clippings?.length ?? 0) < 6) p.push(`${s.id}: the archive needs 6+ clippings`);
  if (new Set(s.clippings?.map((c) => c.id)).size !== s.clippings?.length) p.push(`${s.id}: duplicate clipping ids`);
  if ((s.tasks?.length ?? 0) < 3) p.push(`${s.id}: the archive needs 3+ desk tasks`);
  const reach = reachableChips(s);
  const findable = new Set<string>();
  for (const kw of reach) for (const c of search(s.clippings, kw, cap)) findable.add(c.id);
  for (const k of s.chips) if (!search(s.clippings, k, cap).length) p.push(`${s.id}: the starting chip "${k}" returns nothing`);
  for (const c of s.clippings) {
    if (!c.lines?.length) p.push(`${s.id}: clipping ${c.id} has no lines`);
    for (const l of c.leads ?? []) if (!c.keywords.some((k) => same(k, l)) && !s.clippings.some((o) => o.keywords.some((k) => same(k, l)))) p.push(`${s.id}: lead "${l}" of ${c.id} finds nothing`);
  }
  s.tasks?.forEach((t, i) => {
    if (t.options.length !== 3 || t.answer < 0 || t.answer > 2) p.push(`${s.id}: task ${i + 1} needs 3 options and a valid answer`);
    if (!t.why?.trim()) p.push(`${s.id}: task ${i + 1} needs a why`);
    for (const id of t.needs) {
      if (!s.clippings.some((c) => c.id === id)) p.push(`${s.id}: task ${i + 1} needs a missing clipping ${id}`);
      else if (!findable.has(id)) p.push(`${s.id}: task ${i + 1}: clipping ${id} can never be found (cap ${cap})`);
    }
  });
  return p;
}

export function archiveSpoken(s: ArchiveScene): { who: string; text: string }[] {
  return [{ who: s.who, text: s.intro }, ...s.tasks.map((t) => ({ who: s.who, text: t.q })), ...s.clippings.map((c) => ({ who: s.who, text: textOf(c) }))];
}
