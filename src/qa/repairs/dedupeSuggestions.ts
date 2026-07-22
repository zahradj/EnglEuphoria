// Cross-validator suggestion deduper.
//
// Multiple validators frequently emit overlapping repair hints for the same
// slide/activity (e.g. STORY_ARC_UNDECLARED + STORY_ARC_VOCAB_GAP both ask the
// model to "rewrite beats to cover target vocab"). Feeding all of them into
// the repair prompt wastes tokens and produces conflicting instructions.
//
// `dedupeSuggestions` collapses issues that share a locator + suggestion
// fingerprint, preserves the highest severity, and unions issue codes so
// telemetry still records every validator that fired.

import type { QAIssue } from '../types';

function locatorKey(loc?: QAIssue['locator']): string {
  if (!loc) return '';
  return [loc.slideId ?? '', loc.activityId ?? '', loc.path ?? ''].join('|');
}

function suggestionFingerprint(s?: string): string {
  if (!s) return '';
  // Strip JSON scaffolds and whitespace so prose-equivalent hints collapse.
  return s
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\{[\s\S]*?\}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 160);
}

const SEVERITY_RANK: Record<QAIssue['severity'], number> = {
  info: 0,
  warn: 1,
  block: 2,
};

export interface DedupedIssue extends QAIssue {
  merged_codes: string[];
}

export function dedupeSuggestions(issues: QAIssue[]): DedupedIssue[] {
  const buckets = new Map<string, DedupedIssue>();
  for (const issue of issues) {
    const key = `${locatorKey(issue.locator)}::${suggestionFingerprint(issue.suggestion)}`;
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, { ...issue, merged_codes: [issue.code] });
      continue;
    }
    if (!existing.merged_codes.includes(issue.code)) {
      existing.merged_codes.push(issue.code);
    }
    if (SEVERITY_RANK[issue.severity] > SEVERITY_RANK[existing.severity]) {
      existing.severity = issue.severity;
      existing.message = issue.message;
      existing.code = issue.code;
    }
    if (!existing.auto_repairable && issue.auto_repairable) {
      existing.auto_repairable = true;
    }
  }
  return [...buckets.values()];
}
