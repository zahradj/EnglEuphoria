// Cycle 4 — ESA flow descriptors.
//
// Each flow is an ordered list of slots. A slot describes the acceptable
// cognitive_class + target_skill mix for an Engage/Study/Activate phase.
//
// STRAIGHT_ARROW: Pre-A1 / A1  — linear, highly scaffolded.
// BOOMERANG:     A2 / B1       — speak → analyze errors → re-teach → speak again.
// PATCHWORK:     B2 / C1       — interleaved phases for spiral consolidation.

import type { CognitiveClass, EsaPhase, TargetSkill } from '../catalog/activityAnnotations';

export interface EsaSlot {
  phase: EsaPhase;
  allow_classes: CognitiveClass[];
  prefer_skills?: TargetSkill[];
  note?: string;
}

export interface EsaFlow {
  id: 'straight_arrow' | 'boomerang' | 'patchwork';
  description: string;
  slots: EsaSlot[];
}

export const STRAIGHT_ARROW: EsaFlow = {
  id: 'straight_arrow',
  description: 'Linear scaffolded path: Engage (visual hook) → Study (multi-sensory phonics + vocab) → Activate (input-based then guided output).',
  slots: [
    { phase: 'engage',   allow_classes: ['input_based'],                        prefer_skills: ['vocabulary', 'listening'] },
    { phase: 'study',    allow_classes: ['input_based'],                        prefer_skills: ['phonics'] },
    { phase: 'study',    allow_classes: ['input_based', 'guided_output'],       prefer_skills: ['phonics', 'vocabulary'] },
    { phase: 'activate', allow_classes: ['input_based'],                        prefer_skills: ['listening', 'vocabulary'], note: 'honor the silent period' },
    { phase: 'activate', allow_classes: ['guided_output'],                      prefer_skills: ['syntax', 'speaking'] },
  ],
};

export const BOOMERANG: EsaFlow = {
  id: 'boomerang',
  description: 'Activate-1 first (speak), Study targets errors detected, Activate-2 retries with the corrected language.',
  slots: [
    { phase: 'engage',   allow_classes: ['input_based', 'output_based'],        prefer_skills: ['discourse'] },
    { phase: 'activate', allow_classes: ['output_based'],                       prefer_skills: ['speaking'], note: 'activate-1: speaking_mission to elicit errors' },
    { phase: 'study',    allow_classes: ['analytical', 'guided_output'],        prefer_skills: ['grammar', 'syntax'], note: 'targets errors from activate-1' },
    { phase: 'study',    allow_classes: ['guided_output'],                      prefer_skills: ['syntax', 'speaking'] },
    { phase: 'activate', allow_classes: ['output_based'],                       prefer_skills: ['speaking'], note: 'activate-2: retry the speaking mission' },
  ],
};

export const PATCHWORK: EsaFlow = {
  id: 'patchwork',
  description: 'Interleaved E/S/A for spiral consolidation at higher levels.',
  slots: [
    { phase: 'engage',   allow_classes: ['output_based'],                       prefer_skills: ['discourse'] },
    { phase: 'study',    allow_classes: ['analytical', 'guided_output'],        prefer_skills: ['grammar'] },
    { phase: 'activate', allow_classes: ['output_based'],                       prefer_skills: ['speaking'] },
    { phase: 'study',    allow_classes: ['guided_output', 'input_based'],       prefer_skills: ['vocabulary'] },
    { phase: 'activate', allow_classes: ['output_based'],                       prefer_skills: ['speaking', 'pragmatics'] },
  ],
};

export const ESA_FLOWS = { straight_arrow: STRAIGHT_ARROW, boomerang: BOOMERANG, patchwork: PATCHWORK };
