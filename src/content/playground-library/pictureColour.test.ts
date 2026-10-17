import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PALETTE, PICTURE_COLOUR_LINE } from './gameSkin';

// Owner, 2026-10-15: "Use the branded color shades in the generated images as well."
describe('Playground pictures use the brand shades', () => {
  it('the colour line names the brand palette', () => {
    for (const hex of [PALETTE.orange, PALETTE.tangerine, PALETTE.sun, PALETTE.amber, PALETTE.honey, PALETTE.cream]) expect(PICTURE_COLOUR_LINE).toContain(hex);
  });
  // Owner, 2026-10-17: "use only the playground branded colors, which is yellow shades and orange shades."
  it('the colour line names no other hub colour (no purple, blue or green brand shade)', () => {
    for (const hex of ['#38BDF8', '#22C55E', '#6D28D9', '#A855F7']) expect(PICTURE_COLOUR_LINE).not.toContain(hex);
  });
  it('the art bake script adds the same line', () => {
    const script = fs.readFileSync('scripts/generate-art.mjs', 'utf8');
    expect(script).toContain(`'${PICTURE_COLOUR_LINE}'`);
    expect(script).toContain('rawTargets.map(withBrandColours)');
  });
});
