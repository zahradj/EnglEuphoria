import type { QALesson, QASlide } from '../types';

export function allText(lesson: QALesson): string {
  const out: string[] = [];
  if (lesson.title) out.push(lesson.title);
  if (lesson.communication_objective) out.push(lesson.communication_objective);
  for (const s of lesson.slides) {
    out.push(...slideText(s));
  }
  return out.join('\n');
}

export function slideText(slide: QASlide): string[] {
  const out: string[] = [];
  if (slide.title) out.push(slide.title);
  if (slide.body_text) out.push(slide.body_text);
  if (slide.grammar_explanation) out.push(slide.grammar_explanation);
  if (slide.examples) out.push(...slide.examples);
  for (const a of slide.activities ?? []) {
    if (a.content) {
      if (typeof a.content === 'string') out.push(a.content);
      else if (typeof a.content === 'object') out.push(JSON.stringify(a.content));
    }
  }
  return out;
}

export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z'-]+/g) ?? [];
}

export function countClauses(sentence: string): number {
  // Cheap proxy: clauses ≈ 1 + commas + occurrences of subordinators
  const subs = (sentence.match(/\b(because|although|though|while|whereas|if|when|since|after|before|that|which|who)\b/gi) ?? []).length;
  const commas = (sentence.match(/,/g) ?? []).length;
  return 1 + Math.min(subs + Math.floor(commas / 2), 6);
}

export function fleschKincaidGrade(text: string): number {
  const sents = sentences(text);
  const ws = words(text);
  if (sents.length === 0 || ws.length === 0) return 0;
  const syllables = ws.reduce((sum, w) => sum + estimateSyllables(w), 0);
  const wordsPerSentence = ws.length / sents.length;
  const syllablesPerWord = syllables / ws.length;
  return 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
}

function estimateSyllables(word: string): number {
  const w = word.toLowerCase().replace(/e\b/, '');
  const m = w.match(/[aeiouy]+/g);
  return Math.max(1, m?.length ?? 1);
}

export function hashContent(input: string): string {
  // FNV-1a 32-bit, fast and dependency-free
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
