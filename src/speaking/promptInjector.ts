// Speaking system prompt — chains AFTER memory, BEFORE gamification.

import type { SpeakingDecision } from './types';

export function buildSpeakingSystemPrompt(decision: SpeakingDecision): string {
  const lines: string[] = [];
  lines.push('## SPEAKING & FLUENCY DIRECTIVES');
  lines.push(
    'Every lesson must put speaking at the center of practice. Generate speaking moments, not just receptive tasks.',
  );
  lines.push(`- Target rung this lesson: **${decision.next_rung}**`);
  lines.push(`- Minimum speaking density: ${Math.round(decision.density_floor * 100)}%`);
  lines.push(`- Bravery policy: ${decision.bravery_policy} (reward the attempt at higher rungs, not only correctness).`);
  lines.push('- Required speaking tasks (preserve type and rung):');
  decision.required_tasks.forEach((t, i) => {
    lines.push(
      `  ${i + 1}. ${t.task_type} (rung: ${t.rung}) — scenario "${t.scenario_key}" — ${t.duration_seconds}s — prompt: "${t.prompt}"`,
    );
    if (t.connected_speech_targets?.length) {
      lines.push(`     · connected-speech: ${t.connected_speech_targets.join(', ')}`);
    }
    if (t.target_skills?.length) {
      lines.push(`     · reuses: ${t.target_skills.map((s) => `${s.kind}:${s.key}`).join(', ')}`);
    }
    if (t.rubric_hint) lines.push(`     · rubric: ${t.rubric_hint}`);
  });
  if (decision.notes.length) {
    lines.push('- Notes:');
    decision.notes.forEach((n) => lines.push(`  · ${n}`));
  }

  lines.push('');
  lines.push('### SPEAKING SCAFFOLD LADDER (mandatory per speaking task)');
  lines.push('Every speaking task JSON MUST include a `scaffold` object with these fields:');
  lines.push('  {');
  lines.push('    "guided": "<sentence-frame the learner can read aloud verbatim>",');
  lines.push('    "expansion": "<follow-up prompt that asks the learner to ADD one detail>",');
  lines.push('    "ladder_rung": "<repetition|cued|guided|free|spontaneous>",');
  lines.push('    "fluency_extension": "<open prompt that invites a longer, freer response>",');
  lines.push('    "role": "<who the learner is in this moment, e.g. \\"a curious customer\\">",');
  lines.push('    "objective": "<communicative goal, e.g. \\"order food and ask for a recommendation\\">",');
  lines.push('    "emotion": "<emotional tone, e.g. \\"excited\\", \\"hesitant\\", \\"proud\\">",');
  lines.push('    "grammar_target": "<the exact structure being produced>",');
  lines.push('    "vocab_target": ["<target word 1>", "<target word 2>"]');
  lines.push('  }');
  lines.push('Every speaking task MUST also include a top-level `prompt` field with a concrete, scenario-bound instruction.');
  lines.push('FORBIDDEN generic prompts (will be HARD-blocked): "Talk about it.", "Discuss.", "Say something.", "Describe it.", "Speak.", "Share."');
  lines.push('Every prompt must mention WHO speaks, WHAT they want, and at least one target word OR grammar structure.');
  lines.push('Do NOT replace these with reading/listening-only variants. Spontaneous tasks must remain open-ended.');
  return lines.join('\n');
}
