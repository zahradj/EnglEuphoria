import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { scriptIds, loadScript } from '../lessonScripts';

const RESEARCH = path.resolve(__dirname, '../../../docs/research');
const GAME_KINDS = new Set(['sort', 'memory', 'match', 'build', 'forge', 'boss', 'rapport', 'choice', 'write', 'teach', 'hunt', 'inspect', 'interview', 'objection', 'cipher', 'finder', 'workshop', 'beats', 'switchboard', 'onair', 'archive', 'factcheck', 'redpen', 'deck']);

// Owner rule 2026-10-17: every lesson researches compatible games (per criterion) and every game is illustrated, never a flat screen.
describe('game research and illustration of every registered lesson', () => {
  for (const id of scriptIds()) {
    it(`${id}: a research file has a Game search section; every scene has an illustrated plate; at least 4 different plates`, async () => {
      const s = (await loadScript(id))!;
      const [lvl, season, ep] = id.toLowerCase().split('-'); // b1 s01 e2
      const prefix = `academy-${lvl}-${season}`;
      const files = fs.readdirSync(RESEARCH).filter((f) => f.startsWith(prefix) && f.endsWith('.md'));
      const own = files.filter((f) => f.includes(`-${ep}-`) || f === `${prefix}-research.md`);
      const hasSearch = own.some((f) => /game search/i.test(fs.readFileSync(path.join(RESEARCH, f), 'utf8')));
      expect(hasSearch, `no "Game search" section in docs/research/${prefix}*${ep}* (${own.join(', ') || 'no file'})`).toBe(true);
      const round2 = files.some((f) => /games-round2/.test(f));
      expect(round2, 'the Season needs its games research (…-games-round2-research.md or newer)').toBe(true);
      const flat = s.scenes.filter((x) => !x.plate).map((x) => x.id);
      expect(flat, 'scenes with no illustrated plate (flat screens)').toEqual([]);
      expect(new Set(s.scenes.map((x) => x.plate)).size).toBeGreaterThanOrEqual(4);
      expect(s.scenes.filter((x) => GAME_KINDS.has(x.kind)).length).toBeGreaterThanOrEqual(8);
    });
  }
});
