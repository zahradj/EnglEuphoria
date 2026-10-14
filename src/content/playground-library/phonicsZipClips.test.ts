import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Every isolated phonics sound plays from public/phonics-sounds/phonics-zip. The table in audio.ts must only point at real
// files listed in the manifest, and the sounds the zip does not have must still have their older master clip.
const root = path.resolve(__dirname, '../../..');
const audioSrc = fs.readFileSync(path.join(__dirname, 'unit1/audio.ts'), 'utf8');
const block = audioSrc.match(/const PHONICS_ZIP_CLIP[^=]*= \{([\s\S]*?)\n\};/)![1];
const entries = [...block.matchAll(/'?([a-z-]+)'?:\s*'([a-z0-9_-]+)'/g)].map((m) => [m[1], m[2]] as const);
const keys = new Set(entries.map(([k]) => k));

describe('phonics.zip clips', () => {
  it('covers all 26 letters', () => {
    for (const l of 'abcdefghijklmnopqrstuvwxyz') expect(keys.has(l), l).toBe(true);
  });
  it('every wired file exists and is listed in the manifest', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/phonics-sounds/phonics-zip/manifest.json'), 'utf8'));
    const known = new Set(manifest.sounds.map((s: { file: string }) => s.file));
    for (const [, file] of entries) {
      expect(fs.existsSync(path.join(root, `public/phonics-sounds/phonics-zip/${file}.mp3`)), file).toBe(true);
      expect(known.has(`${file}.mp3`), file).toBe(true);
    }
  });
  it('sounds the zip lacks (wh, au, ing, long a/e/i/o/u) keep their older recorded clip', () => {
    for (const k of ['wh', 'au', 'ing']) {
      expect(keys.has(k), k).toBe(false);
      expect(fs.existsSync(path.join(root, `public/lep1/audio/letters/phon-${k}.ogg`)), k).toBe(true);
    }
    for (const v of ['a', 'e', 'i', 'o', 'u']) expect(fs.existsSync(path.join(root, `public/lep1/audio/letters/phon-${v}-long.ogg`)), v).toBe(true);
  });
});
