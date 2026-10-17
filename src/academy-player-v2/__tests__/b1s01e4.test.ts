// B1-S01-E4 "On Air": the lesson's own promises (response count, story flags chain from E3, no digits in voice lines, the On Air scenes are valid).
import { describe, expect, it } from 'vitest';
import { B1_S01_E3 } from '../lessons/b1s01e3';
import { B1_S01_E4 } from '../lessons/b1s01e4';
import { lessonResponses } from '../engine/responses';
import { spokenLines } from '../engine/spokenLines';
import { validateScript } from '../engine/validateScript';
import { validateOnAir, type OnAirScene } from '../scenes/onair/onairLogic';

describe('B1-S01-E4 On Air', () => {
  it('is valid and reaches at least 80 minimum-path student responses', () => {
    expect(validateScript(B1_S01_E4)).toEqual([]);
    expect(lessonResponses(B1_S01_E4).total).toBeGreaterThanOrEqual(80);
  });
  it('"Previously on…" reads a flag that Lesson 3 really sets', () => {
    const wanted = (B1_S01_E4.previously?.beats ?? []).flatMap((b) => (b.when ? [b.when] : []));
    const e3 = B1_S01_E3.scenes.find((s) => s.kind === 'wrap') as unknown as { story?: Record<string, unknown> };
    for (const f of wanted) expect(e3.story?.[f], f).toBeTruthy();
    expect(B1_S01_E4.previously?.from).toBe('B1-S01-E3');
  });
  it('has every On Air scene valid, a signature Two Truths round, and a quick-fire round', () => {
    const air = B1_S01_E4.scenes.filter((s) => s.kind === 'onair') as unknown as OnAirScene[];
    expect(air.length).toBeGreaterThanOrEqual(3);
    for (const a of air) expect(validateOnAir(a), a.id).toEqual([]);
    expect(air.some((a) => a.look === 'twotruths')).toBe(true);
    expect(air.some((a) => a.lightning)).toBe(true);
  });
  it('teaches the chunks in two sets of four, each followed by a matching game, before the practice that uses them', () => {
    const k = B1_S01_E4.scenes.map((s) => s.id);
    expect(k.indexOf('teach-a')).toBeLessThan(k.indexOf('match-a'));
    expect(k.indexOf('match-a')).toBeLessThan(k.indexOf('teach-b'));
    expect(k.indexOf('match-b')).toBeLessThan(k.indexOf('chunk-memory'));
    expect(k.indexOf('chunk-memory')).toBeLessThan(k.indexOf('radar'));
  });
  it('voice lines have no digits or symbols the voice cannot say', () => {
    for (const l of spokenLines(B1_S01_E4)) expect(l.text, l.text).not.toMatch(/[0-9_/\\=+*#@<>{}[\]|~^]/);
  });
  it('ends with a wrap that records the show as finished', () => {
    const w = B1_S01_E4.scenes.at(-1) as unknown as { kind: string; story?: Record<string, unknown> };
    expect(w.kind).toBe('wrap');
    expect(w.story).toEqual({ showFinished: true });
  });
});
