import { describe, expect, it } from 'vitest';
import { HOMEWORK_QUESTS, PRACTISE_PACKS, getHomeworkQuest } from './registry';
import { questLines } from './types';
import { PRACTISE_SKILLS, practisePackId, practiseScopeForTest } from './practise-again';
import { SCENE_LESSON_REGISTRY } from '../playground-library/sceneLessonRegistry';

describe('Practise again packs', () => {
  it('maps every level test to a pack scope', () => {
    expect(practiseScopeForTest('prea1-u3-boss')).toBe('u3');
    expect(practiseScopeForTest('prea1-checkpoint-1')).toBe('checkpoint-1');
    expect(practiseScopeForTest('prea1-final')).toBe('prea1');
    expect(practiseScopeForTest('something-else')).toBeNull();
  });

  it('has a pack for every part of every Pre-A1 test, reachable by id', () => {
    const tests = Object.values(SCENE_LESSON_REGISTRY).flat().filter((s) => s.kind === 'level-test');
    expect(tests.length).toBeGreaterThanOrEqual(11);
    for (const t of tests) {
      if (t.kind !== 'level-test') continue;
      const scope = practiseScopeForTest(t.testKey);
      expect(scope, t.testKey).toBeTruthy();
      for (const key of [...t.sections.map((s) => s.key), t.speaking.key]) {
        expect(PRACTISE_SKILLS).toContain(key);
        const q = getHomeworkQuest(practisePackId(scope!, key));
        expect(q, `${t.testKey} → ${key}`).toBeTruthy();
        expect(q!.levels.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('only reuses lines that the lesson quests already say (no new voice clips)', () => {
    const known = new Set(Object.values(HOMEWORK_QUESTS).flatMap(questLines).map(([v, t]) => `${v}|${t}`));
    for (const p of Object.values(PRACTISE_PACKS)) for (const [v, t] of questLines(p)) expect(known.has(`${v}|${t}`), `${p.id}: ${v} "${t}"`).toBe(true);
  });

  it('keeps level names unique and pack ids apart from lesson quests', () => {
    for (const p of Object.values(PRACTISE_PACKS)) {
      expect(new Set(p.levels.map((l) => l.name)).size, p.id).toBe(p.levels.length);
      expect(HOMEWORK_QUESTS[p.id], p.id).toBeUndefined();
    }
  });
});
