import type { EscapeRoom, Puzzle } from './types';
import { ESCAPE_HUB_PROFILES } from './hubProfiles';

export interface EscapeIssue { code: string; message: string; door_id?: string; severity: 'hard' | 'soft' }
export interface EscapeReport { verdict: 'publish' | 'repair' | 'block'; issues: EscapeIssue[] }

function tokenCount(p: Puzzle): number {
  switch (p.kind) {
    case 'unscramble': return p.answer.length;
    case 'cloze':      return p.sentence.split(/\s+/).length;
    case 'order':      return p.tokens.length;
    case 'odd_one_out':return p.items.length;
    case 'riddle':     return p.clues.reduce((n, c) => n + c.split(/\s+/).length, 0);
  }
}

export function validateEscapeRoom(room: EscapeRoom): EscapeReport {
  const issues: EscapeIssue[] = [];
  const profile = ESCAPE_HUB_PROFILES[room.hub];

  if (!room.target_skill || room.target_ref_ids.length === 0) {
    issues.push({ code: 'ESCAPE_UNBOUND_TARGET', message: 'Room must bind to a ReinforcementTarget', severity: 'hard' });
  }
  if (room.doors.length !== profile.doors) {
    issues.push({ code: 'ESCAPE_DOOR_COUNT', message: `Hub ${room.hub} requires exactly ${profile.doors} doors`, severity: 'hard' });
  }

  const ids = new Set<string>();
  for (const p of room.doors) {
    if (ids.has(p.id)) issues.push({ code: 'ESCAPE_DUPLICATE_ID', message: `Duplicate door id ${p.id}`, door_id: p.id, severity: 'hard' });
    ids.add(p.id);

    if (!profile.allowed_kinds.includes(p.kind)) {
      issues.push({ code: 'ESCAPE_KIND_NOT_ALLOWED', message: `${p.id}: kind ${p.kind} not allowed for ${room.hub}`, door_id: p.id, severity: 'hard' });
    }
    if (!p.target_ref) {
      issues.push({ code: 'ESCAPE_PUZZLE_UNBOUND', message: `${p.id}: missing target_ref`, door_id: p.id, severity: 'hard' });
    }
    if (tokenCount(p) > profile.max_tokens_per_puzzle) {
      issues.push({ code: 'ESCAPE_PUZZLE_TOO_LONG', message: `${p.id}: exceeds token cap ${profile.max_tokens_per_puzzle}`, door_id: p.id, severity: 'hard' });
    }
    if (p.image_url !== null) {
      issues.push({ code: 'ESCAPE_IMAGE_URL_LEAK', message: `${p.id}: image_url must be null`, door_id: p.id, severity: 'hard' });
    }
    if (!p.hint || !p.solve_feedback) {
      issues.push({ code: 'ESCAPE_FEEDBACK_MISSING', message: `${p.id}: hint + solve_feedback required`, door_id: p.id, severity: 'hard' });
    }

    // Kind-specific integrity.
    if (p.kind === 'cloze' && !p.options.includes(p.answer)) {
      issues.push({ code: 'ESCAPE_CLOZE_ANSWER_MISSING', message: `${p.id}: answer not in options`, door_id: p.id, severity: 'hard' });
    }
    if (p.kind === 'order' && p.tokens.slice().sort().join('|') !== p.answer.slice().sort().join('|')) {
      issues.push({ code: 'ESCAPE_ORDER_MISMATCH', message: `${p.id}: tokens vs answer set mismatch`, door_id: p.id, severity: 'hard' });
    }
    if (p.kind === 'odd_one_out' && !p.items.includes(p.answer)) {
      issues.push({ code: 'ESCAPE_ODD_ANSWER_MISSING', message: `${p.id}: answer not in items`, door_id: p.id, severity: 'hard' });
    }
    if (p.kind === 'unscramble' && p.scrambled.toLowerCase().split('').sort().join('') !== p.answer.toLowerCase().split('').sort().join('')) {
      issues.push({ code: 'ESCAPE_UNSCRAMBLE_MISMATCH', message: `${p.id}: scrambled letters don't match answer`, door_id: p.id, severity: 'hard' });
    }
    if (p.kind === 'riddle' && !p.options.includes(p.answer)) {
      issues.push({ code: 'ESCAPE_RIDDLE_ANSWER_MISSING', message: `${p.id}: answer not in options`, door_id: p.id, severity: 'hard' });
    }
  }

  if (room.final_reward.image_url !== null) {
    issues.push({ code: 'ESCAPE_REWARD_IMAGE_LEAK', message: 'final_reward.image_url must be null', severity: 'hard' });
  }

  const hard = issues.some((i) => i.severity === 'hard');
  return { verdict: hard ? 'block' : 'publish', issues };
}
