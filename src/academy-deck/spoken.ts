// What the cast SAYS in a deck, read straight from the slide data (never invented): the single source for the recorded-voice pipeline
// (scripts/academy-voice-lines.mjs) and the player. Lines with a variable ({name}) or a blank (___) cannot be pre-recorded and stay silent.
import type { CastName, Slide } from './types';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** 1-999 in words, hyphenated like a teacher writes them: twenty-one, four hundred, four hundred thirty-one. */
export const numberWord = (n: number): string => (n >= 100 ? `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numberWord(n % 100)}` : ''}` : n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''));
/** A teach-page title such as 'Spain · Spanish' is spoken as 'Spain, Spanish'. */
export const sayable = (word: string): string => word.replace(/ · /g, ', ');

const cap = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

/** How each letter is SAID (letter names), so spelled words and single letters are recorded correctly: A-V-A -> "ay, vee, ay." */
export const LETTER_NAME: Record<string, string> = { A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'ell', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar', S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee' };
export const ALPHABET = Object.keys(LETTER_NAME);
/** The text sent to the voice for a line: spelled letters (A-V-A) and single capital letters become their names; everything else is unchanged. The clip key stays the original text. */
export function speechText(text: string): string {
  const t = text.trim();
  if (/^[A-Z]$/.test(t)) return `${LETTER_NAME[t]}.`;
  return text.replace(/\b([A-Z](?:-[A-Z])+)\b/g, (_m, g: string) => g.split('-').map((l) => LETTER_NAME[l]).join(', '));
}

export interface SpokenLine { who: CastName; text: string }

const fixed = (l: SpokenLine): boolean => !/[{}]|_{2,}/.test(l.text) && l.text.trim().length > 0;
const line = (who: CastName | undefined, text: string | undefined): SpokenLine[] => (who && text ? [{ who, text }].filter(fixed) : []);
const lead = (s: Slide): CastName => s.actors?.[0]?.who ?? 'Vee';

/** Lines the deck speaks by itself, in order, when the slide opens. */
export function openLines(s: Slide): SpokenLine[] {
  switch (s.kind) {
    case 'title': return line('Vee', s.heading);
    case 'brief': return line('Vee', s.say);
    case 'dial': case 'lane': case 'blend': case 'hearpick': case 'reader': case 'rhythm': case 'duel': case 'passage': case 'forge': case 'streak': case 'readq': case 'boss': case 'wordle': case 'rpg': case 'quiz': case 'triple': return line(lead(s), s.prompt);
    case 'vault': return line(lead(s), s.line);
    case 'rule': return line('Vee', s.title);
    case 'say': return line(lead(s), s.prompt);
    case 'wrap': return [...line('Vee', s.heading), ...line('Vee', s.homework), ...line('Vee', s.clue)];
    // game prompts are spoken when the game opens (the guide reads the task aloud)
    case 'lockers': case 'numtrain': case 'match': case 'countup': case 'bepick': case 'build': case 'factcheck': case 'border': case 'memory': case 'hunt': case 'shadow': case 'findwrong': case 'spell': case 'explore': case 'sort': return line(lead(s), s.prompt);
    case 'padlock': return [...line(lead(s), s.prompt), ...line(lead(s), s.clue)];
    default: return [];
  }
}

/** Lines the slide's own view speaks as it reveals them (a conversation line, a question, a vocabulary page). */
export function viewLines(s: Slide): SpokenLine[] {
  switch (s.kind) {
    case 'whosaid': return (s.replay ?? []).flatMap((l) => line(l.who, l.text));
    case 'convo': {
      const asker = s.actors?.find((a) => a.who !== s.me)?.who ?? 'Theo';
      return s.steps.flatMap((st) => line(asker, st.ask));
    }
    case 'phonechat': return s.steps.flatMap((st) => line(s.contact, st.text));
    case 'model': return s.lines.flatMap((l) => line(l.who, l.text));
    case 'lockers': return s.rounds.flatMap((n) => line('Vee', s.words[n]));
    case 'numtrain': return s.numbers.flatMap((n) => line('Vee', s.words[n]));
    case 'hunt': return s.targets.flatMap((t) => line('Vee', t.word));
    case 'shadow': return s.rounds.flatMap((r) => line('Vee', r.answer));
    case 'border': return s.rounds.flatMap((r) => line(lead(s), r.says));
    case 'memory': return s.pairs.flatMap((p) => line('Vee', p.text));
    case 'teach': return s.pages.flatMap((p) => [...line(lead(s), sayable(p.word)), ...line(lead(s), p.example)]);
    case 'match': return s.pairs.flatMap((p) => line(lead(s), sayable(p.word)));
    case 'countup': return [...new Set(s.rounds.flatMap((r) => r.seq))].flatMap((n) => line('Vee', numberWord(n)));
    case 'bepick': return s.rounds.flatMap((r) => line(lead(s), cap(r.frame.replace('___', r.answer))));
    case 'build': return s.rounds.flatMap((r) => line(lead(s), r.target));
    case 'factcheck': return s.claims.flatMap((c) => line(lead(s), c.text));
    case 'blend': return s.rounds.flatMap((r) => line('Vee', r.word));
    case 'hearpick': return s.rounds.flatMap((r) => line('Vee', r.say));
    case 'rhythm': return s.rounds.flatMap((r) => line('Vee', r.say));
    case 'duel': return s.rounds.flatMap((r) => line(lead(s), s.frame.replace('___', r.answer)));
    case 'forge': return s.rounds.flatMap((r) => line(lead(s), `${r.forms[0]}, ${r.forms[1]}, ${r.forms[2]}.`));
    case 'streak': return s.rounds.flatMap((r) => [...line(lead(s), r.forms[0]), ...line(lead(s), r.forms[1]), ...line(lead(s), r.forms[2])]);
    case 'passage': return [...s.lines.flatMap((t) => line(s.from, t)), ...[...new Set(s.lines.join(' ').replace(/[.,!?]/g, '').split(/\s+/))].flatMap((w) => line(s.from, w))];
    case 'story': return s.beats.flatMap((b) => b.lines.flatMap((l) => line(l.who, l.text)));
    case 'sort': return s.items.flatMap((it) => s.bins.flatMap((b) => line('Vee', b.template.replace('{w}', it.word))));
    case 'triple': return s.verbs.flatMap((v) => line(lead(s), `${v[0]}, ${v[1]}, ${v[2]}.`));
    case 'rpg': return s.scenes.flatMap((sc) => [...line(s.npc, sc.say), ...sc.options.flatMap((o) => line(s.npc, o.reply))]);
    case 'explore': return s.spots.flatMap((p) => line(p.who, p.line));
    case 'rule': return s.lines.flatMap((l) => [...line('Vee', l.say), ...line('Vee', l.example)]);
    case 'reader': return s.lines.flatMap((l) => [...line('Vee', l.text), ...[...new Set(l.text.replace(/[.,!?]/g, '').split(/\s+/))].flatMap((w) => line('Vee', w))]);
    case 'numwall': return [...Array.from({ length: 100 }, (_, i) => i + 1), ...(s.hundreds ? [200, 300, 400, 500, 600, 700, 800, 900] : [])].flatMap((n) => line('Vee', numberWord(n)));
    default: return [];
  }
}

export const slideLines = (s: Slide): SpokenLine[] => [...openLines(s), ...viewLines(s)];

/** The speaker of a convo's questions (the actor who is not the student). */
export const convoAsker = (s: Extract<Slide, { kind: 'convo' }>): CastName => s.actors?.find((a) => a.who !== s.me)?.who ?? 'Theo';

/** Letter SOUNDS (not names) need careful recordings (policy voice, no "suh"). The text key is "sound <letter>": it has no clip until the owner approves the recordings, so tapping a tile stays silent (never another voice). */
export const soundKey = (letter: string): string => `sound ${letter.toLowerCase()}`;
