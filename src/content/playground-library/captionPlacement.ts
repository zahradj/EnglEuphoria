import { useEffect, useState } from 'react';

/**
 * Where a story page's caption frame goes, decided from the picture itself
 * (owner rules, 2026-10-06 / 07): put the text where the picture has calm space — top, bottom,
 * left or right — and TOP PRIORITY never hide anything important (a character, a small fish,
 * the key object). So:
 *   • a band's score is its busiest part, not just its average — a small subject in a big calm
 *     band (a little fish in the sea) still counts;
 *   • for a VIDEO the frames across the page's time window are measured and the worst case wins,
 *     so the plate stays clear of things that swim or walk into view later;
 *   • a page can pin a side with `textPos`.
 *
 * `scoreRegions` / `combineScores` / `pickCaptionPos` are pure (unit-tested on synthetic pixels);
 * the loaders shrink a picture / video frame to a small canvas and cache the answer.
 */
export type CaptionPos = 'top' | 'bottom' | 'left' | 'right';

export const CAPTION_POSITIONS: CaptionPos[] = ['top', 'bottom', 'left', 'right'];

export const SAMPLE_W = 96;
export const SAMPLE_H = 54;

/** Busyness (0 = flat sky/wall/water, higher = detail, edges, faces, objects) of each candidate band. */
export type RegionScores = Record<CaptionPos, number>;

/** The band each side would cover, as fractions of the picture (x0, y0, x1, y1). */
const BANDS: Record<CaptionPos, [number, number, number, number]> = {
  top: [0.03, 0.03, 0.97, 0.25],
  bottom: [0.03, 0.75, 0.97, 0.97],
  left: [0.03, 0.2, 0.37, 0.8],
  right: [0.63, 0.2, 0.97, 0.8],
};

/** Only a tie-breaker: bottom reads most naturally, then top; never enough to cover a subject. */
const BIAS: RegionScores = { bottom: 0, top: 0.01, left: 0.03, right: 0.03 };

/**
 * Per band: how much "something is here" there is. Each pixel's saliency = its local luminance gradient
 * + how far its colour is from the band's typical (median) colour; the band scores half its mean and
 * half its 92nd percentile (so a small distinct object is not averaged away), plus a little luminance spread.
 */
export function scoreRegions(rgba: ArrayLike<number>, w = SAMPLE_W, h = SAMPLE_H): RegionScores {
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = (0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2]) / 255;
  const out = {} as RegionScores;
  for (const pos of CAPTION_POSITIONS) {
    const [fx0, fy0, fx1, fy1] = BANDS[pos];
    const x0 = Math.max(1, Math.floor(fx0 * w)), x1 = Math.min(w - 1, Math.ceil(fx1 * w));
    const y0 = Math.max(1, Math.floor(fy0 * h)), y1 = Math.min(h - 1, Math.ceil(fy1 * h));
    const n = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    if (n === 0) { out[pos] = Infinity; continue; }
    const rs = new Float32Array(n), gs = new Float32Array(n), bs = new Float32Array(n);
    let k = 0, lsum = 0, lsq = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = y * w + x;
        rs[k] = rgba[i * 4] / 255; gs[k] = rgba[i * 4 + 1] / 255; bs[k] = rgba[i * 4 + 2] / 255;
        lsum += lum[i]; lsq += lum[i] * lum[i];
        k++;
      }
    }
    const median = (a: Float32Array) => { const c = Float32Array.from(a).sort(); return c[c.length >> 1]; };
    const mr = median(rs), mg = median(gs), mb = median(bs);
    const sal = new Float32Array(n);
    let sum = 0;
    k = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = y * w + x;
        const grad = Math.abs(lum[i] - lum[i - 1]) + Math.abs(lum[i] - lum[i - w]);
        const dist = (Math.abs(rs[k] - mr) + Math.abs(gs[k] - mg) + Math.abs(bs[k] - mb)) / 3;
        sal[k] = grad + 0.6 * dist;
        sum += sal[k];
        k++;
      }
    }
    const sorted = Float32Array.from(sal).sort();
    const p92 = sorted[Math.min(n - 1, Math.floor(n * 0.92))];
    const mean = lsum / n;
    const spread = Math.sqrt(Math.max(0, lsq / n - mean * mean));
    out[pos] = 0.5 * (sum / n) + 0.5 * p92 + spread * 0.35;
  }
  return out;
}

/** Worst case per band across several frames (a subject that appears in any frame keeps its band busy). */
export function combineScores(list: RegionScores[]): RegionScores {
  const out = { top: 0, bottom: 0, left: 0, right: 0 } as RegionScores;
  for (const s of list) for (const pos of CAPTION_POSITIONS) out[pos] = Math.max(out[pos], s[pos]);
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

function scoreSource(source: CanvasImageSource): RegionScores | null {
  try {
    const c = document.createElement('canvas');
    c.width = SAMPLE_W; c.height = SAMPLE_H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, SAMPLE_W, SAMPLE_H);
    return scoreRegions(ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data);
  } catch { return null; }
}

/** Analyse a picture once; null when it can't be read (then the caption stays at the bottom). */
function scoresFor(url: string): Promise<RegionScores | null> {
  let hit = cache.get(url);
  if (!hit) {
    hit = new Promise<RegionScores | null>((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(scoreSource(img));
        img.onerror = () => resolve(null);
        img.src = url;
      } catch { resolve(null); }
    });
    cache.set(url, hit);
  }
  return hit;
}

/* ---------- video: measure real frames across a page's time window ---------- */

export interface VideoWindow { url: string; from: number; to: number }

const videoQueue = new Map<string, Promise<unknown>>(); // one hidden <video> per file, frames measured one after another
const videoCache = new Map<string, Promise<RegionScores | null>>();
const videoEls = new Map<string, Promise<HTMLVideoElement | null>>();

function videoElement(url: string): Promise<HTMLVideoElement | null> {
  let hit = videoEls.get(url);
  if (!hit) {
    hit = new Promise((resolve) => {
      try {
        const v = document.createElement('video');
        v.muted = true; v.preload = 'auto'; v.crossOrigin = 'anonymous'; v.playsInline = true;
        const t = window.setTimeout(() => resolve(null), 10000);
        v.onloadeddata = () => { window.clearTimeout(t); resolve(v); };
        v.onerror = () => { window.clearTimeout(t); resolve(null); };
        v.src = url;
      } catch { resolve(null); }
    });
    videoEls.set(url, hit);
  }
  return hit;
}

function seek(v: HTMLVideoElement, t: number): Promise<boolean> {
  return new Promise((resolve) => {
    const done = (ok: boolean) => { v.removeEventListener('seeked', onSeeked); window.clearTimeout(timer); resolve(ok); };
    const onSeeked = () => done(true);
    const timer = window.setTimeout(() => done(false), 4000);
    v.addEventListener('seeked', onSeeked);
    v.currentTime = t;
  });
}

/** Worst-case band scores over ~5 frames of a video window (null when the video can't be read). */
export function videoScoresFor({ url, from, to }: VideoWindow): Promise<RegionScores | null> {
  const key = `${url}|${from}|${to}`;
  let hit = videoCache.get(key);
  if (!hit) {
    const run = async (): Promise<RegionScores | null> => {
      const v = await videoElement(url);
      if (!v) return null;
      const end = Math.min(to, (Number.isFinite(v.duration) ? v.duration : to) - 0.05);
      const span = Math.max(0.1, end - from);
      const frames: RegionScores[] = [];
      for (let i = 0; i < 5; i++) {
        if (!(await seek(v, Math.max(0, from + (span * i) / 4)))) continue;
        const s = scoreSource(v);
        if (s) frames.push(s);
      }
      return frames.length ? combineScores(frames) : null;
    };
    const prev = videoQueue.get(url) ?? Promise.resolve();
    hit = prev.then(run, run);
    videoQueue.set(url, hit);
    videoCache.set(key, hit);
  }
  return hit;
}

/** Start analysing pictures early (a story's later pages) so each page's plate is placed the moment it shows. */
export function warmCaptionPlacement(urls: (string | undefined)[], video?: VideoWindow[]) {
  for (const u of urls) if (u) void scoresFor(u);
  for (const w of video ?? []) void videoScoresFor(w);
}

async function placementScores(url: string | undefined, video?: VideoWindow): Promise<RegionScores | null> {
  const still = url ? await scoresFor(url) : null;
  const frames = video ? await videoScoresFor(video) : null;
  if (still && frames) return combineScores([still, frames]);
  return frames ?? still;
}

/** Hook: the page's pinned side, else the calmest side of the picture (and, for video, of its frames).
 *  `ready` is false only while measuring (max ~2.5 s), so the plate can wait instead of jumping. */
export function useCaptionPlacement(url: string | undefined, pinned?: CaptionPos, avoid?: CaptionPos[], video?: VideoWindow): { pos: CaptionPos; ready: boolean } {
  const key = `${url ?? ''}|${video ? `${video.url}|${video.from}|${video.to}` : ''}`;
  const [state, setState] = useState<{ key?: string; pos: CaptionPos; ready: boolean }>({ pos: 'bottom', ready: false });
  useEffect(() => {
    if (pinned || (!url && !video)) return;
    let live = true;
    setState((s) => (s.key === key ? s : { key, pos: s.pos, ready: false }));
    const sides = typeof window === 'undefined' || window.innerWidth >= 640;
    const timer = window.setTimeout(() => { if (live) setState((s) => ({ ...s, key, ready: true })); }, video ? 2500 : 1500);
    void placementScores(url, video).then((sc) => { if (live) setState({ key, pos: sc ? pickCaptionPos(sc, { sides, avoid }) : 'bottom', ready: true }); });
    return () => { live = false; window.clearTimeout(timer); };
  }, [key, pinned, avoid?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  if (pinned || (!url && !video)) return { pos: pinned ?? 'bottom', ready: true };
  return { pos: state.pos, ready: state.ready && state.key === key };
}

/** Hook: just the side (see useCaptionPlacement). */
export function useCaptionPos(url: string | undefined, pinned?: CaptionPos, avoid?: CaptionPos[]): CaptionPos {
  return useCaptionPlacement(url, pinned, avoid).pos;
}
