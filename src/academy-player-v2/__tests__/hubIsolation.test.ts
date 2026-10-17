// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getDomPath, getElementAtPath } from '../classroom/domPath';

// Hub separation (CLAUDE.md, owner 2026-10-08): the Academy player never imports Playground (or Success) code.
const ROOT = path.resolve(__dirname, '..');
const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const FORBIDDEN = /from\s+['"][^'"]*(playground-library|playground-player|components\/playground|\/playground\/|success-hub|content\/success)[^'"]*['"]/;

describe('Academy player v2 is isolated from the other hubs', () => {
  it('no file imports Playground or Success code', () => {
    const offenders = walk(ROOT).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes('__tests__')).filter((f) => FORBIDDEN.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
  });
});

describe('domPath (Academy-owned)', () => {
  it('a path recorded on one tree finds the same element on an identical tree', () => {
    const make = () => { const r = document.createElement('div'); r.innerHTML = '<div><button>a</button><span><b>x</b><i>y</i></span></div><p>z</p>'; return r; };
    const a = make(); const b = make();
    const target = a.querySelector('i')!;
    const path = getDomPath(a, target)!;
    expect(path).toEqual([0, 1, 1]);
    expect(getElementAtPath(b, path)?.tagName).toBe('I');
    expect(getDomPath(a, document.createElement('div'))).toBeNull();
    expect(getElementAtPath(b, [5])).toBeNull();
  });
});
