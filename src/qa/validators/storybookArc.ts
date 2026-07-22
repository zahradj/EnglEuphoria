// Visual Architect §V4 — storybook lessons must declare a 3–5 beat arc
// (Setup → Problem → Try → Resolution → Coda) BEFORE per-page image prompts
// are written, so each prompt is anchored to a validated narrative step.
//
// Soft + auto-repairable: missing/short arcs trigger a regeneration pass that
// drafts the arc first, then re-emits page prompts.

import type { QAIssue, QALesson, QASlide } from '../types';

const STORYBOOK_KINDS = new Set([
  'storybook',
  'story',
  'story_book',
  'narrative',
  'storybook_page',
  'story_page',
]);

function isStorybookLesson(lesson: QALesson): boolean {
  const k = String((lesson as any).kind ?? (lesson as any).lesson_kind ?? '').toLowerCase();
  if (k.includes('story')) return true;
  const slides = lesson.slides ?? [];
  const storyPages = slides.filter((s: QASlide) =>
    STORYBOOK_KINDS.has(String(s.kind ?? '').toLowerCase()),
  );
  return storyPages.length >= 3;
}

function extractBeats(lesson: QALesson): unknown[] | undefined {
  const top: any = lesson as any;
  const cands =
    top?.storybook?.beats ??
    top?.storybook?.arc ??
    top?.narrative?.beats ??
    top?.narrative?.arc ??
    top?.story?.beats ??
    top?.story?.arc ??
    top?.arc;
  return Array.isArray(cands) ? cands : undefined;
}

function vocabTargets(lesson: QALesson): string[] {
  const top: any = lesson as any;
  const list: any[] =
    top?.vocab ?? top?.target_vocab ?? top?.vocabulary ?? top?.theme?.vocab ?? [];
  return list
    .map((v) => (typeof v === 'string' ? v : v?.word ?? v?.headword))
    .filter((s): s is string => typeof s === 'string' && !!s.trim())
    .map((s) => s.toLowerCase());
}

function castRoles(lesson: QALesson): { lead: string; foil: string } {
  const top: any = lesson as any;
  const cast: any[] = top?.cast ?? top?.characters ?? top?.story?.cast ?? [];
  const names = cast
    .map((c) => (typeof c === 'string' ? c : c?.name))
    .filter((s): s is string => typeof s === 'string' && !!s.trim());
  return { lead: names[0] ?? 'the lead', foil: names[1] ?? 'a friend' };
}

function storyPageCount(lesson: QALesson): number {
  const slides = lesson.slides ?? [];
  return slides.filter((s) =>
    STORYBOOK_KINDS.has(String(s.kind ?? '').toLowerCase()),
  ).length;
}

export function validateStorybookArc(lesson: QALesson): QAIssue[] {
  if (!isStorybookLesson(lesson)) return [];
  const beats = extractBeats(lesson);
  const issues: QAIssue[] = [];
  const vocab = vocabTargets(lesson);

  if (!beats || beats.length < 3) {
    const roles = ['setup', 'problem', 'try', 'resolution', 'coda'] as const;
    const pages = storyPageCount(lesson);
    const slots = Math.min(5, Math.max(3, Math.min(pages || 3, vocab.length || 3)));
    const { lead, foil } = castRoles(lesson);
    const pick = (i: number) => vocab[i % Math.max(vocab.length, 1)] ?? 'target';
    const stems: Record<typeof roles[number], (w: string) => string> = {
      setup: (w) => `${lead} introduces the world and notices "${w}".`,
      problem: (w) => `${lead} faces a problem involving "${w}".`,
      try: (w) => `${lead} and ${foil} try using "${w}" to fix it.`,
      resolution: (w) =>
        `They succeed — recycle "${w}" plus 2 earlier target words to show mastery.`,
      coda: (w) => `${lead} reflects: one short line reusing "${w}".`,
    };
    const cefr = String((lesson as any).cefr ?? (lesson as any).level ?? 'A1').toUpperCase();
    const maxWords = cefr.startsWith('PRE') || cefr === 'A1' ? 10 : cefr === 'A2' ? 14 : 18;
    const draft = roles.slice(0, slots).map((role, i) => {
      const w = pick(i);
      const targets =
        role === 'resolution'
          ? Array.from(new Set([w, pick(i - 1), pick(i - 2), pick(0)])).slice(0, 4)
          : [w];
      // Distribute beats evenly across available story pages.
      const pageIndex = pages ? Math.floor((i * pages) / slots) : i;
      return {
        role,
        page_index: pageIndex,
        characters: [lead, ...(role === 'try' || role === 'resolution' ? [foil] : [])],
        sentence: stems[role](w),
        target_vocab: targets.filter(Boolean),
        max_words: maxWords,
      };
    });
    issues.push({
      code: 'STORY_ARC_UNDECLARED',
      domain: 'narrative',
      severity: 'warn',
      message:
        'Storybook lesson has no declared 3–5 beat arc (Setup → Problem → Try → Resolution → Coda). Image prompts were written without a validated narrative.',
      locator: { path: 'storybook.beats' },
      suggestion:
        'Draft the arc FIRST, then regenerate page image prompts anchored to each beat. Use this scaffold as `storybook.beats` verbatim — keep `role`, `page_index`, and `characters`; rewrite `sentence` (≤14 words, CEFR-appropriate, uses each `target_vocab` word). Resolution MUST recycle ≥3 earlier target words.\n' +
        JSON.stringify(draft, null, 2),
      auto_repairable: true,
    });
    return issues;
  }

  if (beats.length > 6) {
    issues.push({
      code: 'STORY_ARC_TOO_LONG',
      domain: 'narrative',
      severity: 'warn',
      message: `Storybook arc has ${beats.length} beats — exceeds the 3–5 beat contract.`,
      locator: { path: 'storybook.beats' },
      suggestion: 'Compress to 3–5 beats: Setup, Problem, Try, Resolution, Coda.',
      auto_repairable: true,
    });
  }

  // Coverage check: every target vocab word should appear in ≥1 beat sentence.
  if (vocab.length > 0) {
    const beatText = beats
      .map((b: any) => (typeof b === 'string' ? b : b?.sentence ?? b?.text ?? ''))
      .join(' \n ')
      .toLowerCase();
    const missing = vocab.filter((w) => !beatText.includes(w));
    if (missing.length > 0) {
      issues.push({
        code: 'STORY_ARC_VOCAB_GAP',
        domain: 'narrative',
        severity: 'warn',
        message: `Storybook arc does not cover ${missing.length} target word(s): ${missing.slice(0, 6).join(', ')}.`,
        locator: { path: 'storybook.beats' },
        suggestion: `Rewrite beat sentences so every target word appears ≥1×. Missing: ${missing.join(', ')}.`,
        auto_repairable: true,
      });
    }
  }

  return issues;
}
