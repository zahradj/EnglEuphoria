/**
 * Pure helpers for the Academy `gate_guard` slide (a "Papers, Please"-style checkpoint: hear the visitor's name, compare it
 * with the name on the tag, let them in or send them to the Name Desk) and `reply_quest` (visual-novel style replies).
 * Kept free of React so the rules are unit-tested.
 */

export type GateDecision = 'let_in' | 'name_desk';

export interface GateRound {
  /** Visitor avatar id (ava | theo | mia | vee). */
  visitor: string;
  /** What the visitor says, e.g. "Hi! I am Theo." */
  says: string;
  /** The name printed on the visitor's tag. */
  tag: string;
  /** True when the tag spells the same name the visitor said (let them in). */
  ok: boolean;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[^\p{L}]/gu, '');

/** The name inside a self-introduction: "I am Theo." / "I'm Theo" / "My name is Theo" / "My name's Theo". */
export function extractName(says: string): string | null {
  const m = says.match(/(?:\bI am|\bI['’]m|\bmy name is|\bmy name['’]s)\s+([\p{L}]+)/iu);
  return m ? m[1] : null;
}

export function namesMatch(a: string, b: string): boolean {
  return norm(a) === norm(b) && norm(a).length > 0;
}

/** Index of the first letter where two names differ (case-insensitive), or -1 when they are the same. */
export function firstDifference(a: string, b: string): number {
  const x = norm(a);
  const y = norm(b);
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) if (x[i] !== y[i]) return i;
  return -1;
}

/** The correct decision for a round, derived from the spoken name and the tag (not trusted from the data). */
export function correctDecision(round: Pick<GateRound, 'says' | 'tag'>): GateDecision {
  const heard = extractName(round.says);
  return heard && namesMatch(heard, round.tag) ? 'let_in' : 'name_desk';
}

/** Validation for authored content: every round's `ok` flag must agree with what is actually said and printed. */
export function validateRounds(rounds: GateRound[]): string[] {
  const problems: string[] = [];
  rounds.forEach((r, i) => {
    if (!extractName(r.says)) problems.push(`round ${i + 1}: no name found in "${r.says}"`);
    const want = correctDecision(r) === 'let_in';
    if (want !== r.ok) problems.push(`round ${i + 1}: ok=${r.ok} but "${r.says}" vs tag "${r.tag}" means ok=${want}`);
  });
  return problems;
}

/** Explains a mismatch kindly: which letter to look at. */
export function mismatchHint(round: Pick<GateRound, 'says' | 'tag'>): string {
  const heard = extractName(round.says) ?? '';
  const at = firstDifference(heard, round.tag);
  if (at < 0) return 'The name and the tag are the same.';
  const a = norm(heard)[at];
  const b = norm(round.tag)[at];
  if (a && b) return `The tag says “${round.tag}”, but you heard “${heard}”. Look at letter ${at + 1}: ${b.toUpperCase()} is not ${a.toUpperCase()}.`;
  return `The tag says “${round.tag}”, but you heard “${heard}”. One has more letters.`;
}

/** 1-3 stars from accuracy (gentle: one star just for finishing). */
export function starsFor(correct: number, total: number): 1 | 2 | 3 {
  if (total <= 0) return 1;
  const r = correct / total;
  return r >= 0.85 ? 3 : r >= 0.6 ? 2 : 1;
}

/** Fill "…" / "..." / "{name}" in a reply or line with the student's saved name (when they have one). */
export function fillName(text: string, name: string | null | undefined): string {
  const n = (name ?? '').trim();
  if (!n) return text;
  return text.replace(/\{name\}|…|\.\.\./g, n);
}

/** Friendship meter (0-3 hearts) from correct replies. */
export function friendshipHearts(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0 || correct <= 0) return 0;
  const r = correct / total;
  return r >= 0.95 ? 3 : r >= 0.6 ? 2 : 1;
}
