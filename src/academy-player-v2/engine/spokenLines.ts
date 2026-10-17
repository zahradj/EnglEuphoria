import { moduleFor } from '../scenes/registry';
import type { LessonScript } from '../types';

/** Every line the recorded voices say in a lesson, deduped by who + text (the input of the voice bake). Lines with a blank (___) cannot be recorded and are skipped. */
export function spokenLines(s: LessonScript): { who: string; text: string }[] {
  const seen = new Map<string, { who: string; text: string }>();
  for (const sc of s.scenes) {
    const m = moduleFor(sc.kind);
    for (const l of m?.spoken(sc) ?? []) {
      if (l.text.includes('___')) continue;
      seen.set(`${l.who}::${l.text}`, l);
    }
  }
  return [...seen.values()];
}
