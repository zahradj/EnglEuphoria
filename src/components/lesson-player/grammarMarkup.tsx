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

const TAG_CLASS: Record<string, string> = {
  verb: 'font-bold text-red-600',
  noun: 'font-bold text-blue-600',
  adjective: 'font-bold text-green-600',
  adj: 'font-bold text-green-600',
  target: 'font-bold bg-yellow-200 text-slate-900 px-1 rounded',
};

function renderBold(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(BOLD_RE);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b-${i}`} className="font-bold text-violet-700">
        {p}
      </strong>
    ) : (
      <React.Fragment key={`${keyPrefix}-t-${i}`}>{p}</React.Fragment>
    ),
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
