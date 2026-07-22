// Stabilization repair pipeline.
// Bounded, planner-safe transformations applied to LessonContext.activities.
// Cannot raise CEFR, cannot add forbidden grammar — repairs operate on
// already-generated activities (re-order, compress, swap, inject).

import type { LessonContext } from '@/orchestrator/types';
import type { ActivitySpec } from '@/activities/types';
import type { RepairOp, ValidatorResult } from './types';
import { CANONICAL_ORDER, normalizeStage } from './stageNormalize';

function nowIso() {
  return new Date().toISOString();
}

function compressText(s: string, maxTokens: number): string {
  const words = (s ?? '').split(/\s+/);
  if (words.length <= maxTokens) return s;
  return words.slice(0, maxTokens).join(' ') + '…';
}

function uniqueId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

const STAGE_ORDER = CANONICAL_ORDER;

export function applyRepairs(
  ctx: LessonContext,
  results: ValidatorResult[],
): { ctx: LessonContext; ops: RepairOp[] } {
  const ops: RepairOp[] = [];
  let activities = [...ctx.activities];

  const hints = new Set(
    results
      .flatMap((r) => r.issues)
      .map((i) => i.repairHint)
      .filter(Boolean) as string[],
  );

  // 1. Re-sequence by stage order if regressions exist.
  if (hints.has('resequence_activities')) {
    const before = activities.map((a) => a.stage).join('>');
    activities = [...activities].sort((a, b) => {
      const ra = STAGE_ORDER.indexOf(normalizeStage(a.stage as string) ?? ('' as never));
      const rb = STAGE_ORDER.indexOf(normalizeStage(b.stage as string) ?? ('' as never));
      return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
    });
    ops.push({
      kind: 'resequence_activities',
      appliedAt: nowIso(),
      before,
      after: activities.map((a) => a.stage).join('>'),
      reason: 'GRR scaffolding regression detected.',
    });
  }

  // 2. Swap consecutive duplicates by rotating one neighbour.
  if (hints.has('swap_repetitive_activity')) {
    for (let i = 2; i < activities.length; i++) {
      if (
        activities[i].type === activities[i - 1].type &&
        activities[i - 1].type === activities[i - 2].type
      ) {
        const swapWith = activities.findIndex(
          (a, idx) => idx > i && a.type !== activities[i].type,
        );
        if (swapWith !== -1) {
          const before = `${activities[i].type}@${i}↔${activities[swapWith].type}@${swapWith}`;
          [activities[i], activities[swapWith]] = [activities[swapWith], activities[i]];
          ops.push({
            kind: 'swap_repetitive_activity',
            appliedAt: nowIso(),
            before,
            after: `${activities[i].type}@${i}`,
            reason: 'Consecutive identical activity types.',
          });
        }
      }
    }
  }

  // 3. Compress over-long instructions.
  if (hints.has('compress_instructions')) {
    activities = activities.map((a) => {
      const content = { ...(a.content as Record<string, unknown>) };
      const instr = (content.instructions ?? content.prompt) as string | undefined;
      if (typeof instr === 'string' && instr.split(/\s+/).length > 40) {
        const compressed = compressText(instr, 36);
        if ('instructions' in content) content.instructions = compressed;
        else content.prompt = compressed;
        ops.push({
          kind: 'compress_instructions',
          appliedAt: nowIso(),
          before: `${instr.split(/\s+/).length} tokens`,
          after: `${compressed.split(/\s+/).length} tokens`,
          reason: 'Instruction length above policy.',
        });
        return { ...a, content };
      }
      return a;
    });
  }

  // 4. Inject reflection beat if cool-off missing.
  if (hints.has('inject_reflection') && !activities.some((a) => normalizeStage(a.stage as string) === 'reflection')) {
    const reflection: ActivitySpec = {
      id: uniqueId('reflect'),
      type: 'reflection_prompt' as ActivitySpec['type'],
      purpose: 'cool_off' as ActivitySpec['purpose'],
      stage: 'reflection' as ActivitySpec['stage'],
      modalities: ['writing'],
      target_vocab_used: ctx.plan?.blueprint?.target_vocab?.slice(0, 2) ?? [],
      grammar_targets_used: [],
      narrative_anchor: { characters: [], setting: 'classroom', scene: 'lesson_close' }, estimated_load: 'low',
      content: {
        instructions: 'In one sentence, share what you learned today.',
        prompt: 'Today I can __________ because __________.',
      } as Record<string, unknown>,
    };
    activities.push(reflection);
    ops.push({
      kind: 'inject_reflection',
      appliedAt: nowIso(),
      before: 'no_reflection',
      after: 'reflection_injected',
      reason: 'Reflection / closure stage missing.',
    });
  }

  // 5. Add recycling slot for under-recycled vocab.
  if (hints.has('add_recycling_slot')) {
    const targets = ctx.plan?.blueprint?.target_vocab ?? [];
    if (targets.length > 0) {
      const recycle: ActivitySpec = {
        id: uniqueId('recycle'),
        type: 'quick_recall' as ActivitySpec['type'],
        purpose: 'practice' as ActivitySpec['purpose'],
        stage: 'controlled' as ActivitySpec['stage'],
        modalities: ['reading'],
        target_vocab_used: targets,
        grammar_targets_used: [],
        narrative_anchor: { characters: [], setting: 'classroom', scene: 'recycle' }, estimated_load: 'low',
        content: {
          instructions: 'Quick recall: use each word in a short sentence.',
          words: targets,
        } as Record<string, unknown>,
      };
      // Insert before production / reflection
      const idx = activities.findIndex((a) => {
        const s = normalizeStage(a.stage as string);
        return s === 'production' || s === 'reflection';
      });
      if (idx === -1) activities.push(recycle);
      else activities.splice(idx, 0, recycle);
      ops.push({
        kind: 'add_recycling_slot',
        appliedAt: nowIso(),
        before: `${activities.length - 1} activities`,
        after: `${activities.length} activities`,
        reason: 'Vocab recycling below threshold.',
      });
    }
  }

  // 6. Add speaking opportunity.
  if (hints.has('add_speaking_opportunity')) {
    const speak: ActivitySpec = {
      id: uniqueId('speak'),
      type: 'speaking_prompt' as ActivitySpec['type'],
      purpose: 'produce' as ActivitySpec['purpose'],
      stage: 'production' as ActivitySpec['stage'],
      modalities: ['speaking'],
      target_vocab_used: ctx.plan?.blueprint?.target_vocab?.slice(0, 3) ?? [],
      grammar_targets_used: ctx.plan?.blueprint?.grammar_focus ?? [],
      narrative_anchor: { characters: [], setting: 'classroom', scene: 'speak' }, estimated_load: 'medium',
      content: {
        instructions: 'Say it out loud — short answer, bravery counts.',
        prompt: ctx.plan?.communication?.goal ?? 'Tell me about your day.',
      } as Record<string, unknown>,
    };
    const idx = activities.findIndex((a) => normalizeStage(a.stage as string) === 'reflection');
    if (idx === -1) activities.push(speak);
    else activities.splice(idx, 0, speak);
    ops.push({
      kind: 'add_speaking_opportunity',
      appliedAt: nowIso(),
      before: 'speaking_low',
      after: 'speaking_injected',
      reason: 'Speaking opportunities below floor.',
    });
  }

  return { ctx: { ...ctx, activities }, ops };
}
