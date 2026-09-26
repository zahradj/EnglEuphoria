import type { QAIssue, QALesson } from '../types';
import { hashContent } from '../util/text';
import { judgeKey } from './judgeCache';

/**
 * Holistic LLM-as-judge critic.
 * Runs AFTER deterministic QA + Stabilization. Catches "valid but boring/incoherent" lessons.
 *
 * Scores 6 axes 0–100:
 *  - pedagogical_flow     (warm-up → modeling → guided → free)
 *  - vocab_recycling      (target words reused ≥3× with rising challenge)
 *  - speaking_authenticity(scenarios feel real, not robotic)
 *  - character_coherence  (cast voice + appearance consistent)
 *  - engagement_variety   (no >2 same activity types in a row)
 *  - visual_grounding     (narrative_anchor setting/scene is lesson-specific, not generic filler)
 *
 * visual_grounding closes a real gap: the critic previously never saw each
 * activity's narrative_anchor (setting/scene) at all, so it could not catch
 * the exact failure this project has hit before -- a scene's background
 * described as a generic "classroom" instead of something that actually
 * matches the lesson's unit_theme (e.g. "a deep-space rocket cockpit").
 *
 * Caller invokes Gemini via aiFetch and passes the parsed result to `mapCriticResultToIssues`.
 */
export interface LessonCriticResult {
  scores: {
    pedagogical_flow: number;
    vocab_recycling: number;
    speaking_authenticity: number;
    character_coherence: number;
    engagement_variety: number;
    visual_grounding: number;
  };
  overall: number; // weighted avg
  verdict: 'publish' | 'repair' | 'block';
  rationale: string;
  weak_axes: string[];
  raw?: any;
}

const WEIGHTS = {
  pedagogical_flow: 0.2,
  vocab_recycling: 0.2,
  speaking_authenticity: 0.15,
  character_coherence: 0.15,
  engagement_variety: 0.15,
  visual_grounding: 0.15,
} as const;

export function buildCriticPrompt(lesson: QALesson): string {
  const compact = {
    id: lesson.id,
    cefr: lesson.cefr,
    hub: lesson.hub,
    unit_theme: lesson.unit_theme ?? null,
    objective: (lesson as any).communication_objective ?? (lesson as any).communicative_objective ?? null,
    vocab: (lesson as any).target_vocab ?? [],
    slides: lesson.slides.map((s) => ({
      id: s.id,
      type: (s as any).type ?? (s as any).kind,
      title: (s as any).title,
      activity: (s as any).activity_type ?? s.activities?.[0]?.type ?? null,
      activities: (s.activities ?? []).map((a) => ({
        type: a.type,
        purpose: a.purpose,
        target_vocab_used: a.target_vocab_used ?? [],
        narrative_anchor: a.narrative_anchor ?? null,
      })),
      text_excerpt:
        s.body_text?.slice?.(0, 450) ??
        (s as any).text?.slice?.(0, 450) ??
        (s as any).body?.slice?.(0, 450) ??
        null,
    })),
  };

  return [
    'You are a senior CEFR-certified English curriculum critic.',
    'Score this lesson on 6 axes (0–100). Be strict: 80+ means excellent, 60–79 acceptable, <60 needs repair.',
    '',
    'Axis criteria:',
    '- pedagogical_flow: does the slide sequence move warm-up -> modeling -> guided practice -> free/independent use, with no phase skipped or out of order?',
    '- vocab_recycling: is each target vocab word reused at least 3 times across the lesson, with rising challenge (not the same isolated flashcard rep)?',
    '- speaking_authenticity: do roleplay/speaking prompts sound like something a real person would say, not a stiff textbook sentence?',
    '- character_coherence: do named characters keep a consistent voice and appearance description across every activity they appear in?',
    '- engagement_variety: list every activity "type" in order across the whole lesson. FAIL this axis (score <60) if any type repeats more than twice in a row, or if 3+ activities in a row are the same mechanic with only the vocabulary swapped (cosmetic variation is not variety).',
    '- visual_grounding: for each activity with a narrative_anchor, does its "setting"/"scene" describe something SPECIFIC to unit_theme and the activity content -- not a generic filler location (e.g. "a classroom", "outside") that could belong to any lesson? Score low if settings are generic or if unit_theme is set but activities ignore it.',
    '',
    'Return STRICT JSON:',
    '{"scores":{"pedagogical_flow":N,"vocab_recycling":N,"speaking_authenticity":N,"character_coherence":N,"engagement_variety":N,"visual_grounding":N},"verdict":"publish|repair|block","rationale":"1-3 sentences","weak_axes":["axis_name"]}',
    'Rules: verdict="block" if any axis <40. verdict="repair" if any axis 40–59 or overall <70. Otherwise "publish".',
    'Lesson:',
    JSON.stringify(compact, null, 2),
  ].join('\n');
}

export function criticCacheKey(lesson: QALesson): { key: string; contentHash: string } {
  const seed = lesson.slides
    .map((s) => `${s.id}|${(s as any).activity_type ?? ''}|${(s as any).text?.slice?.(0, 80) ?? ''}`)
    .join('||');
  const contentHash = hashContent(`critic:${lesson.cefr}:${lesson.hub}:${seed}`);
  return { key: judgeKey('lesson_critic', contentHash), contentHash };
}

export function computeOverall(scores: LessonCriticResult['scores']): number {
  return Math.round(
    scores.pedagogical_flow * WEIGHTS.pedagogical_flow +
      scores.vocab_recycling * WEIGHTS.vocab_recycling +
      scores.speaking_authenticity * WEIGHTS.speaking_authenticity +
      scores.character_coherence * WEIGHTS.character_coherence +
      scores.engagement_variety * WEIGHTS.engagement_variety +
      scores.visual_grounding * WEIGHTS.visual_grounding,
  );
}

export function mapCriticResultToIssues(result: LessonCriticResult): QAIssue[] {
  const issues: QAIssue[] = [];
  if (result.verdict === 'block') {
    issues.push({
      code: 'CRITIC_BLOCK',
      domain: 'critic' as any,
      severity: 'block',
      message: `Lesson Critic blocked publish (overall ${result.overall}). Weak: ${result.weak_axes.join(', ')}. ${result.rationale}`,
      suggestion: 'Regenerate weakest axes before re-submitting.',
      auto_repairable: true,
    });
  } else if (result.verdict === 'repair') {
    issues.push({
      code: 'CRITIC_REPAIR',
      domain: 'critic' as any,
      severity: 'warn',
      message: `Lesson Critic suggests repair (overall ${result.overall}). Weak: ${result.weak_axes.join(', ')}.`,
      auto_repairable: true,
    });
  }
  return issues;
}
