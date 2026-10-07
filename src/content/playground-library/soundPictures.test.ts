import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A1/A2 sound lessons show each anchor word as a PICTURE (a well-drawn cartoon illustration with a
 * transparent background — never the system emoji, which renders as a 3D glyph). Words that still only
 * have an emoji are listed below; the list may only shrink. A NEW anchor without `img` fails the build.
 * (Pre-A1 `unit1` anchors already all have pictures.)
 */
const KNOWN_EMOJI_ONLY = new Set([
  'kitchen', 'cheese', 'chick', 'wand', 'wizard', 'web',   // Magic Castle CH + W
  'pig', 'pen', 'pan', 'ink', 'insect', 'net', 'fan', 'fox', // Welcome Town P, I, N, F
]);

function anchorsWithoutPicture(): string[] {
  const dir = join(process.cwd(), 'src/content/playground-library');
  const out: string[] = [];
  for (const folder of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'unit1')) {
    let src = '';
    try { src = readFileSync(join(dir, folder.name, 'scenes.ts'), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/kind: 'sound-model'[\s\S]*?anchors: \[([\s\S]*?)\]\s*,?\s*\n/g)) {
      // one anchor per line (emoji escapes like \u{1F981} contain braces, so don't parse the braces)
      for (const line of m[1].split('\n')) {
        const w = line.match(/word: '([^']+)'/);
        if (w && !/\bimg:/.test(line)) out.push(w[1]);
      }
    }
  }
  return out;
}

describe('sound-lesson anchor pictures', () => {
  it('every anchor has a picture, except the known emoji-only words (which may only shrink)', () => {
    const missing = anchorsWithoutPicture();
    const fresh = missing.filter((w) => !KNOWN_EMOJI_ONLY.has(w));
    expect(fresh, `Add a picture (img) for: ${fresh.join(', ')}`).toEqual([]);
    const done = [...KNOWN_EMOJI_ONLY].filter((w) => !missing.includes(w));
    expect(done, `These now have pictures — remove them from KNOWN_EMOJI_ONLY: ${done.join(', ')}`).toEqual([]);
  });
});
