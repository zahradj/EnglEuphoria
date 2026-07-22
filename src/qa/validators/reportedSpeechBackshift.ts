// Reported-speech backshift validator (Rule 3).
// HARD-blocks when a `reported_speech` exercise contains
// original→reported pairs that violate the canonical backshift table.

import type { QAIssue, QALesson } from '../types';

// Canonical English backshift table (direct → reported when reporting verb is past).
export const BACKSHIFT_TABLE: Array<{ test: RegExp; required: RegExp; label: string }> = [
  // Present perfect → Past perfect  (check BEFORE present simple so "have/has eaten" doesn't fall into present simple)
  { test: /\b(have|has)\s+(\w+ed|been|gone|done|seen|made|taken|written|eaten|broken|spoken|given)\b/i, required: /\bhad\s+\w+/i, label: 'present_perfect→past_perfect' },
  // Present continuous → Past continuous
  { test: /\b(am|is|are)\s+\w+ing\b/i, required: /\bwas\s+\w+ing|were\s+\w+ing\b/i, label: 'present_continuous→past_continuous' },
  // will → would
  { test: /\bwill\b/i, required: /\bwould\b/i, label: 'will→would' },
  // can → could
  { test: /\bcan\b/i, required: /\bcould\b/i, label: 'can→could' },
  // may → might
  { test: /\bmay\b/i, required: /\bmight\b/i, label: 'may→might' },
  // must → had to
  { test: /\bmust\b/i, required: /\bhad to\b/i, label: 'must→had to' },
  // Past simple → Past perfect ("I went" → "had gone")
  { test: /\b(went|saw|did|ate|made|took|wrote|gave|spoke|broke|came|got|had)\b/i, required: /\bhad\s+\w+/i, label: 'past_simple→past_perfect' },
  // Present simple → Past simple (catch-all, ordered last)
  { test: /\b(am|is|are|do|does|have|has)\b/i, required: /\b(was|were|did|had)\b/i, label: 'present_simple→past_simple' },
];

export function validateReportedSpeechBackshift(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides ?? []) {
    for (const act of slide.activities ?? []) {
      const isReported =
        /reported_speech|backshift/i.test(act.type ?? '') ||
        /reported_speech|backshift/i.test((act as any).grammar_focus ?? '') ||
        /reported_speech/i.test(act.purpose ?? '');
      if (!isReported) continue;

      const pairs = extractPairs(act.content);
      for (const p of pairs) {
        const rule = pickRule(p.original);
        if (!rule) continue;
        if (!rule.required.test(p.reported)) {
          issues.push({
            code: 'REPORTED_SPEECH_BACKSHIFT_INVALID',
            domain: 'language',
            severity: 'block',
            message: `Reported-speech pair fails ${rule.label}: original="${p.original}" reported="${p.reported}".`,
            locator: { slideId: slide.id, activityId: act.id },
            suggestion: 'Apply canonical backshift (present→past, will→would, can→could, may→might, must→had to, present perfect→past perfect).',
            auto_repairable: true,
          });
        }
      }
    }
  }

  return issues;
}

function pickRule(original: string) {
  for (const r of BACKSHIFT_TABLE) if (r.test.test(original)) return r;
  return null;
}

interface Pair { original: string; reported: string }
function extractPairs(content: any): Pair[] {
  if (!content) return [];
  const pairs: Pair[] = [];
  const visit = (n: any) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(visit);
    const original = n.original ?? n.direct ?? n.source ?? n.prompt;
    const reported = n.reported ?? n.indirect ?? n.target ?? n.answer;
    if (typeof original === 'string' && typeof reported === 'string') {
      pairs.push({ original, reported });
    }
    for (const v of Object.values(n)) visit(v);
  };
  visit(content);
  return pairs;
}
