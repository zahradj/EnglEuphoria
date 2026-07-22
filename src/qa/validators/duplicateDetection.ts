import type { QAIssue, QALesson } from '../types';
import { words } from '../util/text';

export function validateDuplicateDetection(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const activities = lesson.slides.flatMap((s) => s.activities ?? []);

  // Fingerprint = type + sorted vocab + sorted grammar
  const fingerprints = new Map<string, string[]>();
  for (const a of activities) {
    const fp = [
      a.type,
      [...(a.target_vocab_used ?? [])].sort().join('|'),
      [...(a.grammar_targets_used ?? [])].sort().join('|'),
    ].join('::');
    const arr = fingerprints.get(fp) ?? [];
    arr.push(a.id);
    fingerprints.set(fp, arr);
  }
  for (const [fp, ids] of fingerprints) {
    if (ids.length > 1) {
      issues.push({
        code: 'DUPLICATE_ACTIVITY_FINGERPRINT',
        domain: 'duplicate',
        severity: 'warn',
        message: `${ids.length} activities share fingerprint (${fp}).`,
        auto_repairable: true,
      });
    }
  }

  // 5-gram Jaccard similarity across activity prompts
  const prompts = activities
    .map((a) => ({ id: a.id, text: typeof a.content === 'string' ? a.content : JSON.stringify(a.content ?? '') }))
    .filter((p) => p.text.length > 20);

  for (let i = 0; i < prompts.length; i++) {
    for (let j = i + 1; j < prompts.length; j++) {
      const sim = jaccard5gram(prompts[i].text, prompts[j].text);
      if (sim > 0.6) {
        issues.push({
          code: 'DUPLICATE_PROMPT_SIMILARITY',
          domain: 'duplicate',
          severity: 'warn',
          message: `Activities "${prompts[i].id}" and "${prompts[j].id}" are ${(sim * 100).toFixed(0)}% similar.`,
          auto_repairable: true,
        });
      }
    }
  }

  return issues;
}

function jaccard5gram(a: string, b: string): number {
  const A = shingles(a, 5);
  const B = shingles(b, 5);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const s of A) if (B.has(s)) inter++;
  return inter / (A.size + B.size - inter);
}

function shingles(text: string, n: number): Set<string> {
  const ws = words(text);
  const out = new Set<string>();
  for (let i = 0; i <= ws.length - n; i++) out.add(ws.slice(i, i + n).join(' '));
  return out;
}
