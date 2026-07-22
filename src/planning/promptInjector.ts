// Planner Prompt Injector — converts a LessonPlan into a system prompt prefix
// that binds Gemini to the pedagogical plan BEFORE activities are generated.

import { HUB_PLANNING_PROFILES } from './hubProfiles';
import type { LessonPlan } from './types';

export function buildPlannerSystemPrompt(plan: LessonPlan): string {
  const { blueprint, flow_map, cognitive_load, communication, vocab_recycling, interaction_distribution } = plan;
  const profile = HUB_PLANNING_PROFILES[blueprint.hub];

  const flowText = flow_map
    .map(
      (s, i) =>
        `  ${i + 1}. ${s.stage.toUpperCase()} (${s.slide_count} slides) — ${s.why} | modalities: ${s.modalities.join(', ')}`,
    )
    .join('\n');

  const vocabText = vocab_recycling
    .map((v) => `  - "${v.word}" must appear in: ${v.appearances.join(', ')}`)
    .join('\n');

  return `# LESSON PLAN CONTRACT (binding — do not deviate)

You are an expert curriculum designer generating one lesson for Engleuphoria.

## Blueprint
- Hub: ${blueprint.hub}
- CEFR: ${blueprint.cefr_level}
- Title: ${blueprint.lesson_title}
- Theme: ${blueprint.theme}
- Emotional tone: ${blueprint.emotional_tone}
- Interaction style: ${blueprint.interaction_style}
- Duration: ${blueprint.lesson_duration}
- Grammar focus: ${blueprint.grammar_focus.join(', ') || '—'}
- Target vocab: ${blueprint.target_vocab.join(', ')}
- Review targets: ${blueprint.review_targets.join(', ') || '—'}

## Communication Objective (NON-NEGOTIABLE)
- Goal: ${communication.goal}
- Real-world use: ${communication.real_world_use}
- Success criteria:
${communication.success_criteria.map((c) => `  - ${c}`).join('\n')}

Grammar exists to SUPPORT this communication goal. Communication does NOT exist to practice grammar.

## Pedagogical Flow (strict order)
${flowText}

## Cognitive Load Plan
- Max consecutive receptive slides: ${cognitive_load.max_consecutive_receptive}
- Max consecutive same-modality slides: ${cognitive_load.max_consecutive_same_modality}
- Speaking must appear every ${cognitive_load.speaking_every_n_slides} slides
- Grammar-explanation budget: max ${cognitive_load.grammar_explanation_budget_slides} slide(s)
- Difficulty curve: ${cognitive_load.difficulty_curve.join(' → ')}

## Vocabulary Recycling Plan
${vocabText}

## Interaction Distribution Targets
${Object.entries(interaction_distribution).map(([k, v]) => `  - ${k}: ~${v} slide-units`).join('\n')}

## Hub Planning Notes
${profile.planning_notes.map((n) => `  - ${n}`).join('\n')}

## Hard rules
- Do NOT introduce grammar outside the blueprint's grammar_focus + review_targets.
- Do NOT introduce vocabulary outside target_vocab + review_targets except common function words.
- Every stage must produce its expected outputs.
- No isolated drilling. Every activity must connect to the theme and communication goal.
- No placeholder text ("Lorem ipsum", "example here", empty prompts).

Generate activities ONLY after internally confirming the plan above.`;
}
