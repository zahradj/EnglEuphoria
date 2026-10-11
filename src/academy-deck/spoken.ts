// What the cast SAYS in a deck, read straight from the slide data (never invented): the single source for the recorded-voice pipeline
// (scripts/academy-voice-lines.mjs) and the player. Lines with a variable ({name}) or a blank (___) cannot be pre-recorded and stay silent.
import type { CastName, Slide } from './types';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** 1-100 in words, hyphenated like a teacher writes them: twenty-one. */
export const numberWord = (n: number): string => (n === 100 ? 'one hundred' : n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''));
/** A teach-page title such as 'Spain · Spanish' is spoken as 'Spain, Spanish'. */
export const sayable = (word: string): string => word.replace(/ · /g, ', ');

export interface SpokenLine { who: CastName; text: string }

const fixed = (l: SpokenLine): boolean => !/[{}]|_{2,}/.test(l.text) && l.text.trim().length > 0;
const line = (who: CastName | undefined, text: string | undefined): SpokenLine[] => (who && text ? [{ who, text }].filter(fixed) : []);
const lead = (s: Slide): CastName => s.actors?.[0]?.who ?? 'Vee';

/** Lines the deck speaks by itself, in order, when the slide opens. */
export function openLines(s: Slide): SpokenLine[] {
  switch (s.kind) {
    case 'title': return line('Vee', s.heading);
    case 'brief': return line('Vee', s.say);
    case 'dial': return line('Vee', s.prompt);
    case 'say': return line(lead(s), s.prompt);
    case 'wrap': return [...line('Vee', s.heading), ...line('Vee', s.homework), ...line('Vee', s.clue)];
    // game prompts are spoken when the game opens (the guide reads the task aloud)
    case 'lockers': case 'numtrain': case 'border': case 'memory': case 'hunt': case 'shadow': case 'findwrong': case 'spell': return line(lead(s), s.prompt);
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
    case 'numwall': return Array.from({ length: 100 }, (_, i) => i + 1).flatMap((n) => line('Vee', numberWord(n)));
    default: return [];
  }
}

export const slideLines = (s: Slide): SpokenLine[] => [...openLines(s), ...viewLines(s)];

/** The speaker of a convo's questions (the actor who is not the student). */
export const convoAsker = (s: Extract<Slide, { kind: 'convo' }>): CastName => s.actors?.find((a) => a.who !== s.me)?.who ?? 'Theo';
