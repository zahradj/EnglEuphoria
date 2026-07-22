// Drill Engine — Phase 5.
// Given a seed sentence + grammar target, deterministically produce a
// transformation chain: negative + yes/no question + short answers,
// plus substitution / rapid-fire / echo variants.
//
// Pure TS. No randomness, no AI calls. Used by the activity generator to
// guarantee every grammar target ships with auto-generated drill follow-ups
// instead of one isolated example.

import type { GrammarTarget, DrillSpec, DrillType } from '../types';
import { buildDrill } from './catalog';

export interface SeedSentence {
  text: string;             // e.g. "She works at the bakery on Mondays."
  subject?: string;         // "She"
  aux?: string | null;      // "does" if dummy aux is needed
  base_verb?: string;       // "work"
  is_be?: boolean;          // copular `be` (am/is/are/was/were)
}

export interface TransformChain {
  positive: string;
  negative: string;
  question: string;
  short_answer_yes: string;
  short_answer_no: string;
}

const CONTRACTIONS_NEG: Record<string, string> = {
  is: "isn't", are: "aren't", was: "wasn't", were: "weren't", am: "am not",
  do: "don't", does: "doesn't", did: "didn't",
  have: "haven't", has: "hasn't", had: "hadn't",
  will: "won't", would: "wouldn't", can: "can't", could: "couldn't",
  should: "shouldn't", might: "mightn't", must: "mustn't",
  shall: "shan't",
};

const SUBJECT_AUX_DEFAULT: Record<string, string> = {
  i: 'do', you: 'do', we: 'do', they: 'do',
  he: 'does', she: 'does', it: 'does',
};

function findAux(text: string): { aux: string; rest: string } | null {
  const m = text.trim().match(/^(\w+)\s+(\w+)\s+(.*)$/);
  if (!m) return null;
  const [, subj, second, rest] = m;
  const cand = second.toLowerCase();
  if (CONTRACTIONS_NEG[cand]) {
    return { aux: second, rest: `${subj} ${rest}` };
  }
  return null;
}

/**
 * Build a transformation chain from a seed sentence.
 * Deterministic, English-only. Falls back to a template if parsing fails
 * (caller should treat fallback as a SOFT signal to regenerate).
 */
export function buildTransformChain(seed: SeedSentence): TransformChain {
  const positive = seed.text.trim().replace(/\.+$/, '') + '.';
  const lower = positive.toLowerCase();

  // Case A: sentence already contains a recognizable aux/modal/copula.
  const withAux = findAux(positive);
  if (withAux) {
    const auxLower = withAux.aux.toLowerCase();
    const neg = CONTRACTIONS_NEG[auxLower] ?? `${withAux.aux} not`;
    const subjMatch = positive.match(/^(\w+)\s/);
    const subj = subjMatch ? subjMatch[1] : 'They';
    const restAfterAux = positive.slice((subjMatch?.[0] ?? '').length + withAux.aux.length).trim();
    return {
      positive,
      negative: `${subj} ${neg} ${restAfterAux}`.replace(/\s+\./, '.'),
      question: `${capitalize(withAux.aux)} ${subj.toLowerCase()} ${restAfterAux}`.replace(/\.$/, '?'),
      short_answer_yes: `Yes, ${subj.toLowerCase()} ${auxLower}.`,
      short_answer_no: `No, ${subj.toLowerCase()} ${neg}.`,
    };
  }

  // Case B: simple-present without explicit aux — inject do/does.
  const subjMatch = positive.match(/^(\w+)/);
  const subj = subjMatch ? subjMatch[1] : 'They';
  const subjLower = subj.toLowerCase();
  const aux = SUBJECT_AUX_DEFAULT[subjLower] ?? 'do';
  const neg = CONTRACTIONS_NEG[aux];
  // crude "base verb" extraction: strip 3rd-person -s on the second word
  const parts = positive.split(/\s+/);
  if (parts.length >= 2) {
    parts[1] = parts[1].replace(/s$/i, '');
  }
  const stripped = parts.join(' ');
  const rest = stripped.split(/\s+/).slice(1).join(' ');
  return {
    positive,
    negative: `${subj} ${neg} ${rest}`,
    question: `${capitalize(aux)} ${subjLower} ${rest}`.replace(/\.$/, '?'),
    short_answer_yes: `Yes, ${subjLower} ${aux}.`,
    short_answer_no: `No, ${subjLower} ${neg}.`,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generate the standard 4-drill follow-up bundle for a grammar target:
 * transformation + negative_conversion + question_conversion + substitution.
 */
export function generateDrillBundle(target: GrammarTarget): DrillSpec[] {
  const types: DrillType[] = [
    'transformation',
    'negative_conversion',
    'question_conversion',
    'substitution',
  ];
  return types.map((t, i) => buildDrill(t, target, i));
}
