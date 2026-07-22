import type { GovernanceIssue, Slide } from '../types';
import { extractSlideText } from '../util/extractText';

const PLACEHOLDER_PATTERNS: { code: string; re: RegExp; message: string }[] = [
  { code: 'LOREM',          re: /\blorem\s+ipsum\b/i,                            message: 'Lorem ipsum placeholder text.' },
  { code: 'STUB_TEXT',      re: /\b(?:new sentence here|sample text|placeholder|tbd|todo|fixme)\b/i, message: 'Placeholder/stub text.' },
  { code: 'ELLIPSIS_ONLY',  re: /^\s*\.{3,}\s*$/,                                message: 'Slide content is only an ellipsis.' },
  { code: 'BRACKETS_LEFT',  re: /\[\s*(?:insert|add|fill in)[^\]]*\]/i,          message: 'Unfilled bracket placeholder.' },
];

export function validateQuality(slide: Slide, slideIndex?: number): GovernanceIssue[] {
  const issues: GovernanceIssue[] = [];
  const text = extractSlideText(slide);

  // Empty prompt — error.
  if (!text || text.trim().length < 3) {
    issues.push({
      engine: 'quality',
      severity: 'error',
      code: 'EMPTY_SLIDE',
      message: 'Slide has no usable text.',
      slideIndex,
    });
    return issues;
  }

  // Placeholder text — error.
  for (const p of PLACEHOLDER_PATTERNS) {
    if (p.re.test(text)) {
      issues.push({
        engine: 'quality', severity: 'error', code: p.code, message: p.message, slideIndex,
      });
    }
  }

  // Incomplete sentence ending — warning.
  if (/[A-Za-z]\s*$/.test(text) && text.length > 40 && !/[.!?…]$/.test(text.trim())) {
    issues.push({
      engine: 'quality',
      severity: 'warning',
      code: 'INCOMPLETE_SENTENCE',
      message: 'Slide text appears to end without final punctuation.',
      slideIndex,
    });
  }

  // MCQ integrity — if options/correct present, validate.
  const opts = (slide.options || slide.choices || slide?.content?.options) as unknown;
  const correct = (slide.correct ?? slide.correctIndex ?? slide?.content?.correct) as unknown;
  if (Array.isArray(opts)) {
    if (opts.length < 2) {
      issues.push({
        engine: 'quality', severity: 'error', code: 'MCQ_TOO_FEW_OPTIONS',
        message: 'MCQ requires at least 2 options.', slideIndex,
      });
    }
    if (typeof correct === 'number' && (correct < 0 || correct >= opts.length)) {
      issues.push({
        engine: 'quality', severity: 'error', code: 'MCQ_BAD_KEY',
        message: `MCQ correct index ${correct} is out of range.`, slideIndex,
      });
    }
    const dup = new Set<string>();
    for (const o of opts) {
      const k = String(o).trim().toLowerCase();
      if (dup.has(k)) {
        issues.push({
          engine: 'quality', severity: 'error', code: 'MCQ_DUPLICATE_OPTIONS',
          message: 'MCQ has duplicate options.', slideIndex,
        });
        break;
      }
      dup.add(k);
    }
  }

  return issues;
}

/** Detects duplicate exercises across the lesson. */
export function validateLessonQuality(slides: Slide[]): GovernanceIssue[] {
  const seen = new Map<string, number>();
  const issues: GovernanceIssue[] = [];
  slides.forEach((s, i) => {
    const sig = JSON.stringify({ t: s.slide_type || s.type, q: s.prompt || s.question || s.title })
      .toLowerCase();
    if (sig.length < 20) return;
    const prev = seen.get(sig);
    if (prev !== undefined) {
      issues.push({
        engine: 'quality',
        severity: 'error',
        code: 'DUPLICATE_SLIDE',
        message: `Slide ${i} duplicates slide ${prev}.`,
        slideIndex: i,
      });
    } else {
      seen.set(sig, i);
    }
  });
  return issues;
}
