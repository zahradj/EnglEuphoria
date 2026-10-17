// Season arc defaults (skill academy-season-arc, owner 2026-10-16: "the season theme should be one, and the episodes related to it,
// progressive and systematic" and "make the themed seasons global in the academy hub").
// Every Season carries an essential question and eight chapters, one per episode. A Season may write its own (b1.ts does for B1-S01);
// otherwise they are derived here from the Season's own theme, fields, functions, structure and Release, so no Season has a chapter
// that could sit in another Season.
import type { RawChapter } from './authoring';

const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** a short, readable form of a long label: up to the first ( : ; and at most 60 characters on a word boundary */
const short = (t: string) => {
  const c = t.split(/[(:;]/)[0].trim();
  return c.length <= 60 ? c : c.slice(0, 60).replace(/\s+\S*$/, '');
};
const trim = (t: string) => t.replace(/[.?!]+$/, '').trim();

interface ArcInput {
  title: string;
  theme: string;
  release: string;
  canDo: string[];
  functions: string[];
  structures: { label: string; use?: string }[];
  lexicalFields: string[];
}

/** "I can talk about X" -> "How can I talk about X?"; the Release is what answers it. */
export function essentialQuestionFor(s: Pick<ArcInput, 'canDo' | 'theme'>): string {
  const c = trim(s.canDo[0] ?? '');
  const m = /^I can (.+)$/i.exec(c);
  return m ? `How can I ${m[1]}?` : `What can I say and show about ${lower(s.theme)}?`;
}

/** The eight chapters E1-E8: a sub-question inside the theme and the ONE difficulty that rises at that step. */
export function chaptersFor(s: ArcInput): RawChapter[] {
  const theme = lower(short(s.theme));
  const fields = s.lexicalFields.slice(0, 2).join(' and ');
  const pattern = s.structures[0];
  const fn = s.functions[0] ?? 'talking about it';
  return [
    { title: 'The hook', question: `What is going on in ${s.title}, and what do I already know about ${theme}?`, step: 'Recognise: follow the story and its ideas (gist)' },
    { title: cap(short(s.lexicalFields[0] ?? theme)), question: `Which words do I need for ${fields}?`, step: 'Controlled: say and use the new words' },
    { title: cap(short(pattern.label)), question: `How do I use ${lower(short(pattern.label))}${pattern.use && pattern.use.length <= 40 ? ` for ${pattern.use}` : ''} when I talk about ${theme}?`, step: 'Controlled: build correct sentences with the pattern' },
    { title: cap(fn), question: `How do I do this with a partner: ${fn}?`, step: 'Guided: a short exchange with a partner' },
    { title: 'The longer text', question: `What do the details of a longer text about ${theme} tell me?`, step: 'More input and reasoning: a longer text, then relay the key points' },
    { title: 'My own angle', question: `What can I say about ${theme} in the world I chose?`, step: 'Free choice: my own topic, my own words' },
    { title: 'Remix: no help', question: `Can I use everything from ${s.title} without help?`, step: 'Fluency on known language only: the boss round' },
    { title: 'My Release', question: essentialQuestionFor(s), step: `Release: the hardest task of the Season, spoken or written (${lower(trim(s.release))})` },
  ];
}
