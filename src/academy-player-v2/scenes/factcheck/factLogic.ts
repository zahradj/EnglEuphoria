// Fact-Check Wall (pure logic): the cards come in groups of THREE (Return of the Obra Dinn's rule of three). Each card is True, False or Not given; for True and False the student also shows the line.
// A group locks only when all three are right; otherwise the desk says how many are right, never which (so guessing does not pay and nothing is a buzzer).
import type { CastName, SceneBase } from '../../types';
import type { Clipping } from '../archive/archiveLogic';

export type Verdict = 'true' | 'false' | 'ng';
export interface FactCard { id: string; statement: string; verdict: Verdict; /** the proving line, 'c2.0' = clipping c2, sentence 1 (none for Not given) */ proof?: string; why: string }
export interface FactScene extends SceneBase {
  kind: 'factcheck'; title: string; who: CastName; intro: string;
  /** the article (same clippings as the archive) */
  clippings: Clipping[]; cards: FactCard[];
  story?: string;
}
export interface Answer { verdict?: Verdict; line?: string }

export const lineId = (c: Clipping, i: number) => `${c.id}.${i}`;
export const allLines = (clippings: Clipping[]) => clippings.flatMap((c) => c.lines.map((text, i) => ({ id: lineId(c, i), clip: c.id, text })));
export const groupsOf = (cards: FactCard[]): FactCard[][] => { const g: FactCard[][] = []; for (let i = 0; i < cards.length; i += 3) g.push(cards.slice(i, i + 3)); return g; };

/** one card is right when the verdict matches and (for True / False) the shown line is the proving line */
export const cardRight = (c: FactCard, a: Answer | undefined) => !!a && a.verdict === c.verdict && (c.verdict === 'ng' ? !a.line : a.line === c.proof);
/** a card is ready to be checked: a verdict, and a line unless it is Not given */
export const cardReady = (a: Answer | undefined) => !!a?.verdict && (a.verdict === 'ng' || !!a.line);
export const judgeGroup = (group: FactCard[], answers: Record<string, Answer>) => { const right = group.filter((c) => cardRight(c, answers[c.id])).length; return { right, all: right === group.length }; };

export function validateFact(s: FactScene): string[] {
  const p: string[] = [];
  if (!s.intro?.trim()) p.push(`${s.id}: factcheck needs the intro`);
  if (!s.cards?.length || s.cards.length % 3 !== 0) p.push(`${s.id}: the cards come in groups of three`);
  const ids = new Set(allLines(s.clippings ?? []).map((l) => l.id));
  for (const g of groupsOf(s.cards ?? [])) if (new Set(g.map((c) => c.verdict)).size < 2) p.push(`${s.id}: a group of three should not all be ${g[0].verdict}`);
  for (const c of s.cards ?? []) {
    if (!c.why?.trim()) p.push(`${s.id}: card "${c.statement}" needs a why`);
    if (c.verdict === 'ng' && c.proof) p.push(`${s.id}: a Not given card has no proving line ("${c.statement}")`);
    if (c.verdict !== 'ng' && !(c.proof && ids.has(c.proof))) p.push(`${s.id}: card "${c.statement}" needs a proving line that exists`);
  }
  const kinds = new Set((s.cards ?? []).map((c) => c.verdict));
  if (kinds.size < 3) p.push(`${s.id}: use all three verdicts (true, false, not given)`);
  return p;
}

export function factSpoken(s: FactScene): { who: string; text: string }[] {
  return [{ who: s.who, text: s.intro }, ...s.cards.map((c) => ({ who: s.who, text: c.statement }))];
}
