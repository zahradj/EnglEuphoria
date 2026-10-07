import { describe, it, expect } from 'vitest';
import { scoreRegions, pickCaptionPos, SAMPLE_W, SAMPLE_H } from './captionPlacement';

/** A SAMPLE_W x SAMPLE_H RGBA picture: flat grey, with a busy checkerboard "subject" patch. */
function picture(busy?: { x0: number; y0: number; x1: number; y1: number }) {
  const px = new Uint8ClampedArray(SAMPLE_W * SAMPLE_H * 4);
  for (let y = 0; y < SAMPLE_H; y++) {
    for (let x = 0; x < SAMPLE_W; x++) {
      const i = (y * SAMPLE_W + x) * 4;
      const inBusy = busy && x >= busy.x0 && x < busy.x1 && y >= busy.y0 && y < busy.y1;
      const v = inBusy ? ((x + y) % 2 ? 240 : 20) : 128;
      px[i] = px[i + 1] = px[i + 2] = v; px[i + 3] = 255;
    }
  }
  return px;
}
const W = SAMPLE_W, H = SAMPLE_H;

describe('story caption placement (frame goes where the picture is calm)', () => {
  it('a flat picture keeps the natural bottom', () => {
    expect(pickCaptionPos(scoreRegions(picture()))).toBe('bottom');
  });
  it('busy bottom → top; busy top → bottom', () => {
    expect(pickCaptionPos(scoreRegions(picture({ x0: 0, y0: Math.floor(H * 0.7), x1: W, y1: H })))).toBe('top');
    expect(pickCaptionPos(scoreRegions(picture({ x0: 0, y0: 0, x1: W, y1: Math.floor(H * 0.3) })))).toBe('bottom');
  });
  it('busy top AND bottom (characters across the picture) → a calm side', () => {
    const px = picture();
    const put = (x0: number, y0: number, x1: number, y1: number) => {
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * W + x) * 4; const v = (x + y) % 2 ? 240 : 20; px[i] = px[i + 1] = px[i + 2] = v; }
    };
    put(0, 0, W, Math.floor(H * 0.3)); put(0, Math.floor(H * 0.7), W, H); put(Math.floor(W * 0.6), 0, W, H);
    expect(pickCaptionPos(scoreRegions(px))).toBe('left');
  });
  it('busy left and right edges → the plate stays top/bottom', () => {
    const px = picture({ x0: 0, y0: 0, x1: Math.floor(W * 0.4), y1: H });
    const right = picture({ x0: Math.floor(W * 0.6), y0: 0, x1: W, y1: H });
    for (let i = 0; i < px.length; i += 4) if (right[i] !== 128) { px[i] = px[i + 1] = px[i + 2] = right[i]; }
    expect(['top', 'bottom']).toContain(pickCaptionPos(scoreRegions(px)));
  });
});
