/* Shared lines for the picture-first phonics games (Sound Moles, Letter Monsters, Sound Fishing — owner,
 * 2026-10-11: "add phonics sound games to all lessons"). The SOUND itself is always the recorded letter sound
 * (playLetterPhonic, never TTS — CLAUDE.md phonics rule); the voice only says words and short praise, with the
 * same wording as sound-pick so the clips are shared. */
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
export const phonicsListenLine = 'Listen! Which one starts with this sound?';
export const phonicsYes = (word: string) => `Yes! ${cap(word)}!`;
export const phonicsNo = (word: string) => `${cap(word)}! Try again!`;
/** First sound of a word in our letter set ('sh', 'ch', 'th', 'wh' count as one sound). */
export const firstSound = (word: string) => {
  const w = word.toLowerCase();
  const two = w.slice(0, 2);
  return ['sh', 'ch', 'th', 'wh'].includes(two) ? two : w[0];
};
