// Decides WHEN games appear inside a lesson.
import type { GameSpec, InjectionDecision, InjectionSlot } from './types';

export function planInjections(specs: GameSpec[]): InjectionDecision[] {
  // Deterministic slot mapping by category + index.
  const out: InjectionDecision[] = [];
  let warmupAssigned = false;
  let exitAssigned = false;
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    let slot: InjectionSlot;
    let rationale: string;
    if (!warmupAssigned && s.game.category === 'foundational' && s.est_seconds <= 90) {
      slot = 'warmup';
      rationale = 'Short foundational game → warmup slot';
      warmupAssigned = true;
    } else if (s.game.supports_speaking) {
      slot = 'speaking';
      rationale = 'Speaking-capable game → speaking slot';
    } else if (s.game.category === 'review') {
      slot = 'review';
      rationale = 'Review category → review slot';
    } else if (!exitAssigned && i === specs.length - 1) {
      slot = 'exit';
      rationale = 'Final slot → exit/celebration';
      exitAssigned = true;
    } else {
      slot = 'drill';
      rationale = 'Default drill slot';
    }
    out.push({ slot, spec: s, rationale });
  }
  return out;
}
