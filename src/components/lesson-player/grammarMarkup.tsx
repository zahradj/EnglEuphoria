import React from 'react';

/**
 * Safe parser for color-coded grammar markup.
 *
 * Allowed tags (case-insensitive):
 *   <verb>…</verb>       → bold red    (action words)
 *   <noun>…</noun>       → bold blue   (people / things)
 *   <adjective>…</adj>   → bold green  (descriptors)
 *   <target>…</target>   → highlighted yellow background (the lesson focus)
 *
 * Unknown tags are stripped. Plain `**bold**` is also supported (legacy).
 * No `dangerouslySetInnerHTML` — we emit React nodes directly, so this is
 * XSS-safe by construction.
 */

const TAG_RE = /<\s*(verb|noun|adjective|adj|target)\s*>([\s\S]*?)<\s*\/\s*\1\s*>/gi;
const BOLD_RE = /\*\*(.+?)\*\*/g;
// A run of 2+ underscores is the fill-in-the-blank convention used across
// this app's authored content ("I ___ Tom.", "I spend about ____ hours").
// Rendered as plain characters it reads as part of the sentence and a
// pre-reader can miss it entirely -- a dashed, standalone box makes the
// blank unmistakably its own thing to tap/think about.
const BLANK_RE = /_{2,}/g;

const TAG_CLASS: Record<string, string> = {
  verb: 'font-bold text-red-600',
  noun: 'font-bold text-blue-600',
  adjective: 'font-bold text-green-600',
  adj: 'font-bold text-green-600',
  target: 'font-bold bg-yellow-200 text-slate-900 px-1 rounded',
};

function renderBlanks(text: string, keyPrefix: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(BLANK_RE);
  const nodes: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    if (p) nodes.push(<React.Fragment key={`${keyPrefix}-p-${i}`}>{p}</React.Fragment>);
    if (i < parts.length - 1) {
      nodes.push(
        <span
          key={`${keyPrefix}-blank-${i}`}
          className="inline-block align-middle mx-1 min-w-[2.75rem] h-[1.4em] rounded-md border-2 border-dashed border-indigo-400 bg-indigo-50"
          aria-label="blank"
        />,
      );
    }
  });
  return nodes;
}

function renderBold(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(BOLD_RE);
  return parts.flatMap((p, i) =>
    i % 2 === 1
      ? [
          <strong key={`${keyPrefix}-b-${i}`} className="font-bold text-violet-700">
            {p}
          </strong>,
        ]
      : renderBlanks(p, `${keyPrefix}-t-${i}`),
  );
}

export function parseGrammarMarkup(text: string): React.ReactNode {
  if (!text) return null;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  // reset lastIndex for safety
  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...renderBold(text.slice(lastIndex, match.index), `pre-${i}`));
    }
    const tag = match[1].toLowerCase();
    const inner = match[2];
    nodes.push(
      <span key={`tag-${i}`} className={TAG_CLASS[tag] || ''}>
        {renderBold(inner, `in-${i}`)}
      </span>,
    );
    lastIndex = match.index + match[0].length;
    i++;
  }
  if (lastIndex < text.length) {
    nodes.push(...renderBold(text.slice(lastIndex), `tail-${i}`));
  }
  return <>{nodes}</>;
}

export const GrammarMarkup: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => <span className={className}>{parseGrammarMarkup(text)}</span>;

export default GrammarMarkup;
