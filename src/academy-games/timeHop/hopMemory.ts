import { isDue, type Vault } from '../verbForge/verbMemory';

/**
 * Time Hop's own Memory Vault (same boxes and spacing as Verb Forge's, see verbMemory.ts, but its own storage key).
 * One card per verb and DIRECTION: "go:past" = present → past, "went:base" = past → present.
 */
const KEY = 'eg.timeHop.vault.v1';

export type Direction = 'toPast' | 'toPresent';
export const hopCardKey = (base: string, dir: Direction) => `${base}:${dir}`;

export function readHopVault(storage: Pick<Storage, 'getItem'> | null = typeof window !== 'undefined' ? window.localStorage : null): Vault {
  try {
    const raw = storage?.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Vault) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeHopVault(vault: Vault, storage: Pick<Storage, 'setItem'> | null = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    storage?.setItem(KEY, JSON.stringify(vault));
  } catch {
    /* private mode / blocked storage: just don't remember */
  }
}

/** A verb's box = the weaker of its two directions (never seen = 0). */
export const hopBox = (vault: Vault, base: string) => Math.min(vault[hopCardKey(base, 'toPast')]?.box ?? 0, vault[hopCardKey(base, 'toPresent')]?.box ?? 0);

/** Due and weakest first, then new ones, then the rest. */
export function pickHopVerbs<T extends { base: string }>(verbs: T[], vault: Vault, count: number, now = Date.now(), shuffle: <U>(a: U[]) => U[] = (a) => a): T[] {
  const seen = (x: T) => vault[hopCardKey(x.base, 'toPast')] || vault[hopCardKey(x.base, 'toPresent')];
  const due = verbs.filter((x) => seen(x) && (['toPast', 'toPresent'] as Direction[]).some((d) => isDue(vault, hopCardKey(x.base, d), now)));
  const fresh = verbs.filter((x) => !seen(x));
  const rest = verbs.filter((x) => !due.includes(x) && !fresh.includes(x));
  return [...shuffle(due).sort((a, b) => hopBox(vault, a.base) - hopBox(vault, b.base)), ...shuffle(fresh), ...shuffle(rest)].slice(0, count);
}

export function summarizeHop(verbs: { base: string }[], vault: Vault, now = Date.now()) {
  const boxes = [0, 0, 0, 0, 0, 0];
  let due = 0;
  for (const v of verbs) {
    boxes[hopBox(vault, v.base)]++;
    if ((['toPast', 'toPresent'] as Direction[]).some((d) => vault[hopCardKey(v.base, d)] && isDue(vault, hopCardKey(v.base, d), now))) due++;
  }
  return { boxes, due, total: verbs.length, mastered: boxes[5] };
}
