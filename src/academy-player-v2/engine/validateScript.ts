import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { moduleFor } from '../scenes/registry';
import { PART_COUNT, type LessonScript } from '../types';

/** Problems with a lesson script (empty = valid). Run in tests for every registered lesson; also guards the registry (unknown kinds). */
export function validateScript(s: LessonScript): string[] {
  const p: string[] = [];
  if (!ACADEMY_LESSON_BLUEPRINTS.some((b) => b.id === s.blueprintId)) p.push(`blueprint ${s.blueprintId} does not exist`);
  if (s.partMinutes.length !== PART_COUNT) p.push(`partMinutes must have ${PART_COUNT} entries`);
  else if (s.partMinutes.reduce((a, b) => a + b, 0) !== 60) p.push('partMinutes must sum to 60');
  if (!s.criteria.length) p.push('criteria are empty');
  if (!s.scenes.length) p.push('no scenes');
  const ids = new Set<string>();
  for (const sc of s.scenes) {
    if (ids.has(sc.id)) p.push(`duplicate scene id ${sc.id}`);
    ids.add(sc.id);
    if (sc.part < 0 || sc.part >= PART_COUNT) p.push(`${sc.id}: part ${sc.part} out of range`);
    for (const t of sc.trains ?? []) if (t < 1 || t > s.criteria.length) p.push(`${sc.id}: trains ${t} is not a criterion`);
    const m = moduleFor(sc.kind);
    if (!m) p.push(`${sc.id}: unknown scene kind "${sc.kind}"`);
    else p.push(...m.validate(sc));
  }
  for (let i = 1; i < s.scenes.length; i++) if (s.scenes[i].part < s.scenes[i - 1].part) p.push(`${s.scenes[i].id}: parts must not go backwards`);
  return p;
}
