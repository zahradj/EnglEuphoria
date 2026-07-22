// Prompt injector for Coherence Engine.
import type { CoherenceDecision } from './types';
import { buildQuizPedagogyContract, type QuizMode } from './quizPedagogyContract';


export function buildCoherenceSystemPrompt(d: CoherenceDecision): string {
  const targetList = d.targets.slice(0, 8)
    .map(t => `  - [${t.source}] ${t.skill_kind}:${t.skill_key} (priority ${(t.priority * 100).toFixed(0)})`)
    .join('\n');
  const hwList = d.homework.tasks
    .map(t => `  - ${t.type} → target ${t.reinforcement_target_id} (${t.estimated_minutes}min, ${t.modality})`)
    .join('\n');
  const gameList = d.game.rounds
    .map(r => `  - ${r.type}${r.is_boss ? ' [BOSS]' : ''} → target ${r.reinforcement_target_id} (tier ${r.difficulty_tier})`)
    .join('\n');
  const themeLine = d.unit_theme
    ? `Backdrop world (BINDING): "${d.unit_theme}"${d.scene_phrase ? ` — scene phrase: "${d.scene_phrase}"` : ""}`
    : '';
  return [
    '# Game & Homework Coherence Contract',
    `Hub: ${d.hub} | CEFR: ${d.cefr}`,
    themeLine,
    '',
    'Reinforcement targets (homework + games MUST reinforce ONLY these):',
    targetList || '  (none)',
    '',
    `Homework pack (${d.homework.total_minutes} min, ${d.homework.tasks.length} tasks):`,
    hwList || '  (empty)',
    '',
    `Game pack (${d.game.rounds.length} rounds, avg value ${d.game.educational_value_avg.toFixed(2)}):`,
    gameList || '  (empty)',
    '',
    'Rules:',
    '- Never introduce vocabulary or grammar absent from the lesson.',
    '- Every game round must reinforce a specific target id.',
    '- Production > reception. Retrieval > recognition.',
    '- Respect hub homework minute caps; Playground keeps unsupervised writing minimal.',
    '- Tone follows hub framing; never replace pedagogy with entertainment.',
    d.unit_theme
      ? `- Every homework prompt and game round MUST be set inside "${d.unit_theme}"${d.scene_phrase ? ` (${d.scene_phrase})` : ''}. Never drift to a generic classroom/park backdrop — reuse the same characters, setting, and props as the lesson.`
      : '',
    buildQuizPedagogyContract({
      mode: pickQuizMode(d),
      unresolvedConcepts: (d as any).unresolved_concepts ?? [],
      questionCount: d.homework.tasks.length || 4,
    }),
  ].filter(Boolean).join('\n');
}

function pickQuizMode(d: CoherenceDecision): QuizMode {
  const fromWeak = (d.targets ?? []).some(
    (t: any) => t.source === 'mistake_repository' || t.source === 'memory_due',
  );
  if (fromWeak) return 'weak_drill';
  const isReview = (d as any).lesson_kind === 'review' || (d as any).lesson_kind === 'quiz';
  return isReview ? 'review' : 'diagnostic';
}
