import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Owner rule: the answer blocks of a Homework Quest step live INSIDE the scene
 * frame (a "dock" along its bottom edge), never in a row under it where the
 * frame looks empty and the blocks fall below the fold.
 */
const src = readFileSync(join(process.cwd(), 'src/components/homework-quest/HomeworkQuest.tsx'), 'utf8');

describe('homework quest layout', () => {
  it('word blocks, built line and reading options are docked inside the frame', () => {
    expect(src).not.toContain('className="hq-opts"');
    expect((src.match(/hq-dock hq-dock-words/g) ?? []).length).toBeGreaterThanOrEqual(3); // sentence builder + twister (build, say)
    expect(src).toContain('hq-dock hq-dock-opts');
    // every bank of word blocks sits before its frame closes
    for (const m of src.matchAll(/^[ \t]*<div className="hq-words">/gm)) {
      const before = src.slice(0, m.index);
      const lastDock = before.lastIndexOf('<div className="hq-dock');
      const lastStageClose = before.lastIndexOf('</Stage>');
      expect(lastDock, 'hq-words outside a dock').toBeGreaterThan(lastStageClose);
    }
  });
});
