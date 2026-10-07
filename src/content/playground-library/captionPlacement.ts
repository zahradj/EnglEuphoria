import { useEffect, useState } from 'react';

/**
 * Where a story page's caption frame goes, decided from the picture itself
 * (owner rule, 2026-10-06): put the text where the generated image has calm
 * space — top, bottom, left or right — never over a character's face.
 *
 * `scoreRegions` is pure (so it is unit-tested on synthetic pixels);
 * `captionPosFor` loads the image once, shrinks it to a small canvas and
 * caches the answer. A page can also pin a side with `textPos`.
 */
export type CaptionPos = 'top' | 'bottom' | 'left' | 'right';

export const CAPTION_POSITIONS: CaptionPos[] = ['top', 'bottom', 'left', 'right'];

export const SAMPLE_W = 64;
export const SAMPLE_H = 40;

/** Busyness (0 = flat sky/wall, higher = detail, edges, faces) of each candidate band. */
export type RegionScores = Record<CaptionPos, number>;

/** The band each side would cover, as fractions of the picture (x0, y0, x1, y1). */
const BANDS: Record<CaptionPos, [number, number, number, number]> = {
  top: [0.03, 0.03, 0.97, 0.25],
  bottom: [0.03, 0.75, 0.97, 0.97],
  left: [0.03, 0.2, 0.37, 0.8],
  right: [0.63, 0.2, 0.97, 0.8],
};

/** Only a tie-breaker: bottom reads most naturally, then top; never enough to cover a face. */
const BIAS: RegionScores = { bottom: 0, top: 0.01, left: 0.03, right: 0.03 };

/** Mean luminance gradient + local contrast per band, from RGBA pixels of a SAMPLE_W x SAMPLE_H image. */
export function scoreRegions(rgba: ArrayLike<number>, w = SAMPLE_W, h = SAMPLE_H): RegionScores {
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = (0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2]) / 255;
  const out = {} as RegionScores;
  for (const pos of CAPTION_POSITIONS) {
    const [fx0, fy0, fx1, fy1] = BANDS[pos];
    const x0 = Math.max(1, Math.floor(fx0 * w)), x1 = Math.min(w - 1, Math.ceil(fx1 * w));
    const y0 = Math.max(1, Math.floor(fy0 * h)), y1 = Math.min(h - 1, Math.ceil(fy1 * h));
    let grad = 0, sum = 0, sumSq = 0, n = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const v = lum[y * w + x];
        grad += Math.abs(v - lum[y * w + x - 1]) + Math.abs(v - lum[(y - 1) * w + x]);
        sum += v; sumSq += v * v; n++;
      }
    }
    if (n === 0) { out[pos] = Infinity; continue; }
    const mean = sum / n;
    const variance = Math.max(0, sumSq / n - mean * mean);
    out[pos] = grad / n + Math.sqrt(variance) * 0.35;
  }
  return out;
}

/** The calmest side (with a small bias towards bottom/top). `sides: false` (narrow phone screens) keeps it top/bottom. */
export function pickCaptionPos(scores: RegionScores, opts: { sides?: boolean; avoid?: CaptionPos[] } = {}): CaptionPos {
  const sides = opts.sides ?? true;
  let best: CaptionPos = 'bottom';
  let bestScore = Infinity;
  for (const pos of CAPTION_POSITIONS) {
    if (!sides && (pos === 'left' || pos === 'right')) continue;
    if (opts.avoid?.includes(pos)) continue; // a scene's own title / controls own that band
    const s = scores[pos] + BIAS[pos];
    if (s < bestScore) { bestScore = s; best = pos; }
  }
  return best;
}

const cache = new Map<string, Promise<RegionScores | null>>();

/** Analyse a picture once; null when it can't be read (then the caption stays at the bottom). */
function scoresFor(url: string): Promise<RegionScores | null> {
  let hit = cache.get(url);
  if (!hit) {
    hit = new Promise<RegionScores | null>((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const c = document.createElement('canvas');
            c.width = SAMPLE_W; c.height = SAMPLE_H;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
            resolve(scoreRegions(ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data));
          } catch { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      } catch { resolve(null); }
    });
    cache.set(url, hit);
  }
  return hit;
}

/** Start analysing pictures early (a story's later pages) so each page's plate is placed the moment it shows. */
export function warmCaptionPlacement(urls: (string | undefined)[]) {
  for (const u of urls) if (u) void scoresFor(u);
}

/** Hook: the page's pinned side, else the picture's calmest side. `ready` is false only while the
 *  picture is still being measured (max ~1.5 s), so the plate can wait instead of jumping. */
export function useCaptionPlacement(url: string | undefined, pinned?: CaptionPos, avoid?: CaptionPos[]): { pos: CaptionPos; ready: boolean } {
  const [state, setState] = useState<{ url?: string; pos: CaptionPos; ready: boolean }>({ pos: 'bottom', ready: false });
  useEffect(() => {
    if (pinned || !url) return;
    let live = true;
    setState((s) => (s.url === url ? s : { url, pos: s.pos, ready: false }));
    const sides = typeof window === 'undefined' || window.innerWidth >= 640;
    const timer = window.setTimeout(() => { if (live) setState((s) => ({ ...s, url, ready: true })); }, 1500);
    void scoresFor(url).then((sc) => { if (live) setState({ url, pos: sc ? pickCaptionPos(sc, { sides, avoid }) : 'bottom', ready: true }); });
    return () => { live = false; window.clearTimeout(timer); };
  }, [url, pinned, avoid?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  if (pinned || !url) return { pos: pinned ?? 'bottom', ready: true };
  return { pos: state.pos, ready: state.ready && state.url === url };
}

/** Hook: just the side (see useCaptionPlacement). */
export function useCaptionPos(url: string | undefined, pinned?: CaptionPos, avoid?: CaptionPos[]): CaptionPos {
  return useCaptionPlacement(url, pinned, avoid).pos;
}
