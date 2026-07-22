// Pulls plain text out of an unknown slide shape so engines can scan it.

import type { Slide } from '../types';

const TEXT_KEYS = [
  'title', 'subtitle', 'text', 'body', 'prompt', 'question', 'instruction',
  'description', 'caption', 'explanation', 'sentence', 'answer',
];

export function extractSlideText(slide: Slide): string {
  const out: string[] = [];
  const walk = (node: unknown, depth = 0) => {
    if (depth > 6 || node == null) return;
    if (typeof node === 'string') { out.push(node); return; }
    if (Array.isArray(node)) { node.forEach((n) => walk(n, depth + 1)); return; }
    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (typeof v === 'string' && (TEXT_KEYS.includes(k) || k.endsWith('_text'))) {
          out.push(v);
        } else if (v && typeof v === 'object') {
          walk(v, depth + 1);
        }
      }
    }
  };
  walk(slide);
  return out.join(' \n ').trim();
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function countWords(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

export function countClauses(s: string): number {
  // Heuristic: 1 + commas + coordinators + subordinators inside the sentence.
  const coord = (s.match(/\b(?:and|but|or|so|yet)\b/gi) || []).length;
  const sub = (s.match(/\b(?:because|although|though|while|whereas|if|unless|when|whenever|since|after|before|until|that|which|who)\b/gi) || []).length;
  const commas = (s.match(/,/g) || []).length;
  return 1 + Math.min(coord + sub, 4) + Math.floor(commas / 2);
}

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  const groups = w.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, groups?.length ?? 1);
}
