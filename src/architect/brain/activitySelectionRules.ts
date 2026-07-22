// Activity Selection Rules — how the Architect chooses games/activities.
// Deterministic ladder + no-repeat + hub bias.

import type { Hub } from '@/governance/types';

export const ACTIVITY_LADDER = [
  'Recognition',
  'Identification',
  'Decision',
  'Speaking',
  'Communication',
] as const;

export function buildActivitySelectionPrompt(hub: Hub): string {
  const lines = [
    '## ACTIVITY SELECTION RULES',
    '- Never repeat the same game type twice inside one lesson.',
    '- Follow the progression ladder in order:',
    `  ${ACTIVITY_LADDER.join(' → ')}`,
    '- Each activity must map to ONE ladder rung. Do not skip more than one rung between consecutive activities.',
    '- Pick activities by PURPOSE, not by novelty. If two mechanics serve the same rung, pick the one closer to the theme brain\'s actions.',
  ];
  if (hub === 'playground') {
    lines.push(
      '- Playground: prefer physical/TPR mechanics (tap, drag, mirror, point). At least one activity per lesson MUST require whole-body movement.',
      '- Playground: no leaderboards, no timed pressure, no typing beyond 1 word.',
    );
  } else if (hub === 'academy') {
    lines.push(
      '- Academy: prefer team/challenge framing; avoid babyish mechanics; include one opinion or role-play moment.',
    );
  } else {
    lines.push(
      '- Success: prefer real-world scenarios (email, call, negotiation). Games must feel purposeful, not decorative.',
    );
  }
  return lines.join('\n');
}
