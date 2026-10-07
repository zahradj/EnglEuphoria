import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Global rule (owner, 2026-10-06): story / narration text over a picture is always shown in
 * the framed paper plate (StoryCaption → StoryPlate) on the calm side of the picture
 * (captionPlacement.ts) — in EVERY hub and scene kind. See lesson-quality-gate, Engine 5 item 10.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
function walk(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(join(root, dir))) {
    const rel = `${dir}/${n}`;
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out);
    else if (/\.tsx$/.test(n) && !/\.test\./.test(n)) out.push(rel);
  }
  return out;
}

/** Scene components whose job is to tell a story / narrate over art. */
const STORY_SCENES = [
  'src/content/playground-library/unit1/scene-components/FlipbookScene.tsx',
  'src/content/playground-library/unit1/scene-components/StoryVideoScene.tsx',
  'src/content/playground-library/unit1/scene-components/CinematicScene.tsx',
  'src/content/playground-library/welcome-town/scene-components/FlipbookScene.tsx',
  'src/content/playground-library/welcome-town/scene-components/CinematicScene.tsx',
];

describe('story text placement (global)', () => {
  it.each(STORY_SCENES)('%s prints its story line with <StoryCaption>', (f) => {
    expect(read(f)).toContain('<StoryCaption');
  });

  it('no scene brings back the old story-text patterns (faint band, grown-up pill, speech-bubble tail)', () => {
    const offenders: string[] = [];
    for (const f of [...walk('src/content/playground-library/unit1/scene-components'), ...walk('src/content/playground-library/welcome-town/scene-components')]) {
      const src = read(f);
      if (/bg-gradient-to-t from-\[#FFF2D0\]/.test(src)) offenders.push(`${f}: gradient caption band`);
      if (/bg-black\/45[^"]*"[^>]*>\{p\.line\}/.test(src)) offenders.push(`${f}: grown-up caption pill`);
      if (/border-t-\[16px\] border-x-transparent border-t-white/.test(src)) offenders.push(`${f}: speech-bubble tail`);
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('every story page type can pin a side with textPos', () => {
    for (const f of ['src/content/playground-library/unit1/scenes.ts', 'src/content/playground-library/welcome-town/scenes.ts']) {
      expect((read(f).match(/textPos\?:/g) ?? []).length, f).toBeGreaterThanOrEqual(1);
    }
  });
});
