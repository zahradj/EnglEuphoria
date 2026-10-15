/* Pure rules for Reef Detective (ReefDetectiveScene) — kept out of the component so the voice bake script can import
 * every line the game speaks. A question is a key: `size:big`, `doing:swimming` or `name:crab`. */

export interface Suspect { name: string; img: string; doing: string; size: 'big' | 'small' }

export const DETECTIVE_YES = 'Yes, it is!';
export const DETECTIVE_NO = 'No, it isn’t!';
export const DETECTIVE_LOOK = 'Look at your card again!';
export const DETECTIVE_HIDE = 'Now you hide one! Tap an animal — don’t tell me!';

const article = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');

export function questionText(key: string): string {
  const [kind, value] = key.split(':');
  if (kind === 'name') return `Is it ${article(value)} ${value}?`;
  return `Is it ${value}?`;
}

export function fits(s: Suspect, key: string): boolean {
  const [kind, value] = key.split(':');
  if (kind === 'size') return s.size === value;
  if (kind === 'doing') return s.doing === value;
  return s.name === value;
}

/** Every question a child can ask about these suspects: sizes, actions, then names. */
export function allQuestions(suspects: Suspect[]): string[] {
  const sizes = [...new Set(suspects.map((s) => s.size))].map((v) => `size:${v}`);
  const doings = [...new Set(suspects.map((s) => s.doing))].map((v) => `doing:${v}`);
  const names = suspects.map((s) => `name:${s.name}`);
  return [...sizes, ...doings, ...names];
}

export const foundLine = (s: Suspect) => `Yes! It’s the ${s.name}! The ${s.name} is ${s.doing}.`;
export const guessLine = (s: Suspect) => `Is it the ${s.name}?`;
export const caughtLine = (s: Suspect) => `It’s the ${s.name}! You’re a great reef detective!`;
