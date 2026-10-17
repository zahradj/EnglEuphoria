// A2-C1: every structure of the roadmap is checked against the Pearson GSE adult grammar objectives (src/curriculum/academy/gse/<level>.ts).
// A structure with no objective in the list says so (gse: null); one rated well above its level's band carries a `chunkFirst` note.
import { describe, expect, it } from 'vitest';
import { ACADEMY_SEASONS } from '../index';
import { STRUCTURE_GSE } from '../gse';
import { GSE_BAND_TOP, GSE_CHUNK_FIRST_MARGIN } from '../structureGse';

const LEVELS = ['A2', 'B1', 'B2', 'C1'] as const;

describe('A2-C1 structures against the Pearson GSE (Adult Grammar, 2023)', () => {
  for (const level of LEVELS) {
    const ids = [...new Set(ACADEMY_SEASONS.filter((s) => s.level === level).flatMap((s) => s.structures.map((x) => x.id)))];
    it(`${level}: every structure has an entry; numbers are valid; chunkFirst where it is well above the band`, () => {
      expect(ids.filter((i) => !STRUCTURE_GSE[i]), `${level} structures without a GSE entry`).toEqual([]);
      for (const id of ids) {
        const e = STRUCTURE_GSE[id];
        expect(e.from.length, `${id} from`).toBeGreaterThan(10);
        if (e.gse) {
          expect(e.gse[0], id).toBeLessThanOrEqual(e.gse[1]);
          if (e.gse[1] >= GSE_BAND_TOP[level] + GSE_CHUNK_FIRST_MARGIN) expect(e.chunkFirst?.length ?? 0, `${id} chunkFirst`).toBeGreaterThan(15);
        }
      }
    });
  }
});
