// Targeted repair prompt for a single failing activity.

import type { ActivitySpec, ActivityValidationReport } from '../types';

const PREA1_CONTRACT = [
  '',
  '### PRE-A1 NON-READER CONTRACT (BINDING)',
  'The learner CANNOT read printed prose. Follow these rules absolutely:',
  '- FORBIDDEN activity types: fill_blank, reading, dictation, dictation_builder, spelling, writing, error_correction, mcq_text_only, any text-first type.',
  '- Every `content` string (prompt/text/sentence/question/instruction) MUST be ≤5 words. Long instructions must move to audio or images.',
  '- Prefer echo, mimic, point_and_say, tpr_action, song_gesture, listen_match, picture_bingo.',
  '- Speaking floor + TPR minimum per lesson number are already enforced upstream — do NOT drop those tasks when repairing.',
  '- Vocabulary is images + audio. No orthographic decoding tasks.',
].join('\n');

export function buildRepairPrompt(
  spec: ActivitySpec,
  report: ActivityValidationReport,
): string {
  const all = [...report.errors, ...report.warnings];
  const issues = all.map((i) => `- [${i.severity}] ${i.code}: ${i.message}`).join('\n');
  const isPrea1 = all.some((i) => i.code.startsWith('PREA1_'));
  return [
    '## ACTIVITY REPAIR',
    `The previous attempt for activity "${spec.id}" (type: ${spec.type}, stage: ${spec.stage}) failed validation:`,
    issues || '- (no detail)',
    isPrea1 ? PREA1_CONTRACT : '',
    '',
    'Regenerate the SAME activity type and purpose, fixing the issues above.',
    'Stay inside the same scenario, characters, and setting.',
    'Return strict JSON only.',
  ].filter(Boolean).join('\n');
}
