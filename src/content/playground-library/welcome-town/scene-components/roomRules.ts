/* Pure rules for the Magic Castle "my room" games (DesignRoomScene, LostPropertyScene) — kept out of the components so
 * tests and the voice-cache extractor say exactly the same sentences. */

const article = (noun: string) => (/^[aeiou]/i.test(noun) ? 'an' : 'a');
const plural = (noun: string) => (/(s|x|ch|sh)$/i.test(noun) ? `${noun}es` : `${noun}s`);
const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

/** "There is a plant between the windows." */
export const placeSentence = (thing: string, where: string) => `There is ${article(thing)} ${thing} ${where}.`;

/** The child's room, said back: one sentence per kind of thing, "There are two lamps." when there is more than one. */
export function roomSentences(labels: string[]): string[] {
  const counts = new Map<string, number>();
  for (const l of labels) counts.set(l, (counts.get(l) ?? 0) + 1);
  return [...counts].map(([l, n]) => (n > 1 ? `There are ${NUMBER_WORDS[n] ?? n} ${plural(l)}.` : `There is ${article(l)} ${l}.`));
}

export const whoseQuestion = (thing: string) => `Whose ${thing} is it?`;
/** "It's Wim's crown." — the name with 's, then the thing. */
export const ownerSentence = (name: string, thing: string) => `It’s ${name}’s ${thing}.`;
export const OWNER_YES = 'It’s mine! Thank you!';
export const OWNER_NO = 'No, it’s not mine!';
export const ROOM_AGAIN = 'Listen again!';
export const ROOM_FREE_START = 'Your room! Pick a thing, then pick a place.';
export const ROOM_DESCRIBE = 'Now tell me about your room!';
