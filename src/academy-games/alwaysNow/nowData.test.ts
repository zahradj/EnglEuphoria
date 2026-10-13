import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {}, supabaseUrl: '', supabaseAnonKey: '' }));
import { cacheFileName } from '@/content/playground-library/unit1/audio';
import { ACADEMY_GAMES } from '../academyGamesCatalog';
import { FUNNY, GATES, JUDGES, MONSTERS, RECALLS, SORT_CUES, SPELLS, STATIVES, gateAnswer, nowLines, spellOptions } from './nowData';

describe('Always or Now data', () => {
  it('every gate and funny round has exactly one right answer from its cue', () => {
    for (const g of [...GATES, ...FUNNY, ...MONSTERS]) {
      expect(g.text, g.id).toContain('___');
      expect(g.text.toLowerCase(), g.id).toContain(g.cue.toLowerCase());
      expect(g.simple, g.id).not.toBe(g.continuous);
      expect(gateAnswer(g)).toBe(g.tense === 'simple' ? g.simple : g.continuous);
      if (g.tense === 'continuous') expect(g.continuous, g.id).toMatch(/\b(am|is|are) \w+ing$/);
    }
    expect(GATES.filter((g) => g.tense === 'simple').length).toBe(GATES.filter((g) => g.tense === 'continuous').length);
    expect(FUNNY.length).toBeGreaterThanOrEqual(8);
  });

  it('Silly Judge: wrong sentences differ from their fix by the verb form only', () => {
    expect(JUDGES.some((j) => j.ok)).toBe(true);
    expect(JUDGES.some((j) => !j.ok)).toBe(true);
    for (const j of JUDGES) {
      if (j.ok) expect(j.fixed).toBe(j.text);
      else { expect(j.fixed).not.toBe(j.text); expect(j.text.replace(j.wrongForm, j.rightForm)).toBe(j.fixed); }
    }
  });

  it('spelling answers follow the rules and options are three different spellings', () => {
    for (const s of SPELLS) {
      const o = spellOptions(s);
      expect(o, s.id).toHaveLength(3);
      expect(new Set(o).size, s.id).toBe(3);
      expect(o).toContain(s.correct);
      const b = s.base;
      const last = b[b.length - 1];
      const expected = s.kind === 's'
        ? (/[^aeiou]y$/.test(b) ? `${b.slice(0, -1)}ies` : /(ch|sh|s|x|z|o)$/.test(b) ? `${b}es` : `${b}s`)
        : (/e$/.test(b) ? `${b.slice(0, -1)}ing` : ['run', 'swim', 'sit'].includes(b) ? `${b}${last}ing` : `${b}ing`);
      expect(s.correct, s.id).toBe(expected);
    }
  });

  it('state verbs: the wrong sentence is the -ing one', () => {
    for (const s of STATIVES) {
      expect(s.wrong, s.id).toMatch(/ing\b/);
      expect(s.right, s.id).not.toMatch(new RegExp(`\\b(am|is|are) \\w*ing\\b`));
    }
  });

  it('recall answers are the form the cue asks for', () => {
    for (const r of RECALLS) {
      expect(r.text).toContain('___');
      if (r.tense === 'continuous') expect(r.answer).toMatch(/^(am|is|are) \w+ing$/);
      else expect(r.answer).not.toMatch(/ing$/);
    }
    expect(SORT_CUES.length).toBeGreaterThanOrEqual(10);
  });

  it('every spoken line is a baked static clip on disk (no live voice)', () => {
    const missing = nowLines().filter((l) => !existsSync(join(process.cwd(), 'public', 'audio-cache', `${cacheFileName('teacher', l)}.mp3`)));
    expect(missing).toEqual([]);
  });

  it('is in the Academy catalog with a cover that exists', () => {
    const g = ACADEMY_GAMES.find((x) => x.id === 'always-or-now')!;
    expect(g).toBeTruthy();
    expect(existsSync(join(process.cwd(), 'public', g.cover.replace(/^\//, '')))).toBe(true);
  });
});
