// Brain Pipeline — the master orchestrator contract.
// Declares the 8-stage chain every lesson MUST flow through, in order,
// with no skipping and no reordering. Each stage owns one decision and
// feeds the next.

export interface BrainStage {
  id: string;
  name: string;
  owns: string;
  reads: string[];
  writes: string;
}

export const BRAIN_PIPELINE: BrainStage[] = [
  {
    id: 'curriculum',
    name: 'Curriculum Brain',
    owns: 'Objectives, CEFR fit, progression across the unit.',
    reads: ['user_request', 'continuity_context', 'cefr_ceiling'],
    writes: 'topic, can_do_objective, cefr_bound, unit_progression_slot',
  },
  {
    id: 'pedagogy',
    name: 'Pedagogy Brain',
    owns: 'Teaching methods, child psychology, pacing, cognitive load.',
    reads: ['curriculum.output', 'hub_profile', 'learning_journey_stages'],
    writes: 'method, pacing_plan, cognitive_load_plan, tpr_slots',
  },
  {
    id: 'theme',
    name: 'Theme Brain',
    owns: 'Mission, setting, characters, rewards — retrieved, not invented.',
    reads: ['pedagogy.output', 'theme_knowledge_base'],
    writes: 'mission, setting, characters, target_vocab, reward',
  },
  {
    id: 'story',
    name: 'Story Brain',
    owns: 'Goal → Problem → Adventure → Success → Celebration.',
    reads: ['theme.output', 'grammar_frame'],
    writes: 'story_beats, story_problem, story_resolution',
  },
  {
    id: 'game',
    name: 'Game Brain',
    owns: 'Age-appropriate interactive activities along the ladder.',
    reads: ['story.output', 'activity_catalog', 'never_rules'],
    writes: 'activity_ladder, boss_round, speaking_slots',
  },
  {
    id: 'image',
    name: 'Image Brain',
    owns: 'Consistent scenes, single-subject prompts, hub style guard tail.',
    reads: ['theme.output', 'story.output', 'game.output'],
    writes: 'image_prompts (image_url stays null)',
  },
  {
    id: 'reviewer',
    name: 'Lesson Quality Reviewer',
    owns: 'Grammar drift, repetition, engagement, CEFR, hall-of-fame bar.',
    reads: ['all_prior_stages'],
    writes: 'review.checks, hall_of_fame.scores, rewrite_requests',
  },
  {
    id: 'json_generator',
    name: 'JSON Lesson Generator',
    owns: 'Final schema-valid blueprint. No new pedagogical content.',
    reads: ['reviewer.approval'],
    writes: 'final blueprint JSON',
  },
];

export const BRAIN_PIPELINE_PROMPT = `
## MASTER ORCHESTRATOR — BRAIN PIPELINE (binding chain of command)

You are not one agent. You are an orchestrated pipeline of 8 brains. Each
brain owns ONE decision, reads only what upstream brains have signed, and
writes ONLY its own section. No brain may skip ahead, no brain may rewrite
an upstream section — a rewrite is requested through the Reviewer.

\`\`\`
USER REQUEST
      │
      ▼
${BRAIN_PIPELINE.map((s) => s.name).join('\n      │\n      ▼\n')}
\`\`\`

### Stage contracts

${BRAIN_PIPELINE.map(
  (s, i) => `**${i + 1}. ${s.name}** (id: \`${s.id}\`)
- Owns: ${s.owns}
- Reads: ${s.reads.join(', ')}
- Writes: ${s.writes}`,
).join('\n\n')}

### Pipeline rules

- Execution is strictly sequential. Do not begin stage N+1 until stage N has
  produced its output and signed it.
- Every blueprint section MUST carry \`signed_by: "<stage_id>"\` matching
  the stage that owns it.
- The final blueprint MUST expose \`pipeline_trace: [{ stage, decision, evidence }]\`
  proving all 8 stages ran in order.
- The JSON Lesson Generator writes NO new pedagogical content — it only
  serializes what upstream brains produced.
- If the Reviewer flags any stage, the responsible brain rewrites (max 1
  pass). If the rewrite still fails, return the blueprint with
  \`review.pass = false\` so downstream QA rejects cleanly. Never ship a
  lesson the Reviewer has not approved.
`.trim();
