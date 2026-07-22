// Lightweight, hub-aware lesson quality gate run BEFORE save.
// Validates structure, slide-count target, reading-level alignment to CEFR,
// and required-type coverage. Returns issues + verdict; the creator UI can
// surface warnings via toast and the persist hook can block on hard errors.
//
// Designed to operate on the in-memory slide arrays produced by
// generate-ppp-slides (Playground / Academy / Success shapes), NOT on the
// abstract QALesson shape used by `src/qa/` (which targets a different
// downstream pipeline).

export type LessonHub = 'playground' | 'academy' | 'success';
export type LessonVerdict = 'pass' | 'warn' | 'block';
export type LessonIssueSeverity = 'block' | 'warn' | 'info';

export interface LessonQualityIssue {
  code: string;
  severity: LessonIssueSeverity;
  message: string;
  /** Optional slide index for UI deep-link. */
  slideIndex?: number;
}

export interface LessonQualityScorecard {
  structure: number;       // 0–100
  reading_level: number;   // 0–100
  coverage: number;        // 0–100
  rubric: number;          // 0–100
}

export interface LessonQualityReport {
  verdict: LessonVerdict;
  issues: LessonQualityIssue[];
  scorecard: LessonQualityScorecard;
  overall: number;         // 0–100
  slide_count: number;
  expected_slide_count: { min: number; max: number };
}

export interface LessonQualityInput {
  slides: any[];
  hub: LessonHub;
  cefr?: string;
  blueprint?: {
    vocabulary?: string[];
    grammar?: string;
    target_phonics?: any;
    learning_objective?: string;
  } | null;
}

/** CEFR → max average word length / sentence length budget. */
const CEFR_BUDGET: Record<string, { maxAvgSentenceWords: number; maxAvgWordLen: number }> = {
  'pre-a1': { maxAvgSentenceWords: 4, maxAvgWordLen: 4.2 },
  a1: { maxAvgSentenceWords: 8, maxAvgWordLen: 4.5 },
  a2: { maxAvgSentenceWords: 12, maxAvgWordLen: 4.8 },
  b1: { maxAvgSentenceWords: 16, maxAvgWordLen: 5.2 },
  b2: { maxAvgSentenceWords: 22, maxAvgWordLen: 5.6 },
  c1: { maxAvgSentenceWords: 30, maxAvgWordLen: 6.0 },
};

/** Hub-specific slide-count targets (must align with generate-ppp-slides). */
const HUB_SLIDE_TARGET: Record<LessonHub, { min: number; max: number; ideal: number }> = {
  playground: { min: 9, max: 22, ideal: 17 },
  academy: { min: 24, max: 32, ideal: 28 },
  success: { min: 24, max: 32, ideal: 28 },
};

/** Slide types each hub MUST contain at least one of. */
const HUB_REQUIRED_TYPES: Record<LessonHub, string[]> = {
  playground: ['intro', 'lesson_summary'],
  academy: ['intro', 'vocab', 'reading_passage', 'lesson_summary'],
  success: ['intro', 'vocab', 'reading_passage', 'lesson_summary'],
};

/** Hub-specific 7-block ordering for rubric alignment. */
const HUB_BLOCK_ORDER: Partial<Record<LessonHub, string[]>> = {
  academy: ['warmup', 'vocab', 'reading', 'grammar', 'practice', 'interactive', 'speaking'],
  success: ['warmup', 'vocab', 'context', 'functional', 'practice', 'simulation', 'output'],
};

function extractText(slide: any): string {
  const buckets: string[] = [];
  for (const key of ['title', 'subtitle', 'text', 'passage', 'transcript', 'prompt', 'question', 'statement', 'instruction', 'definition', 'example', 'rule', 'takeaway', 'situation', 'task']) {
    const v = (slide as any)?.[key];
    if (typeof v === 'string') buckets.push(v);
  }
  if (Array.isArray(slide?.options)) buckets.push(slide.options.filter((o: any) => typeof o === 'string').join(' '));
  if (Array.isArray(slide?.examples)) buckets.push(slide.examples.filter((o: any) => typeof o === 'string').join(' '));
  if (Array.isArray(slide?.pages)) {
    for (const p of slide.pages) if (typeof p?.text === 'string') buckets.push(p.text);
  }
  return buckets.join(' ').trim();
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/).filter(Boolean);
}

function avgSentenceWords(text: string): number {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (sentences.length === 0) return 0;
  const total = sentences.reduce((n, s) => n + tokenize(s).length, 0);
  return total / sentences.length;
}

function avgWordLen(text: string): number {
  const toks = tokenize(text);
  if (toks.length === 0) return 0;
  return toks.reduce((n, w) => n + w.length, 0) / toks.length;
}

export function runLessonQualityCheck(input: LessonQualityInput): LessonQualityReport {
  const { slides, hub, cefr, blueprint } = input;
  const issues: LessonQualityIssue[] = [];
  const slide_count = Array.isArray(slides) ? slides.length : 0;
  const target = HUB_SLIDE_TARGET[hub];

  // ── 1. STRUCTURE: slide count + required types + block order ──────────
  let structureScore = 100;
  if (slide_count === 0) {
    issues.push({ code: 'NO_SLIDES', severity: 'block', message: 'Lesson has zero slides.' });
    structureScore = 0;
  } else if (slide_count < target.min) {
    issues.push({
      code: 'SLIDE_COUNT_BELOW_MIN',
      severity: 'block',
      message: `Only ${slide_count} slides — need ≥${target.min} for a ${hub} lesson.`,
    });
    structureScore -= 40;
  } else if (slide_count > target.max) {
    issues.push({
      code: 'SLIDE_COUNT_ABOVE_MAX',
      severity: 'warn',
      message: `${slide_count} slides exceeds the ${hub} target band (${target.min}-${target.max}).`,
    });
    structureScore -= 10;
  }

  const presentTypes = new Set(slides.map((s) => String(s?.type || '')));
  let coverageScore = 100;
  const missingTypes = HUB_REQUIRED_TYPES[hub].filter((t) => !presentTypes.has(t));
  if (missingTypes.length > 0) {
    issues.push({
      code: 'MISSING_REQUIRED_TYPES',
      severity: missingTypes.includes('intro') || missingTypes.includes('lesson_summary') ? 'block' : 'warn',
      message: `Missing required slide types: ${missingTypes.join(', ')}`,
    });
    coverageScore -= 25 * missingTypes.length;
  }

  // Block order (academy / success only)
  const blockOrder = HUB_BLOCK_ORDER[hub];
  if (blockOrder) {
    const seen: string[] = [];
    for (const s of slides) {
      const b = String(s?.block || '');
      if (b && seen[seen.length - 1] !== b) seen.push(b);
    }
    const orderIdx = seen.map((b) => blockOrder.indexOf(b)).filter((i) => i >= 0);
    for (let i = 1; i < orderIdx.length; i++) {
      if (orderIdx[i] < orderIdx[i - 1]) {
        issues.push({
          code: 'BLOCK_OUT_OF_ORDER',
          severity: 'warn',
          message: `Blocks out of canonical order: ${seen.join(' → ')}`,
        });
        structureScore -= 15;
        break;
      }
    }
    const missingBlocks = blockOrder.filter((b) => !seen.includes(b));
    if (missingBlocks.length > 0) {
      issues.push({
        code: 'MISSING_REQUIRED_BLOCKS',
        severity: 'warn',
        message: `Missing required blocks: ${missingBlocks.join(', ')}`,
      });
      structureScore -= 10 * missingBlocks.length;
    }
  }

  // ── 2. READING LEVEL: avg sentence + word length vs CEFR budget ───────
  const cefrKey = String(cefr || '').toLowerCase();
  const budget = CEFR_BUDGET[cefrKey] || CEFR_BUDGET.a2;
  let readingScore = 100;
  let overSentenceCount = 0;
  let overWordCount = 0;
  slides.forEach((s, idx) => {
    const text = extractText(s);
    if (text.length < 8) return; // skip tiny / image-only slides
    const asw = avgSentenceWords(text);
    const awl = avgWordLen(text);
    if (asw > budget.maxAvgSentenceWords * 1.25) {
      overSentenceCount += 1;
      if (overSentenceCount <= 3) {
        issues.push({
          code: 'SENTENCE_TOO_LONG_FOR_CEFR',
          severity: 'warn',
          message: `Slide ${idx + 1}: avg sentence ${asw.toFixed(1)} words exceeds ${cefr || 'A2'} budget (${budget.maxAvgSentenceWords}).`,
          slideIndex: idx,
        });
      }
    }
    if (awl > budget.maxAvgWordLen * 1.2) {
      overWordCount += 1;
      if (overWordCount <= 3) {
        issues.push({
          code: 'WORDS_TOO_LONG_FOR_CEFR',
          severity: 'info',
          message: `Slide ${idx + 1}: avg word length ${awl.toFixed(1)} chars feels above ${cefr || 'A2'}.`,
          slideIndex: idx,
        });
      }
    }
  });
  readingScore -= Math.min(70, overSentenceCount * 8 + overWordCount * 3);
  if (readingScore < 0) readingScore = 0;

  // ── 3. RUBRIC: blueprint adherence — vocab recycling + objective ──────
  let rubricScore = 100;
  const allText = slides.map(extractText).join(' ').toLowerCase();
  const vocab = (blueprint?.vocabulary ?? []).map((v) => String(v || '').trim().toLowerCase()).filter(Boolean);
  if (vocab.length > 0) {
    const under: string[] = [];
    for (const v of vocab) {
      const matches = allText.match(new RegExp(`\\b${v.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'g'));
      const count = matches ? matches.length : 0;
      if (count < 3) under.push(`${v} (${count}×)`);
    }
    if (under.length > 0) {
      issues.push({
        code: 'VOCAB_UNDER_RECYCLED',
        severity: under.length >= Math.ceil(vocab.length / 2) ? 'warn' : 'info',
        message: `Target vocab recycled <3×: ${under.slice(0, 5).join(', ')}${under.length > 5 ? '…' : ''}`,
      });
      rubricScore -= Math.min(40, under.length * 8);
    }
  }
  if (blueprint?.learning_objective) {
    const last = slides[slides.length - 1];
    if (last && String(last?.type || '') !== 'lesson_summary') {
      issues.push({
        code: 'NO_FINAL_SUMMARY',
        severity: 'warn',
        message: 'Lesson does not end with a lesson_summary slide aligned to the objective.',
      });
      rubricScore -= 15;
    }
  }

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const scorecard: LessonQualityScorecard = {
    structure: clamp(structureScore),
    reading_level: clamp(readingScore),
    coverage: clamp(coverageScore),
    rubric: clamp(rubricScore),
  };
  const overall = clamp((scorecard.structure + scorecard.reading_level + scorecard.coverage + scorecard.rubric) / 4);

  const hasBlock = issues.some((i) => i.severity === 'block');
  const hasWarn = issues.some((i) => i.severity === 'warn');
  const verdict: LessonVerdict = hasBlock ? 'block' : hasWarn ? 'warn' : 'pass';

  return {
    verdict,
    issues,
    scorecard,
    overall,
    slide_count,
    expected_slide_count: { min: target.min, max: target.max },
  };
}

/** Pretty single-line summary for toast messages. */
export function summarizeQualityReport(r: LessonQualityReport): string {
  const blocks = r.issues.filter((i) => i.severity === 'block').length;
  const warns = r.issues.filter((i) => i.severity === 'warn').length;
  if (r.verdict === 'pass') return `Quality ${r.overall}/100 — all checks passed.`;
  if (r.verdict === 'warn') return `Quality ${r.overall}/100 — ${warns} warning${warns === 1 ? '' : 's'}.`;
  return `Quality ${r.overall}/100 — ${blocks} blocker${blocks === 1 ? '' : 's'}, ${warns} warning${warns === 1 ? '' : 's'}.`;
}
