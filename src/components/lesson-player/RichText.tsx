import React, { useCallback } from 'react';
import { useDictionary } from './DictionaryContext';

/**
 * RichText — renders a string with markdown-style **double-asterisk** highlighting.
 *
 * Highlighted spans become bold inline pills. The entire text is also wired to
 * the Smart Contextual Dictionary: when a student double-clicks (or selects) a
 * word, a floating popover appears with definition + translation + image.
 *
 * Safe against XSS — we only render text nodes, never innerHTML.
 */
export interface RichTextProps {
  text: string;
  /** Tailwind classes for the highlighted span. */
  highlightClassName?: string;
  /** @deprecated alias for highlightClassName, kept for back-compat. */
  boldClassName?: string;
  /** Optional element wrapper (defaults to fragment). */
  as?: 'span' | 'p' | 'div';
  className?: string;
  /** Override hub for popover accent (auto-detected from CSS theme otherwise). */
  hub?: 'playground' | 'academy' | 'professional';
}

const DEFAULT_HIGHLIGHT =
  'bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded-md shadow-sm';

const extractSentence = (full: string, word: string): string => {
  if (!full) return '';
  const idx = full.toLowerCase().indexOf(word.toLowerCase());
  if (idx < 0) return full.slice(0, 200);
  // Walk back/forward to sentence boundaries
  const start = Math.max(0, full.lastIndexOf('.', idx), full.lastIndexOf('!', idx), full.lastIndexOf('?', idx)) + 1;
  let end = full.length;
  for (const ch of ['.', '!', '?']) {
    const i = full.indexOf(ch, idx);
    if (i > 0 && i < end) end = i + 1;
  }
  return full.slice(start, end).trim();
};

export const RichText: React.FC<RichTextProps> = ({
  text,
  highlightClassName,
  boldClassName,
  as,
  className,
  hub = 'academy',
}) => {
  const dict = useDictionary();

  const handleSelect = useCallback((e: React.MouseEvent) => {
    if (!dict) return;
    const sel = window.getSelection();
    let word = sel?.toString().trim() || '';
    let rect: DOMRect | null = null;

    if (word) {
      // Single-token only
      if (/\s/.test(word)) return;
      const range = sel?.getRangeAt(0);
      rect = range?.getBoundingClientRect() || null;
    } else if (e.detail === 2) {
      // Double click without selection — fall back to caret word
      const target = e.target as HTMLElement;
      const txt = target?.textContent || '';
      const r = (e.target as HTMLElement).getBoundingClientRect();
      // crude fallback: use full element text + element rect
      const m = txt.match(/[\p{L}\p{N}'-]+/gu) || [];
      word = m[0] || '';
      rect = r;
    }

    if (!word || !rect) return;
    const cleaned = word.replace(/[^\p{L}\p{N}'-]/gu, '');
    if (!cleaned) return;
    dict.open({ word: cleaned, context: extractSentence(text, cleaned), rect, hub });
  }, [dict, text, hub]);

  if (!text) return null;
  const cls = highlightClassName ?? boldClassName ?? DEFAULT_HIGHLIGHT;

  const parts = text.split(/\*\*(.+?)\*\*/g);
  const nodes = parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={cls}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

  const interactiveProps = dict
    ? { onMouseUp: handleSelect, onDoubleClick: handleSelect, style: { cursor: 'text' } as React.CSSProperties }
    : {};

  if (as === 'p') return <p className={className} {...interactiveProps}>{nodes}</p>;
  if (as === 'div') return <div className={className} {...interactiveProps}>{nodes}</div>;
  if (as === 'span') return <span className={className} {...interactiveProps}>{nodes}</span>;
  // Default: wrap in span so we can attach selection handlers
  return <span {...interactiveProps}>{nodes}</span>;
};

export default RichText;
