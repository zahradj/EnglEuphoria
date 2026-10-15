import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PALETTE, PICTURE_COLOUR_LINE } from './gameSkin';

// Owner, 2026-10-15: "Use the branded color shades in the generated images as well."
describe('Playground pictures use the brand shades', () => {
  it('the colour line names the brand palette', () => {
    for (const hex of [PALETTE.orange, PALETTE.sun, PALETTE.cream, PALETTE.sky, PALETTE.green]) expect(PICTURE_COLOUR_LINE).toContain(hex);
  });
  it('the art bake script adds the same line', () => {
    const script = fs.readFileSync('scripts/generate-art.mjs', 'utf8');
    expect(script).toContain(`'${PICTURE_COLOUR_LINE}'`);
    expect(script).toContain('rawTargets.map(withBrandColours)');
  });
});
