// Per-activity and whole-set coherence validation.

import { effectiveCaps } from '@/governance/data/cefrCaps';
import type {
  ActivityIssue,
  ActivitySpec,
  ActivityValidationReport,
  GenerationContext,
} from '../types';

const PLACEHOLDER_RX = /(lorem ipsum|insert\s+\w+|todo[: ]|placeholder|example here|new sentence here)/i;

export function validateActivity(
  a: ActivitySpec,
  ctx: GenerationContext,
): ActivityValidationReport {
  const errors: ActivityIssue[] = [];
  const warnings: ActivityIssue[] = [];
  const text = JSON.stringify(a.content ?? {});

  if (!a.content || a.content.__error) {
    errors.push({ code: 'GENERATION_FAILED', severity: 'error', message: `Activity ${a.id} failed to generate.`, activityId: a.id });
    return { passed: false, errors, warnings };
  }
  if (PLACEHOLDER_RX.test(text)) {
    errors.push({ code: 'PLACEHOLDER_TEXT', severity: 'error', message: `Placeholder text detected in ${a.id}.`, activityId: a.id });
  }

  // Sentence-length cap from CEFR caps.
  const caps = effectiveCaps(ctx.state.cefr, ctx.state.hub);
  const sentences = extractSentences(a.content);
  for (const s of sentences) {
    const words = s.trim().split(/\s+/).filter(Boolean);
    if (words.length > caps.maxSentenceWords) {
      warnings.push({
        code: 'SENTENCE_TOO_LONG',
        severity: 'warning',
        message: `Sentence exceeds ${caps.maxSentenceWords} words in ${a.id}: "${s.slice(0, 60)}…"`,
        activityId: a.id,
      });
    }
  }

  // MCQ sanity: any { options, answer } pair must have answer ∈ options.
  walkMcq(a.content, (item, path) => {
    if (Array.isArray(item.options) && typeof item.answer === 'string') {
      if (!item.options.includes(item.answer)) {
        errors.push({
          code: 'MCQ_ANSWER_NOT_IN_OPTIONS',
          severity: 'error',
          message: `MCQ answer not in options at ${path} in ${a.id}.`,
          activityId: a.id,
        });
      }
    }
  });

  // Narrative anchor sanity.
  if (!a.narrative_anchor?.scene || a.narrative_anchor.scene === 'GENERATION_FAILED') {
    errors.push({ code: 'MISSING_NARRATIVE_ANCHOR', severity: 'error', message: `Missing narrative scene in ${a.id}.`, activityId: a.id });
  }

  return { passed: errors.length === 0, errors, warnings };
}

export function validateCoherence(
  activities: ActivitySpec[],
  ctx: GenerationContext,
): ActivityValidationReport {
  const errors: ActivityIssue[] = [];
  const warnings: ActivityIssue[] = [];

  // Cambridge: MCQ/fill-blank caps (≤2 each).
  const mcqTypes = new Set(['mcq', 'multiple_choice', 'quiz', 'poll']);
  const fillTypes = new Set(['fill_blank', 'fill_in_blank', 'cloze']);
  const mcqCount = activities.filter((a) => mcqTypes.has(a.type)).length;
  const fillCount = activities.filter((a) => fillTypes.has(a.type)).length;
  if (mcqCount > 2) {
    errors.push({
      code: 'MCQ_OVER_CAP',
      severity: 'error',
      message: `${mcqCount} MCQ-style activities (cap is 2).`,
    });
  }
  if (fillCount > 2) {
    errors.push({
      code: 'FILL_BLANK_OVER_CAP',
      severity: 'error',
      message: `${fillCount} fill-blank activities (cap is 2).`,
    });
  }

  // Per-type overuse cap: any single activity type may appear ≤3× in a lesson.
  const typeCounts = new Map<string, number>();
  for (const a of activities) {
    typeCounts.set(a.type, (typeCounts.get(a.type) ?? 0) + 1);
  }
  for (const [t, c] of typeCounts) {
    if (c > 3) {
      errors.push({
        code: 'ACTIVITY_TYPE_OVERUSED',
        severity: 'error',
        message: `Activity type "${t}" appears ${c} times (cap is 3 per lesson).`,
      });
    }
  }

  // Off-topic guard: every activity must surface topic OR a target vocab word
  // OR a lesson character name somewhere in its content or scene.
  const bpForTopic = ctx.plan.blueprint as any;
  const topicTokens = String(bpForTopic.topic ?? bpForTopic.lesson_title ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter((t: string) => t.length > 2);
  const vocabTokens = (bpForTopic.target_vocab ?? []).map((v: string) => v.toLowerCase());
  const charTokens = (bpForTopic.characters ?? []).map((c: string) => String(c).toLowerCase());
  const topicPool = [...topicTokens, ...vocabTokens, ...charTokens];
  if (topicPool.length >= 2) {
    for (const a of activities) {
      const blob = (
        JSON.stringify(a.content ?? {}) +
        ' ' +
        (a.narrative_anchor?.scene ?? '')
      ).toLowerCase();
      const hit = topicPool.some((tok: string) => tok && blob.includes(tok));
      if (!hit) {
        errors.push({
          code: 'ACTIVITY_OFF_TOPIC',
          severity: 'error',
          message: `Activity ${a.id} references neither the lesson topic, target vocab, nor a lesson character.`,
          activityId: a.id,
        });
      }
    }
  }

  // Cambridge: target-grammar usage in production-stage activities (≥60%).
  const productionStages = new Set(['controlled', 'semi', 'production', 'communicative']);
  const prodActs = activities.filter((a) => productionStages.has(a.stage));
  if (prodActs.length >= 3) {
    const withGrammar = prodActs.filter((a) => (a.grammar_targets_used ?? []).length > 0).length;
    if (withGrammar / prodActs.length < 0.6) {
      warnings.push({
        code: 'TARGET_GRAMMAR_UNDERUSED',
        severity: 'warning',
        message: `Only ${withGrammar}/${prodActs.length} production activities use target grammar (need ≥60%).`,
      });
    }
  }


  // Vocab recycling: each target word must appear in >= 3 activities.
  for (const w of ctx.plan.blueprint.target_vocab) {
    const count = activities.filter((a) => a.target_vocab_used.includes(w)).length;
    if (count < 3) {
      errors.push({
        code: 'VOCAB_UNDER_RECYCLED',
        severity: 'error',
        message: `Target word "${w}" appears in ${count} activities (need 3).`,
      });
    }
  }

  // Adjacent same-type ban.
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].type === activities[i - 1].type) {
      warnings.push({
        code: 'ADJACENT_SAME_TYPE',
        severity: 'warning',
        message: `Adjacent activities share type "${activities[i].type}" at index ${i}.`,
      });
    }
  }

  // Receptive streak cap.
  const cap = ctx.plan.cognitive_load.max_consecutive_receptive;
  let streak = 0;
  for (const a of activities) {
    const productive = a.modalities.some((m) => m === 'speaking' || m === 'writing');
    if (!productive) {
      streak++;
      if (streak > cap) {
        warnings.push({
          code: 'RECEPTIVE_STREAK_EXCEEDED',
          severity: 'warning',
          message: `Receptive streak ${streak} exceeds cap ${cap}.`,
        });
      }
    } else streak = 0;
  }

  // Theme drift: scenes must reference theme tokens (loose check).
  const themeTokens = ctx.state.theme.theme.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  if (themeTokens.length) {
    const drifters = activities.filter((a) => {
      const blob = (JSON.stringify(a.content) + ' ' + a.narrative_anchor.scene).toLowerCase();
      return !themeTokens.some((t) => blob.includes(t));
    });
    if (drifters.length > Math.ceil(activities.length / 3)) {
      warnings.push({
        code: 'THEME_DRIFT',
        severity: 'warning',
        message: `${drifters.length}/${activities.length} activities show no surface link to theme.`,
      });
    }
  }

  // Step 5: LESSON_BODY_DRIFT — every slide must share ≥2 tokens with the
  // lesson's vocab + grammar + title pool. Catches generic filler.
  const bp = ctx.plan.blueprint;
  const focusPool = new Set(
    [
      ...(bp.target_vocab ?? []),
      ...(bp.grammar_focus ?? []),
      ...(bp.lesson_title?.split(/\s+/) ?? []),
      ...(bp.communication_goal?.split(/\s+/) ?? []),
    ]
      .map((s) => String(s).toLowerCase().trim())
      .filter((s) => s.length > 2),
  );
  if (focusPool.size >= 2) {
    for (const a of activities) {
      const blob = (
        JSON.stringify(a.content) +
        ' ' +
        a.narrative_anchor.scene +
        ' ' +
        (a.target_vocab_used ?? []).join(' ') +
        ' ' +
        (a.grammar_targets_used ?? []).join(' ')
      ).toLowerCase();
      let hits = 0;
      for (const tok of focusPool) {
        if (blob.includes(tok)) {
          hits += 1;
          if (hits >= 2) break;
        }
      }
      if (hits < 2) {
        warnings.push({
          code: 'LESSON_BODY_DRIFT',
          severity: 'warning',
          message: `Activity ${a.id} shares <2 tokens with the lesson's vocab/grammar/title — likely off-focus filler.`,
          activityId: a.id,
        });
      }
    }
  }

  return { passed: errors.length === 0, errors, warnings };
}


function extractSentences(content: any): string[] {
  const out: string[] = [];
  const visit = (v: any) => {
    if (!v) return;
    if (typeof v === 'string') {
      v.split(/(?<=[.!?])\s+/).forEach((s) => out.push(s));
    } else if (Array.isArray(v)) {
      v.forEach(visit);
    } else if (typeof v === 'object') {
      Object.values(v).forEach(visit);
    }
  };
  visit(content);
  return out;
}

function walkMcq(node: any, cb: (item: any, path: string) => void, path = '$') {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((n, i) => walkMcq(n, cb, `${path}[${i}]`));
  } else if (typeof node === 'object') {
    cb(node, path);
    for (const k of Object.keys(node)) walkMcq(node[k], cb, `${path}.${k}`);
  }
}
