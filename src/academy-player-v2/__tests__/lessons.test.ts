import { describe, expect, it } from 'vitest';
import { scriptIds, loadScript } from '../lessonScripts';
import { validateScript } from '../engine/validateScript';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';

// Every registered lesson must be valid, read its blueprint, model before it asks, state the rule before the practice games, and end with a teach-back.
describe('registered lessons', () => {
  for (const id of scriptIds()) {
    it(`${id} is valid and follows the Academy rules`, async () => {
      const s = (await loadScript(id))!;
      expect(validateScript(s)).toEqual([]);
      expect(ACADEMY_LESSON_BLUEPRINTS.some((b) => b.id === s.blueprintId)).toBe(true);
      const kinds = s.scenes.map((x) => x.kind);
      expect(kinds[0]).toBe('lobby');
      expect(kinds[kinds.length - 1]).toBe('wrap');
      expect(kinds.indexOf('model')).toBeGreaterThan(-1);
      expect(kinds.indexOf('rule')).toBeGreaterThan(kinds.indexOf('model') - 1);
      // the rule comes before the production games of its own part and later (a warm-up build earlier in the lesson is not practice of the rule)
      const ri = kinds.indexOf('rule');
      const rp = s.scenes[ri].part;
      const late = s.scenes.flatMap((x, i) => (x.part >= rp && ['build', 'boss', 'forge', 'rapport', 'write'].includes(x.kind) ? [i] : []));
      for (const i of late) expect(i, `${s.scenes[i].id} comes before the rule`).toBeGreaterThan(ri);
      // every criterion is trained by at least one scene
      for (let c = 1; c <= s.criteria.length; c++) expect(s.scenes.some((x) => x.trains?.includes(c)), `criterion ${c}`).toBe(true);
      // speaking is the biggest share: at least one speak scene in 4+ different parts
      expect(new Set(s.scenes.filter((x) => x.kind === 'speak').map((x) => x.part)).size).toBeGreaterThanOrEqual(4);
    });
  }
});

import { spokenLines } from '../engine/spokenLines';
describe('voice lines', () => {
  it('every registered lesson has recordable lines, each said by a cast member with a voice', async () => {
    const { ACADEMY_VOICES } = await import('../../academy-deck/voices');
    for (const id of scriptIds()) {
      const s = (await loadScript(id))!;
      const lines = spokenLines(s);
      expect(lines.length).toBeGreaterThan(20);
      for (const l of lines) expect(ACADEMY_VOICES[l.who as keyof typeof ACADEMY_VOICES], `${l.who}: ${l.text}`).toBeTruthy();
    }
  });
});
