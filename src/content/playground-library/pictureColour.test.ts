import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PALETTE, PICTURE_COLOUR_LINE } from './gameSkin';

// Owner, 2026-10-15: "Use the branded color shades in the generated images as well."
describe('Playground pictures: full colour with the brand shades as accents', () => {
  it('the colour line names the brand palette', () => {
    for (const hex of [PALETTE.orange, PALETTE.tangerine, PALETTE.sun, PALETTE.amber, PALETTE.honey, PALETTE.cream]) expect(PICTURE_COLOUR_LINE).toContain(hex);
  });
  // Owner, 2026-10-17 (later the same day): "In the images, make it look fully colored. Don't use just the branded color."
  it('the colour line asks for full, natural colour (not only the brand shades)', () => {
    expect(PICTURE_COLOUR_LINE).toMatch(/FULL, rich, natural colour/);
    expect(PICTURE_COLOUR_LINE).not.toMatch(/ONLY the EnglEuphoria/);
  });
  it('the art bake script adds the same line', () => {
    const script = fs.readFileSync('scripts/generate-art.mjs', 'utf8');
    expect(script).toContain(`'${PICTURE_COLOUR_LINE}'`);
    expect(script).toContain('rawTargets.map(withBrandColours)');
  });
});
