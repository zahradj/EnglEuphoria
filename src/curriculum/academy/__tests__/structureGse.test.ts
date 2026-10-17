// Every A1 structure of the Academy roadmap carries its Pearson GSE value, and none lies beyond Pearson's "introduce about 10 points ahead" lead.
import { describe, expect, it } from 'vitest';
import { ACADEMY_SEASONS } from '../index';
import { A1_STRUCTURE_GSE, GSE_A1_BAND, GSE_INTRODUCE_AHEAD } from '../structureGse';

describe('A1 structures against the Pearson GSE (Adult Grammar, 2023)', () => {
  const a1 = ACADEMY_SEASONS.filter((s) => s.level === 'A1');
  const ids = [...new Set(a1.flatMap((s) => s.structures.map((x) => x.id)))];
  it('every A1 structure has a GSE entry, and nothing else is listed', () => {
    expect(ids.filter((i) => !A1_STRUCTURE_GSE[i])).toEqual([]);
    expect(Object.keys(A1_STRUCTURE_GSE).filter((i) => !ids.includes(i))).toEqual([]);
  });
  it('no A1 structure is introduced further ahead of its GSE value than Pearson recommends (the lowest sub-use is within band top + 10)', () => {
    for (const id of ids) expect(A1_STRUCTURE_GSE[id].gse[0], id).toBeLessThanOrEqual(GSE_A1_BAND[1] + GSE_INTRODUCE_AHEAD);
  });
  it('each entry is a valid range (low <= high) with a source note', () => {
    for (const [id, v] of Object.entries(A1_STRUCTURE_GSE)) { expect(v.gse[0], id).toBeLessThanOrEqual(v.gse[1]); expect(v.from.length).toBeGreaterThan(10); }
  });
});
