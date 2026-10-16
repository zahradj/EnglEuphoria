import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ACADEMY_SEASONS } from '../index';
import { SEASON_GAMES, SEASON_GAMES_LEVELS } from '../gamePlan';

const ROOT = path.resolve(__dirname, '../../../..');
const order: Record<string, number> = { 'Pre-A1': 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

function catalogue(): Map<number, { name: string; from: string; to: string }> {
  const m = new Map<number, { name: string; from: string; to: string }>();
  for (const line of fs.readFileSync(path.join(ROOT, 'docs/academy-games-catalog.md'), 'utf8').split('\n')) {
    const c = line.split('|').map((x) => x.trim());
    if (c.length > 8 && /^\d+$/.test(c[1])) {
      const mm = c[6].match(/^(Pre-A1|A1|A2|B1|B2|C1)-(A1|A2|B1|B2|C1)$/);
      if (mm) m.set(Number(c[1]), { name: c[2], from: mm[1], to: mm[2] });
    }
  }
  return m;
}
function mechanics(): Set<string> {
  const s = new Set<string>();
  for (const line of fs.readFileSync(path.join(ROOT, 'docs/academy-video-game-mechanics.md'), 'utf8').split('\n')) {
    const c = line.split('|').map((x) => x.trim());
    if (c.length > 5 && c[1] && c[1] !== 'Mechanic' && !c[1].startsWith('--')) s.add(c[1]);
  }
  return s;
}

describe('Season games shortlist', () => {
  const cat = catalogue();
  const mech = mechanics();
  it('the catalogue and the mechanics list are readable', () => {
    expect(cat.size).toBe(171);
    expect(mech.size).toBeGreaterThanOrEqual(19);
  });
  it('every Season of a covered level has 4-6 catalogue games that exist and fit the level', () => {
    for (const s of ACADEMY_SEASONS.filter((x) => (SEASON_GAMES_LEVELS as readonly string[]).includes(x.level))) {
      const p = SEASON_GAMES[s.id];
      expect(p, s.id).toBeTruthy();
      expect(p.catalogue.length, s.id).toBeGreaterThanOrEqual(4);
      expect(p.catalogue.length, s.id).toBeLessThanOrEqual(6);
      expect(new Set(p.catalogue).size, s.id).toBe(p.catalogue.length);
      for (const id of p.catalogue) {
        const e = cat.get(id);
        expect(e, `${s.id} game ${id}`).toBeTruthy();
        expect(order[e!.from], `${s.id} game ${id} (${e!.name}) starts above ${s.level}`).toBeLessThanOrEqual(order[s.level]);
        expect(order[e!.to], `${s.id} game ${id} (${e!.name}) ends below ${s.level}`).toBeGreaterThanOrEqual(order[s.level]);
      }
      expect(p.catalogue, s.id).toContain(p.signature);
      expect(mech.has(p.mechanic), `${s.id}: "${p.mechanic}" is not in the mechanics list`).toBe(true);
      expect(p.does.length, s.id).toBeGreaterThan(20);
    }
  });
  it('does not repeat the same signature game in neighbouring Seasons', () => {
    for (const lvl of SEASON_GAMES_LEVELS) {
      const ids = ACADEMY_SEASONS.filter((x) => x.level === lvl).map((x) => x.id);
      for (let i = 1; i < ids.length; i++) expect(SEASON_GAMES[ids[i]].signature, ids[i]).not.toBe(SEASON_GAMES[ids[i - 1]].signature);
    }
  });
});

describe('Season games shortlist on the blueprint', () => {
  it('is carried on every lesson blueprint of a covered Season', async () => {
    const { ACADEMY_LESSON_BLUEPRINTS } = await import('../index');
    const bp = ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.seasonId === 'B2-S05');
    expect(bp.length).toBe(8);
    bp.forEach((b) => expect(b.gamePlan?.signature).toBe(117));
  });
});
