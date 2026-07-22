import type { DetectiveCase } from './types';
import { DETECTIVE_HUB_PROFILES } from './hubProfiles';

export interface DetectiveIssue { code: string; message: string; severity: 'hard' | 'soft'; id?: string }
export interface DetectiveReport { verdict: 'publish' | 'repair' | 'block'; issues: DetectiveIssue[] }

export function validateDetectiveCase(c: DetectiveCase): DetectiveReport {
  const issues: DetectiveIssue[] = [];
  const p = DETECTIVE_HUB_PROFILES[c.hub];

  if (!c.target_skill || c.target_ref_ids.length === 0) {
    issues.push({ code: 'DETECTIVE_UNBOUND_TARGET', message: 'Case must bind to a ReinforcementTarget', severity: 'hard' });
  }
  if (c.suspects.length !== p.suspects) {
    issues.push({ code: 'DETECTIVE_SUSPECT_COUNT', message: `Hub ${c.hub} requires ${p.suspects} suspects`, severity: 'hard' });
  }
  const culprits = c.suspects.filter((s) => s.is_culprit).length;
  if (culprits !== 1) {
    issues.push({ code: 'DETECTIVE_CULPRIT_COUNT', message: 'Exactly one suspect must be the culprit', severity: 'hard' });
  }
  if (c.question_pool.length !== p.question_pool_size) {
    issues.push({ code: 'DETECTIVE_POOL_SIZE', message: `Hub ${c.hub} requires ${p.question_pool_size} questions in pool`, severity: 'hard' });
  }
  if (c.question_budget !== p.question_budget) {
    issues.push({ code: 'DETECTIVE_BUDGET', message: `Hub ${c.hub} requires budget ${p.question_budget}`, severity: 'hard' });
  }
  if (c.setting_image_url !== null) {
    issues.push({ code: 'DETECTIVE_SETTING_IMAGE_LEAK', message: 'setting_image_url must be null at generation', severity: 'hard' });
  }

  const suspectIds = new Set(c.suspects.map((s) => s.id));
  for (const s of c.suspects) {
    if (s.image_url !== null) {
      issues.push({ code: 'DETECTIVE_SUSPECT_IMAGE_LEAK', message: `${s.id}: image_url must be null`, id: s.id, severity: 'hard' });
    }
    if (!s.alibi || !s.role) {
      issues.push({ code: 'DETECTIVE_SUSPECT_INCOMPLETE', message: `${s.id}: role + alibi required`, id: s.id, severity: 'hard' });
    }
  }

  for (const q of c.question_pool) {
    if (!p.allowed_kinds.includes(q.kind)) {
      issues.push({ code: 'DETECTIVE_KIND_NOT_ALLOWED', message: `${q.id}: kind ${q.kind} not allowed for ${c.hub}`, id: q.id, severity: 'hard' });
    }
    if (!suspectIds.has(q.suspect_id)) {
      issues.push({ code: 'DETECTIVE_QUESTION_DEAD_LINK', message: `${q.id}: suspect_id ${q.suspect_id} unknown`, id: q.id, severity: 'hard' });
    }
    if (!q.target_ref) {
      issues.push({ code: 'DETECTIVE_QUESTION_UNBOUND', message: `${q.id}: missing target_ref`, id: q.id, severity: 'hard' });
    }
    if (!q.reveals || q.reveals.length < 4) {
      issues.push({ code: 'DETECTIVE_REVEAL_EMPTY', message: `${q.id}: reveals must be a useful clue`, id: q.id, severity: 'hard' });
    }
    // Every question must end with '?' — enforce the linguistic form.
    if (!/\?\s*$/.test(q.text)) {
      issues.push({ code: 'DETECTIVE_QUESTION_MALFORMED', message: `${q.id}: text must end with '?'`, id: q.id, severity: 'hard' });
    }
  }

  if (!c.epilogue?.win || !c.epilogue?.lose) {
    issues.push({ code: 'DETECTIVE_EPILOGUE_MISSING', message: 'epilogue.win + epilogue.lose required', severity: 'hard' });
  }

  const hard = issues.some((i) => i.severity === 'hard');
  return { verdict: hard ? 'block' : 'publish', issues };
}
