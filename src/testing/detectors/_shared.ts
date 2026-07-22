// Shared detector helpers and a common slide-extraction shim that tolerates
// the multiple lesson shapes the orchestrator may emit.
import type { DetectorFailure } from '../types';

export interface NormalizedSlide {
  index: number;
  type?: string;
  title?: string;
  text?: string;
  activityType?: string;
  vocabulary?: string[];
  grammar?: string[];
  speakingPrompt?: string;
  raw: any;
}

export interface NormalizedLesson {
  hub?: string;
  cefr?: string;
  slides: NormalizedSlide[];
  activities: Array<{ index: number; type: string; raw: any }>;
  raw: any;
}

export function normalizeLesson(lesson: any): NormalizedLesson {
  const rawSlides: any[] =
    lesson?.slides ??
    lesson?.content?.slides ??
    lesson?.context?.activities ??
    lesson?.activities ??
    [];

  const slides: NormalizedSlide[] = rawSlides.map((s, i) => ({
    index: i,
    type: s?.type ?? s?.kind ?? s?.slide_type,
    title: s?.title ?? s?.heading,
    text: pickText(s),
    activityType: s?.activity_type ?? s?.activityType ?? s?.type,
    vocabulary: extractVocab(s),
    grammar: extractGrammar(s),
    speakingPrompt: s?.speaking_prompt ?? s?.speakingPrompt,
    raw: s,
  }));

  const activities = slides
    .filter((s) => !!s.activityType)
    .map((s) => ({ index: s.index, type: s.activityType!, raw: s.raw }));

  return {
    hub: lesson?.hub ?? lesson?.context?.hub,
    cefr: lesson?.cefr ?? lesson?.cefr_level ?? lesson?.context?.cefr,
    slides,
    activities,
    raw: lesson,
  };
}

function pickText(s: any): string {
  const parts: string[] = [];
  for (const k of ['text', 'content', 'prompt', 'body', 'instructions', 'narration']) {
    if (typeof s?.[k] === 'string') parts.push(s[k]);
  }
  return parts.join(' ').trim();
}

function extractVocab(s: any): string[] {
  const v = s?.vocabulary ?? s?.target_vocab ?? s?.vocab ?? [];
  if (Array.isArray(v)) {
    return v.map((x: any) => (typeof x === 'string' ? x : x?.word ?? x?.term ?? '')).filter(Boolean);
  }
  return [];
}

function extractGrammar(s: any): string[] {
  const g = s?.grammar ?? s?.grammar_focus ?? s?.target_grammar ?? [];
  if (Array.isArray(g)) return g.map((x: any) => String(x?.structure ?? x?.name ?? x)).filter(Boolean);
  return [];
}

export function fail(
  detector: string,
  category: DetectorFailure['category'],
  message: string,
  opts: Partial<Omit<DetectorFailure, 'detector' | 'category' | 'message'>> = {},
): DetectorFailure {
  return {
    detector,
    category,
    severity: opts.severity ?? 'warn',
    slideIndex: opts.slideIndex,
    evidence: opts.evidence,
    message,
  };
}
