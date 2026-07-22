// Resolves cross-engine conflicts using the priority matrix.

import type {
  ConflictResolutionLog,
  EngineProposal,
} from './types';
import { isHardTier, tierRank } from './priorityMatrix';

export interface ResolutionResult<T = unknown> {
  winner: EngineProposal<T>;
  log: ConflictResolutionLog;
}

/**
 * Pick the winning proposal for a single field.
 * Rule:
 *  - Lowest tier rank wins.
 *  - If any HARD tier proposes a value, no soft tier can override it.
 *  - Ties broken by earliest proposal order.
 */
export function resolveField<T>(
  proposals: EngineProposal<T>[],
): ResolutionResult<T> {
  if (proposals.length === 0) {
    throw new Error('conflictResolver: empty proposal set');
  }

  const hardProposals = proposals.filter((p) => isHardTier(p.tier) || p.hard);
  const pool = hardProposals.length > 0 ? hardProposals : proposals;

  const sorted = [...pool].sort((a, b) => tierRank(a.tier) - tierRank(b.tier));
  const winner = sorted[0];

  const losers = proposals
    .filter((p) => p !== winner)
    .map((p) => ({
      source: p.source,
      tier: p.tier,
      rationale: p.rationale,
    }));

  return {
    winner,
    log: {
      field: winner.field,
      winningSource: winner.source,
      winningTier: winner.tier,
      losers,
      resolvedAt: new Date().toISOString(),
    },
  };
}

/** Resolve all conflicts grouped by field. */
export function resolveAll(
  proposals: EngineProposal[],
): { winners: EngineProposal[]; logs: ConflictResolutionLog[] } {
  const byField = new Map<string, EngineProposal[]>();
  for (const p of proposals) {
    const arr = byField.get(p.field) ?? [];
    arr.push(p);
    byField.set(p.field, arr);
  }

  const winners: EngineProposal[] = [];
  const logs: ConflictResolutionLog[] = [];
  for (const [, group] of byField) {
    const { winner, log } = resolveField(group);
    winners.push(winner);
    if (group.length > 1) logs.push(log);
  }
  return { winners, logs };
}
