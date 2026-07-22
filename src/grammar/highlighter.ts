// Visual grammar highlighter — tags tokens with semantic roles.
// Roles map to Tailwind semantic tokens via the renderer (no hex in components).

import type { HighlightRole, HighlightToken } from './types';

const AUXILIARIES = new Set([
  'do', 'does', 'did', "doesn't", "don't", "didn't",
  'is', 'are', 'was', 'were', 'am', "isn't", "aren't", "wasn't", "weren't",
  'have', 'has', 'had', "haven't", "hasn't", "hadn't",
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  "won't", "wouldn't", "shouldn't", "can't", "cannot", "couldn't", "mightn't", "mustn't",
  'be', 'been', 'being',
]);

const CONTRACTIONS = /\b\w+'\w+\b/g;
const TIME_EXPRESSIONS = [
  'yesterday', 'today', 'tomorrow', 'now', 'tonight',
  'last week', 'last month', 'last year', 'last night',
  'next week', 'next month', 'next year',
  'this week', 'this month', 'this year',
  'ago', 'already', 'just', 'yet', 'ever', 'never', 'since', 'for',
  'always', 'usually', 'often', 'sometimes', 'rarely',
  'in the morning', 'in the evening', 'at night',
];

const REGULAR_VERB_ENDINGS = /\b(\w{2,})(ed|ing|s)\b/gi;

function pushToken(
  out: HighlightToken[],
  text: string,
  role: HighlightRole,
  start: number,
  end: number,
) {
  // Deduplicate exact-range hits — keep highest specificity (first-wins).
  if (out.some((t) => t.start === start && t.end === end)) return;
  out.push({ text, role, start, end });
}

/**
 * Tag a sentence with highlight roles.
 * Deterministic, regex-based; meant for canonical sample lines.
 */
export function highlightSentence(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const lower = line.toLowerCase();

  // 1. Time expressions (longest-match first to avoid partials)
  const sortedTimes = [...TIME_EXPRESSIONS].sort((a, b) => b.length - a.length);
  for (const expr of sortedTimes) {
    let idx = 0;
    while ((idx = lower.indexOf(expr, idx)) !== -1) {
      pushToken(tokens, line.slice(idx, idx + expr.length), 'time', idx, idx + expr.length);
      idx += expr.length;
    }
  }

  // 2. Auxiliaries / modals
  const wordRe = /\b[\w']+\b/g;
  let m: RegExpExecArray | null;
  while ((m = wordRe.exec(line)) !== null) {
    const word = m[0];
    const lc = word.toLowerCase();
    const start = m.index;
    const end = start + word.length;
    if (AUXILIARIES.has(lc)) {
      pushToken(tokens, word, 'aux', start, end);
    }
  }

  // 3. Contractions (orange)
  let c: RegExpExecArray | null;
  CONTRACTIONS.lastIndex = 0;
  while ((c = CONTRACTIONS.exec(line)) !== null) {
    pushToken(tokens, c[0], 'contraction', c.index, c.index + c[0].length);
  }

  // 4. Regular verb endings — base in blue, ending in red.
  let v: RegExpExecArray | null;
  REGULAR_VERB_ENDINGS.lastIndex = 0;
  while ((v = REGULAR_VERB_ENDINGS.exec(line)) !== null) {
    const base = v[1];
    const ending = v[2];
    const baseStart = v.index;
    const baseEnd = baseStart + base.length;
    const endStart = baseEnd;
    const endEnd = endStart + ending.length;
    // Skip if this region is already tagged as aux/time/contraction.
    const overlapped = tokens.some(
      (t) => !(endEnd <= t.start || baseStart >= t.end),
    );
    if (overlapped) continue;
    pushToken(tokens, base, 'base', baseStart, baseEnd);
    pushToken(tokens, ending, 'ending', endStart, endEnd);
  }

  // 5. Question inversion — first two tokens of a line ending in '?'.
  if (line.trim().endsWith('?')) {
    wordRe.lastIndex = 0;
    const first = wordRe.exec(line);
    if (first && AUXILIARIES.has(first[0].toLowerCase())) {
      pushToken(tokens, first[0], 'inversion', first.index, first.index + first[0].length);
    }
  }

  return tokens.sort((a, b) => a.start - b.start);
}

/** Map a HighlightRole → Tailwind semantic class. Pure presentation lookup. */
export function highlightRoleClass(role: HighlightRole): string {
  switch (role) {
    case 'aux':         return 'text-destructive font-semibold';
    case 'ending':      return 'text-destructive';
    case 'base':        return 'text-primary';
    case 'time':        return 'text-accent-foreground bg-accent/30 px-1 rounded';
    case 'contraction': return 'text-warning';
    case 'inversion':   return 'text-primary underline';
    case 'subject':     return 'text-foreground/80';
    case 'object':      return 'text-foreground/80';
    default:            return 'text-foreground';
  }
}
