/** Pure helpers for the Academy `name_tag_studio` slide (name sanitising, letter spelling, saved card). */

export const NAME_TAG_STORAGE_KEY = 'academy.nameTag';
export const NAME_MAX_LENGTH = 14;

export interface NameTagCard { avatar: string; color: string; name: string }

/** Letters only (any alphabet), no spaces/digits/symbols, max 14, first letter upper-case, rest lower-case. */
export function sanitizeName(raw: string, max = NAME_MAX_LENGTH): string {
  const letters = Array.from(String(raw ?? '')).filter((ch) => /\p{L}/u.test(ch)).slice(0, max).join('');
  if (!letters) return '';
  const [first, ...rest] = Array.from(letters);
  return first.toLocaleUpperCase() + rest.join('').toLocaleLowerCase();
}

/** ['A','V','A'] — one entry per letter, upper-case, for the tappable tiles. */
export function spellLetters(name: string): string[] {
  return Array.from(sanitizeName(name)).map((c) => c.toLocaleUpperCase());
}

/** 'A – V – A' */
export function spellingLine(name: string): string {
  return spellLetters(name).join(' – ');
}

/** Fills {name} in a model sentence ("Hello! My name is {name}."). */
export function fillModel(model: string, name: string): string {
  return model.replace(/\{name\}/g, name);
}

export function saveNameTag(card: NameTagCard): boolean {
  try { localStorage.setItem(NAME_TAG_STORAGE_KEY, JSON.stringify(card)); return true; } catch { return false; }
}

export function loadNameTag(): NameTagCard | null {
  try {
    const raw = localStorage.getItem(NAME_TAG_STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<NameTagCard>;
    if (typeof v?.avatar === 'string' && typeof v.color === 'string' && typeof v.name === 'string') return v as NameTagCard;
  } catch { /* ignore */ }
  return null;
}
