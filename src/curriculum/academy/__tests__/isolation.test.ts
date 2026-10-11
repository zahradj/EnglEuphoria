// Hub separation (owner rule, 2026-10-08): the Academy curriculum blueprint and lesson blueprint are the Academy's own.
// Nothing in src/curriculum/academy may import from Playground, Success or any shared blueprint module, and nothing outside
// this folder may be changed by Academy work. Only relative imports that stay inside this folder (plus vitest) are allowed.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

const ROOT = resolve(__dirname, '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });
}

describe('Academy isolation', () => {
  const files = walk(ROOT);

  it('finds the Academy files', () => {
    expect(files.length).toBeGreaterThan(8);
  });

  it('imports only from inside src/curriculum/academy (or vitest / node builtins in tests)', () => {
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      const specs = [...src.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const spec of specs) {
        if (spec.startsWith('.')) {
          const target = resolve(dirname(f), spec);
          if (target !== ROOT && !target.startsWith(ROOT + sep)) offenders.push(`${f} -> ${spec}`);
        } else if (!(f.includes(`${sep}__tests__${sep}`) && (spec === 'vitest' || spec.startsWith('node:')))) {
          offenders.push(`${f} -> ${spec}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('does not mention other hubs\' blueprint modules', () => {
    const banned = ['playground-library', 'playground-blueprint', 'contentCreator/lessonBlueprint', 'a1Roadmap', 'prea1Blueprint', 'a1Blueprint', 'worldRotator'];
    const hits: string[] = [];
    for (const f of files.filter((x) => !x.includes(`${sep}__tests__${sep}`))) {
      const src = readFileSync(f, 'utf8');
      // comments may explain the separation; only real import statements count
      for (const m of src.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)) {
        if (banned.some((b) => m[1].includes(b))) hits.push(`${f} -> ${m[1]}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
