// Pure logic of the Inspect (desk) game: tokens, where the fault is, and how one decision is judged. No React here (unit-tested).
export interface InspectFault {
  /** the faulty word or phrase as written in the document (look post / postcard: the student taps it); omit for the passport look */
  word?: string;
  /** which occurrence of the word, 0 = first (default) */
  occurrence?: number;
  /** the repairs offered (2-4), the right one included; or the reasons to pick from at the passport desk */
  fixes: string[];
  correct: string;
  ruleId: string;
  why: string;
}
export interface InspectItem {
  id: string;
  /** who wrote it (post: the author, postcard: the sender, passport: the traveller) */
  from?: string;
  /** one string per line of the document */
  doc: string[];
  prop?: InspectProp;
  /** present = the document breaks a rule; absent = it is fine */
  fault?: InspectFault;
  /** shown when the document is fine */
  okWhy?: string;
  /** a wrong repair menu for a document that is fine (shown if the student taps FIX anyway, so the menu never gives the answer away) */
  okFixes?: string[];
  /** the same check, reworded, shown when the item comes back once after a wrong answer */
  retry?: Omit<InspectItem, 'retry'>;
}
export type InspectProp =
  | { kind: 'stamps'; stamps: { city: string; date: string; back?: string }[] }
  | { kind: 'photo'; caption: string; tone: 'sea' | 'city' | 'field' | 'tower' | 'camp' | 'hill' }
  | { kind: 'postmark'; place: string; date: string };

export interface Token { text: string; word: string; line: number; idx: number }
export const stripWord = (s: string) => s.toLowerCase().replace(/[^a-z0-9’'-]/g, '');

export function tokenize(doc: string[]): Token[][] {
  return doc.map((line, l) => line.split(/\s+/).filter(Boolean).map((text, idx) => ({ text, word: stripWord(text), line: l, idx })));
}

/** the tokens of the faulty word or phrase (empty when the fault has no word or it is not in the text) */
export function faultTokens(item: Pick<InspectItem, 'doc' | 'fault'>): Token[] {
  const f = item.fault;
  if (!f?.word) return [];
  const target = f.word.split(/\s+/).map(stripWord);
  const lines = tokenize(item.doc);
  let seen = 0;
  for (const line of lines) {
    for (let i = 0; i + target.length <= line.length; i++) {
      if (target.every((w, k) => line[i + k].word === w)) {
        if (seen === (f.occurrence ?? 0)) return line.slice(i, i + target.length);
        seen++;
      }
    }
  }
  return [];
}

export interface Decision { approve: boolean; tapped?: { line: number; idx: number }; fix?: string }
export type Verdict = 'ok' | 'missed' | 'false-alarm' | 'wrong-word' | 'wrong-fix';

export function judge(item: InspectItem, d: Decision): { correct: boolean; verdict: Verdict } {
  if (!item.fault) return d.approve ? { correct: true, verdict: 'ok' } : { correct: false, verdict: 'false-alarm' };
  if (d.approve) return { correct: false, verdict: 'missed' };
  if (item.fault.word) {
    const span = faultTokens(item);
    const hit = !!d.tapped && span.some((t) => t.line === d.tapped!.line && t.idx === d.tapped!.idx);
    if (!hit) return { correct: false, verdict: 'wrong-word' };
  }
  return d.fix === item.fault.correct ? { correct: true, verdict: 'ok' } : { correct: false, verdict: 'wrong-fix' };
}

/** the repair menu for an item (a document that is fine gets its okFixes, so the menu never leaks the answer) */
export const menuOf = (item: InspectItem): string[] => item.fault?.fixes ?? item.okFixes ?? [];

/** every line the item can show, flattened for text checks */
export const docText = (item: Pick<InspectItem, 'doc'>) => item.doc.join(' ');

/** the batch that comes back after the last one: the wrong items, reworded when a retry exists (at most `cap`) */
export function returnedBatch(batches: { items: InspectItem[] }[], wrongIds: string[], cap = 4): InspectItem[] {
  const all = batches.flatMap((b) => b.items);
  return all.filter((i) => wrongIds.includes(i.id)).slice(0, cap).map((i) => (i.retry ? { ...i.retry, id: `${i.id}~r` } : { ...i, id: `${i.id}~r` }));
}
