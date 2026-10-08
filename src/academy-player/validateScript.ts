// Academy lesson player — script validator. Pure. Deploy gate for every lesson script.
import { CAST_NAMES, type Beat, type Level, type SceneScript } from './scriptTypes';
import { labelIndex } from './engine';

export interface ScriptIssue {
  severity: 'error' | 'warn';
  beat?: number;
  code: string;
  message: string;
}

/** Max words per dialogue box / chat message / bubble by level (design doc §5). */
export const MAX_WORDS: Record<Level, number> = { A1: 12, A2: 20, B1: 20, B2: 35, C1: 45 };
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean);

export function validateScript(script: SceneScript): ScriptIssue[] {
  const issues: ScriptIssue[] = [];
  const err = (code: string, message: string, beat?: number) => issues.push({ severity: 'error', beat, code, message });
  const warn = (code: string, message: string, beat?: number) => issues.push({ severity: 'warn', beat, code, message });
  const labels = labelIndex(script);
  const max = MAX_WORDS[script.level];
  const cast = new Set<string>(CAST_NAMES);

  if (!/^(A1|A2|B1|B2|C1)-S\d{2}-E[1-8]$/.test(script.lessonId)) err('lesson_id', `lessonId "${script.lessonId}" must look like A1-S01-E1.`);
  script.cast.forEach((c) => !cast.has(c) && err('cast', `"${c}" is not an Academy cast-vault character.`));
  if (!script.beats.some((b) => b.t === 'end')) err('no_end', 'The script needs an end beat.');
  const labelNames = script.beats.filter((b): b is Extract<Beat, { t: 'label' }> => b.t === 'label').map((b) => b.name);
  if (new Set(labelNames).size !== labelNames.length) err('dup_label', 'Duplicate label names.');

  const needsLine = (text: string, beat: number, what: string) => {
    if (!text.trim()) err('empty_text', `${what} is empty.`, beat);
    const n = words(text).length;
    if (n > max) err('too_long', `${what} has ${n} words; ${script.level} allows ${max}.`, beat);
  };

  script.beats.forEach((b, i) => {
    switch (b.t) {
      case 'bg':
        if (!b.alt.trim()) err('alt', 'Background needs alt text.', i);
        break;
      case 'show':
      case 'hide':
        if (!cast.has(b.who)) err('cast', `"${b.who}" is not an Academy cast member.`, i);
        break;
      case 'say':
        if (b.who !== 'narrator' && !cast.has(b.who)) err('cast', `"${b.who}" is not an Academy cast member.`, i);
        needsLine(b.text, i, 'Dialogue line');
        if (!b.voice) warn('silent', 'No voice clip id: this line will be silent until a recorded clip is added.', i);
        (b.key ?? []).forEach((k) => !b.text.toLowerCase().includes(k.toLowerCase()) && err('key_missing', `Key word "${k}" is not in the line.`, i));
        break;
      case 'choice':
        if (b.options.length < 2 || b.options.length > 4) err('options', 'A choice needs 2-4 options.', i);
        if (b.tests === 'language' && b.options.filter((o) => o.correct).length !== 1) err('correct', 'A language choice needs exactly one correct option.', i);
        b.options.forEach((o) => {
          needsLine(o.text, i, 'Choice option');
          if (o.goto && !(o.goto in labels)) err('goto', `Unknown label "${o.goto}".`, i);
          if (o.correct === false && !o.feedback) warn('feedback', 'A wrong option should have a friendly, specific hint.', i);
        });
        break;
      case 'chat':
        b.messages.forEach((m) => {
          if (m.who !== 'You' && m.who !== 'Unknown' && !cast.has(m.who)) err('cast', `Chat sender "${m.who}" is not an Academy cast member.`, i);
          if (m.who === 'Unknown' && !m.label) err('label', 'An Unknown sender needs a display label.', i);
          needsLine(m.text, i, 'Chat message');
        });
        if (b.reply) {
          if (b.reply.options.filter((o) => o.correct).length !== 1) err('correct', 'A chat reply needs exactly one correct option.', i);
          b.reply.options.forEach((o) => needsLine(o.text, i, 'Reply option'));
        }
        break;
      case 'panels':
        if (b.panels.length < 3 || b.panels.length > 6) err('panels', 'A comic beat has 3-6 panels.', i);
        b.panels.forEach((p) => {
          if (!p.alt.trim()) err('alt', 'Panel needs alt text.', i);
          if (p.bubble) {
            const n = words(p.bubble.text).length;
            const cap = script.level === 'A1' ? 10 : max;
            if (n > cap) err('too_long', `Bubble has ${n} words; limit ${cap}.`, i);
          }
        });
        break;
      case 'flash':
        if (b.cards.length < 3 || b.cards.length > 4) err('flash_size', 'A flash set holds 3-4 cards (working-memory limit).', i);
        b.cards.forEach((c) => {
          if (!c.chunk.toLowerCase().includes(c.word.toLowerCase())) err('chunk', `Chunk "${c.chunk}" must contain the word "${c.word}".`, i);
          if (!c.alt.trim()) err('alt', 'Card picture needs alt text.', i);
        });
        break;
      case 'jump':
        if (!(b.label in labels)) err('jump', `Unknown label "${b.label}".`, i);
        break;
      case 'if':
        if (!(b.goto in labels)) err('goto', `Unknown label "${b.goto}".`, i);
        break;
      default:
        break;
    }
  });
  return issues;
}

const TOKEN = /[A-Za-z][A-Za-z'’-]*/g;
export const tokens = (text: string) => (text.match(TOKEN) ?? []).map((t) => t.toLowerCase().replace(/[’]/g, "'"));

/** All on-screen text of a script (lines, options, chat, bubbles, cards). */
export function scriptTexts(script: SceneScript): string[] {
  const out: string[] = [];
  for (const b of script.beats) {
    if (b.t === 'say') out.push(b.text);
    if (b.t === 'choice') out.push(b.prompt, ...b.options.map((o) => o.text));
    if (b.t === 'chat') {
      out.push(...b.messages.map((m) => m.text));
      if (b.reply) out.push(b.reply.prompt, ...b.reply.options.map((o) => o.text));
    }
    if (b.t === 'panels') b.panels.forEach((p) => p.bubble && out.push(p.bubble.text));
    if (b.t === 'flash') b.cards.forEach((c) => out.push(c.chunk));
  }
  return out;
}

/** Glossed words (tap-to-gloss) count as known: the student can see their meaning. */
export function glossedWords(script: SceneScript): Set<string> {
  const g = new Set<string>();
  for (const b of script.beats) {
    if (b.t === 'say' && b.gloss) Object.keys(b.gloss).forEach((k) => g.add(k.toLowerCase()));
    if (b.t === 'chat') b.messages.forEach((m) => m.gloss && Object.keys(m.gloss).forEach((k) => g.add(k.toLowerCase())));
    if (b.t === 'panels') b.panels.forEach((p) => p.keyWord && g.add(p.keyWord.word.toLowerCase()));
  }
  return g;
}

/**
 * The 95 % rule (owner/science rule): at least 95 % of the running words in the lesson's texts must be words the student already
 * knows (earlier lessons, recycled Seasons, this lesson's own new items, closed-class words) or glossed on tap.
 */
export function knownWordShare(script: SceneScript, known: Set<string>): { share: number; unknown: string[] } {
  const glossed = glossedWords(script);
  let total = 0;
  let ok = 0;
  const unknown = new Set<string>();
  for (const text of scriptTexts(script)) {
    for (const w of tokens(text)) {
      total += 1;
      if (known.has(w) || glossed.has(w)) ok += 1;
      else unknown.add(w);
    }
  }
  return { share: total ? ok / total : 1, unknown: [...unknown].sort() };
}
