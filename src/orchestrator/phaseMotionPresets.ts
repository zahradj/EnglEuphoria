// Deterministic phase → mascot + motion preset mapper.
//
// Used in two places:
//  1. Motion tab "Auto from beat" button (authoring nudge).
//  2. Player fallback — when a slide has no explicit motion/mascot, the beat
//     drives the entrance animation and mascot pose. Warm-Up always pops,
//     Story fades up, Speak scales in, Celebrate bursts.
//
// The mascot's environment defaults to the theme-mapped backdrop
// (see topicToEnvironment) so the world stays coherent.

import type {
  PageMascot,
  PageMotion,
  PipEnvironment,
  PipMascotState,
} from '@/playground-blueprint/types';
import { topicToEnvironment } from './topicToEnvironment';

const DEFAULT_MOTION: PageMotion = { entrance: 'fade_up', duration_ms: 300, emphasis: 'none' };

type Preset = { state: PipMascotState; motion: PageMotion };

const RULES: Array<{ match: RegExp; preset: Preset }> = [
  { match: /warm|intro|hello/,                    preset: { state: 'wave',        motion: { entrance: 'pop',            duration_ms: 260, emphasis: 'bounce' } } },
  { match: /listen|song|chant/,                   preset: { state: 'listening',   motion: { entrance: 'fade_up',        duration_ms: 300, emphasis: 'pulse'  } } },
  { match: /speak|produce|say/,                   preset: { state: 'speaking',    motion: { entrance: 'scale_in',       duration_ms: 280, emphasis: 'none'   } } },
  { match: /celebrat|cool|reward|vault|finish/,   preset: { state: 'celebrate',   motion: { entrance: 'pop',            duration_ms: 320, emphasis: 'bounce' } } },
  { match: /quiz|check|practice/,                 preset: { state: 'thinking',    motion: { entrance: 'scale_in',       duration_ms: 260, emphasis: 'none'   } } },
  { match: /mimic|model/,                         preset: { state: 'point_right', motion: { entrance: 'slide_in_right', duration_ms: 280, emphasis: 'none'   } } },
  { match: /story|read/,                          preset: { state: 'idle',        motion: { entrance: 'fade_up',        duration_ms: 320, emphasis: 'none'   } } },
];

export function phasePreset(
  phaseId?: string | null,
  theme?: string | null,
): { mascot: PageMascot; motion: PageMotion } {
  const p = (phaseId ?? '').toLowerCase();
  const themeEnv = topicToEnvironment(theme ?? '') as PipEnvironment;
  const rule = RULES.find((r) => r.match.test(p));
  if (!rule) {
    return {
      mascot: { state: 'idle', environment: themeEnv, speech: '' },
      motion: DEFAULT_MOTION,
    };
  }
  // Story beats override the environment to a library for reading focus.
  const env: PipEnvironment =
    rule.preset.state === 'idle' && /story|read/.test(p) ? 'library' :
    // Celebrations pop out of a plain classroom into a park.
    rule.preset.state === 'celebrate' && themeEnv === 'classroom' ? 'park' :
    themeEnv;
  return {
    mascot: { state: rule.preset.state, environment: env, speech: '' },
    motion: rule.preset.motion,
  };
}
