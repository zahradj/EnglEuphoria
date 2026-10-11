// What the cast SAYS in a deck, read straight from the slide data (never invented): the single source for the recorded-voice pipeline
// (scripts/academy-voice-lines.mjs) and the player. Lines with a variable ({name}) or a blank (___) cannot be pre-recorded and stay silent.
import type { CastName, Slide } from './types';

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
    case 'teach': return s.pages.flatMap((p) => [...line(lead(s), p.word), ...line(lead(s), p.example)]);
    default: return [];
  }
}

export const slideLines = (s: Slide): SpokenLine[] => [...openLines(s), ...viewLines(s)];

/** The speaker of a convo's questions (the actor who is not the student). */
export const convoAsker = (s: Extract<Slide, { kind: 'convo' }>): CastName => s.actors?.find((a) => a.who !== s.me)?.who ?? 'Theo';
