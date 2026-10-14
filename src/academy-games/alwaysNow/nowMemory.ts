import { isDue, review, type Vault } from '../verbForge/verbMemory';

/** Always or Now's Memory Vault: same boxes and spacing as Verb Forge's, its own storage key. One card per recall sentence ("ps:r1"). */
const KEY = 'eg.alwaysNow.vault.v1';

export { isDue, review };
export type { Vault };

export function readNowVault(storage: Pick<Storage, 'getItem'> | null = typeof window !== 'undefined' ? window.localStorage : null): Vault {
  try {
    const raw = storage?.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Vault) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeVaultFor(vault: Vault, storage: Pick<Storage, 'setItem'> | null = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    storage?.setItem(KEY, JSON.stringify(vault));
  } catch {
    /* private mode / blocked storage: just don't remember */
  }
}

export interface StageProps {
  seed: number;
  vault: Vault;
  setVault: (v: Vault) => void;
  say: (text: string) => Promise<void>;
  spark: (el: Element | null) => void;
  nudge: () => void;
  onDone: (result: { mistakes: number; units: number }) => void;
}

export function summarizeNow(ids: string[], vault: Vault, now = Date.now()) {
  const boxes = [0, 0, 0, 0, 0, 0];
  let due = 0;
  for (const id of ids) {
    const c = vault[`ps:${id}`];
    boxes[c?.box ?? 0]++;
    if (c && isDue(vault, `ps:${id}`, now)) due++;
  }
  return { boxes, due, total: ids.length, mastered: boxes[5] };
}
