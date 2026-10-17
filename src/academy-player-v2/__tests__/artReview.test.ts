import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { scriptIds, loadScript } from '../lessonScripts';
import { ART_REVIEW } from '../artReview';
import { artOf, webpSize } from '../engine/artOf';

const ART = path.resolve(__dirname, '../../../public/academy-art');

// Art gate (owner 2026-10-17): every picture of a lesson exists, is the right shape, and was reviewed for content fit, limbs and character consistency.
describe('art check of every registered lesson', () => {
  for (const id of scriptIds()) {
    it(`${id}: pictures exist, comic plates are 16:9, all reviewed ok`, async () => {
      const { all, comic } = artOf((await loadScript(id))!);
      const problems: string[] = [];
      for (const a of all) {
        const f = path.join(ART, `${a}.webp`);
        if (!fs.existsSync(f)) { problems.push(`${a}: file is missing`); continue; }
        const r = ART_REVIEW[a];
        if (!r) problems.push(`${a}: not reviewed yet (look at it, zoom on hands and faces, then add it to artReview.ts)`);
        else {
          if (r.anatomy !== 'ok') problems.push(`${a}: marked redo (${r.note ?? 'regenerate'})`);
          if (r.cast === 'inconsistent') problems.push(`${a}: characters do not match their references`);
          if (!r.content.trim()) problems.push(`${a}: no content note`);
        }
        if (comic.includes(a)) {
          const sz = webpSize(new Uint8Array(fs.readFileSync(f)));
          if (!sz || Math.abs(sz.w / sz.h - 16 / 9) > 0.03) problems.push(`${a}: a story plate must be 16:9 (is ${sz ? `${sz.w}x${sz.h}` : 'unreadable'})`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
  it('the reviewed-redo list is never used by a lesson (self-check of the register)', () => {
    expect(Object.entries(ART_REVIEW).filter(([, r]) => r.anatomy === 'redo').map(([k]) => k)).toEqual(['bg/story-b1s1-4']);
  });
});
