// Deterministic task selector — picks a coherent set of speaking tasks
// for the lesson based on plan + state + density plan. No randomness:
// ties broken by stable ordering on TASK_CATALOG.

import type { Hub } from '@/governance/types';
import type {
  SpeakingTaskSpec,
  SpeakingTaskType,
  SpeakingRung,
  SpeakingState,
  SkillKind,
} from './types';
import type { HubSpeakingProfile } from './hubProfiles';
import { TASK_CATALOG, tasksForHubAndRung } from './taskTypes';
import { buildShadowingTask } from './shadowingEngine';
import { buildRoleplayTask } from './roleplayEngine';
import { buildSpontaneityTask } from './spontaneityEngine';

export interface PlanLikeForSpeaking {
  targetVocab: string[];
  grammarFocus: string[];
  communicationGoal: string;
  modelLines?: string[];
}

export interface SelectorInputs {
  hub: Hub;
  state: SpeakingState;
  profile: HubSpeakingProfile;
  taskCount: number;
  nextRung: SpeakingRung;
  plan: PlanLikeForSpeaking;
  pronFocus?: string[];
  connectedTargets?: string[];
}

function targetSkillsFromPlan(plan: PlanLikeForSpeaking): Array<{ kind: SkillKind; key: string }> {
  const skills: Array<{ kind: SkillKind; key: string }> = [];
  plan.grammarFocus.slice(0, 2).forEach((g) => skills.push({ kind: 'grammar', key: g }));
  plan.targetVocab.slice(0, 4).forEach((v) => skills.push({ kind: 'vocab', key: v }));
  return skills;
}

export function selectSpeakingTasks(input: SelectorInputs): SpeakingTaskSpec[] {
  const skills = targetSkillsFromPlan(input.plan);
  const selected: SpeakingTaskSpec[] = [];
  const recentTypes = new Set(input.state.recent_task_types.slice(-3));

  // Always include one repetition/cued anchor early — guarantees safe entry.
  const anchorRung: SpeakingRung = input.nextRung === 'spontaneous' ? 'cued' : 'repetition';
  selected.push({
    task_type: 'repetition_drill',
    rung: anchorRung,
    scenario_key: `anchor_${input.plan.grammarFocus[0] ?? 'core'}`,
    target_skills: skills.slice(0, 2),
    pronunciation_focus: input.pronFocus,
    connected_speech_targets: input.connectedTargets,
    duration_seconds: 40,
    bravery_eligible: false,
    prompt: `Listen and repeat target chunks for "${input.plan.communicationGoal}".`,
  });

  // Climb the ladder — add one shadowing if reachable.
  if (input.profile.allowed_tasks.includes('shadowing') && input.nextRung !== 'repetition') {
    selected.push(
      buildShadowingTask({
        targetSentence: input.plan.modelLines?.[0] ?? input.plan.communicationGoal,
        rung: input.nextRung === 'spontaneous' ? 'guided' : input.nextRung,
        scenarioKey: `shadow_${input.plan.grammarFocus[0] ?? 'core'}`,
        targetSkills: skills,
        pronFocus: input.pronFocus,
        connectedTargets: input.connectedTargets,
      }),
    );
  }

  // Roleplay / meeting sim — communicative use.
  if (
    selected.length < input.taskCount &&
    (input.profile.allowed_tasks.includes('roleplay') ||
      input.profile.allowed_tasks.includes('meeting_sim'))
  ) {
    const rp = buildRoleplayTask({
      hub: input.hub,
      rung: input.nextRung === 'spontaneous' ? 'free' : input.nextRung,
      recentScenarios: input.state.recent_scenarios,
      targetSkills: skills,
      pronFocus: input.pronFocus,
      connectedTargets: input.connectedTargets,
    });
    if (rp) selected.push(rp);
  }

  // Spontaneous closer — only if ready.
  if (
    selected.length < input.taskCount &&
    (input.nextRung === 'free' || input.nextRung === 'spontaneous')
  ) {
    const sp = buildSpontaneityTask({
      hub: input.hub,
      rung: input.nextRung,
      ready: true,
      targetSkills: skills,
    });
    if (sp) selected.push(sp);
  }

  // Backfill with allowed task types we haven't used.
  if (selected.length < input.taskCount) {
    const usedTypes = new Set(selected.map((s) => s.task_type));
    const pool: TaskMetaLike[] = tasksForHubAndRung(input.hub, input.nextRung) as TaskMetaLike[];
    for (const meta of pool) {
      if (selected.length >= input.taskCount) break;
      if (usedTypes.has(meta.type)) continue;
      // De-prioritise recently used types (still deterministic — recentTypes is small).
      if (recentTypes.has(meta.type) && pool.some((m) => !recentTypes.has(m.type))) continue;
      selected.push({
        task_type: meta.type,
        rung: input.nextRung,
        scenario_key: `auto_${meta.type}`,
        target_skills: skills,
        pronunciation_focus: input.pronFocus,
        connected_speech_targets: input.connectedTargets,
        duration_seconds: TASK_CATALOG[meta.type].duration_s,
        bravery_eligible: input.nextRung !== 'repetition',
        prompt: TASK_CATALOG[meta.type].description,
      });
      usedTypes.add(meta.type);
    }
  }

  return selected.slice(0, input.taskCount);
}

type TaskMetaLike = { type: SpeakingTaskType };
