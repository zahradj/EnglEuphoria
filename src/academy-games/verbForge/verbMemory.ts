/**
 * The Memory Vault: spaced retrieval for verb forms (Leitner boxes), kept per FORM, because a learner may know "went"
 * and still miss "gone". Local to the browser; a convenience, never a source of truth.
 *
 *   box 0 = never seen · 1 = embers (again today) · 2 = glow (tomorrow) · 3 = hot (3 days) · 4 = bright (a week) · 5 = gold (2 weeks)
 *   right → one box up · wrong → back to box 1
 */
export type FormKey = 'past' | 'pp' | 'base';
export interface Card { box: number; due: number }
export type Vault = Record<string, Card>;

export const MAX_BOX = 5;
const DAY = 24 * 60 * 60 * 1000;
/** Days until the next review, by box. */
export const INTERVAL_DAYS = [0, 0, 1, 3, 7, 14];
const KEY = 'eg.verbForge.vault.v1';

export const cardKey = (base: string, form: FormKey) => `${base}:${form}`;

export function readVault(storage: Pick<Storage, 'getItem'> | null = typeof window !== 'undefined' ? window.localStorage : null): Vault {
  try {
    const raw = storage?.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Vault) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeVault(vault: Vault, storage: Pick<Storage, 'setItem'> | null = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    storage?.setItem(KEY, JSON.stringify(vault));
  } catch {
    /* private mode / blocked storage: just don't remember */
  }
}

/** The vault after one answer. Pure: returns a new vault. */
export function review(vault: Vault, key: string, correct: boolean, now = Date.now()): Vault {
  const prev = vault[key] ?? { box: 0, due: now };
  // right: one box up (a first-ever right answer lands in box 2: known, see it again tomorrow); wrong: back to box 1
  const box = correct ? Math.min(MAX_BOX, Math.max(1, prev.box) + 1) : 1;
  return { ...vault, [key]: { box, due: now + INTERVAL_DAYS[box] * DAY } };
}

export const isDue = (vault: Vault, key: string, now = Date.now()) => {
  const c = vault[key];
  return !c || c.due <= now;
};

/** How well a verb is known: the weakest of its forms (never-seen = 0). */
export function verbBox(vault: Vault, base: string, forms: FormKey[] = ['past', 'pp']): number {
  return Math.min(...forms.map((f) => vault[cardKey(base, f)]?.box ?? 0));
}

/**
 * Choose the verbs to practise: due and weakest first, then new ones, then anything else; a stable, repeatable order for a given
 * `shuffle` so tests are deterministic.
 */
export function pickVerbs<T extends { base: string }>(verbs: T[], vault: Vault, count: number, now = Date.now(), shuffle: <U>(a: U[]) => U[] = (a) => a): T[] {
  const due = verbs.filter((x) => (['past', 'pp'] as FormKey[]).some((f) => vault[cardKey(x.base, f)] && isDue(vault, cardKey(x.base, f), now)));
  const fresh = verbs.filter((x) => !(['past', 'pp'] as FormKey[]).some((f) => vault[cardKey(x.base, f)]));
  const rest = verbs.filter((x) => !due.includes(x) && !fresh.includes(x));
  const byWeakness = (a: T, b: T) => verbBox(vault, a.base) - verbBox(vault, b.base);
  return [...shuffle(due).sort(byWeakness), ...shuffle(fresh), ...shuffle(rest)].slice(0, count);
}

export interface VaultSummary {
  /** verbs per box 0..5 (a verb counts in its weakest form's box) */
  boxes: number[];
  mastered: number;
  total: number;
  due: number;
}

export function summarize(verbs: { base: string }[], vault: Vault, now = Date.now()): VaultSummary {
  const boxes = Array.from({ length: MAX_BOX + 1 }, () => 0);
  let due = 0;
  for (const x of verbs) {
    const b = verbBox(vault, x.base);
    boxes[b] += 1;
    if (b > 0 && (['past', 'pp'] as FormKey[]).some((f) => isDue(vault, cardKey(x.base, f), now))) due += 1;
  }
  return { boxes, mastered: boxes[MAX_BOX], total: verbs.length, due };
}
