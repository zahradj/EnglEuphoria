import type { CSSProperties, ReactNode } from 'react';

/**
 * A spoken line with its vocabulary picked out.
 *
 * While the voice is reading, the line looks normal. Once the reading is done
 * (`reveal`), each focus word/phrase pops up — bigger, bolder, highlighted — and
 * stays that way, so the child's eye lands on the word they are meant to learn.
 * (Research on young learners: bolding + a colour highlight on target words
 * improves recognition of the word's written form.)
 *
 * The bigger size uses a transform, not a font-size change, so the rest of the
 * line never reflows or jumps when the highlight appears.
 */
export type FocusLook = 'paper' | 'chalk';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A letter, digit, underscore or hyphen: a focus word must not touch one of these (so "cat" is not found inside "Cat-cat" or "category"). */
const WORD_CHAR = /[A-Za-z0-9_\-À-ɏ]/;
const touchesWord = (text: string, index: number) => index >= 0 && index < text.length && WORD_CHAR.test(text[index]);

/**
 * Splits `text` into plain pieces and focus matches. Whole words/phrases only,
 * case-insensitive, longest phrase first. (No regex look-behind: older iPads
 * don't support it and it would throw.)
 */
export function splitFocus(text: string, focus: string[] | undefined): Array<{ text: string; focus: boolean }> {
  const phrases = (focus ?? []).map((f) => f.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  if (!phrases.length) return [{ text, focus: false }];
  const re = new RegExp(`(?:${phrases.map(escapeRe).join('|')})`, 'gi');

  const parts: Array<{ text: string; focus: boolean }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (m[0].length === 0) { re.lastIndex = start + 1; continue; }
    if (touchesWord(text, start - 1) || touchesWord(text, end)) {
      re.lastIndex = start + 1; // inside another word — look again one character along
      continue;
    }
    if (start > last) parts.push({ text: text.slice(last, start), focus: false });
    parts.push({ text: m[0], focus: true });
    last = end;
  }
  if (last < text.length) parts.push({ text: text.slice(last), focus: false });
  return parts.length ? parts : [{ text, focus: false }];
}

const wordStyle = (look: FocusLook, color: string, reveal: boolean, chars = 5): CSSProperties => {
  const base: CSSProperties = {
    display: 'inline-block',
    transformOrigin: '50% 80%',
    transition: 'transform .45s cubic-bezier(.34,1.56,.64,1), margin .45s ease, color .3s ease, background-size .45s ease',
    borderRadius: '.18em',
    padding: '0 .1em',
    // Scaling by 1.32 widens a word by 32% on both sides (a transform doesn't move its neighbours),
    // so give it room in proportion to its length — long words need more.
    margin: reveal ? `0 ${Math.max(0.22, chars * 0.1).toFixed(2)}em` : '0',
    transform: reveal ? 'scale(1.32)' : 'none',
    fontWeight: 900,
  };
  if (!reveal) return base;
  return look === 'chalk'
    ? { ...base, color: '#FFE08A', textShadow: '0 0 .5em rgba(255,224,138,.55)', textDecoration: 'underline wavy #FFE08A', textUnderlineOffset: '.18em', textDecorationThickness: '.07em' }
    : {
        ...base,
        color: '#7A2E05',
        background: `linear-gradient(180deg, transparent 50%, #FFD54A 50%, #FFD54A 94%, transparent 94%)`,
        boxShadow: `0 .09em 0 ${color}`,
      };
};

export function FocusLine({
  text,
  focus,
  reveal,
  look = 'paper',
  color,
  before,
  after,
}: {
  text: string;
  focus?: string[];
  /** The voice has finished reading — highlight the vocabulary. */
  reveal: boolean;
  look?: FocusLook;
  /** Speaker colour (the paper look's underline). */
  color: string;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const parts = splitFocus(text, focus);
  return (
    <>
      {before}
      {parts.map((p, i) =>
        p.focus ? (
          <mark key={i} data-focus style={{ background: 'transparent', color: 'inherit', ...wordStyle(look, color, reveal, p.text.length) }}>
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
      {after}
    </>
  );
}
