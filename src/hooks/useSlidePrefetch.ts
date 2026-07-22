import { useEffect } from 'react';

/**
 * Silently preloads images and audio for upcoming slides so they appear
 * instantly during a live class. Safe to call on every render — the browser
 * de-duplicates fetches by URL.
 *
 * Pass an array of "asset bundles" — one bundle per slide (in deck order).
 * The hook prefetches the next N slides starting after `activeIndex`.
 */
export interface SlideAssets {
  imageUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
}

export function useSlidePrefetch(
  assets: SlideAssets[],
  activeIndex: number,
  lookahead = 2,
) {
  useEffect(() => {
    if (!Array.isArray(assets) || assets.length === 0) return;

    const start = Math.max(0, activeIndex + 1);
    const end = Math.min(assets.length, start + lookahead);

    for (let i = start; i < end; i++) {
      const a = assets[i];
      if (!a) continue;

      if (a.imageUrl) {
        try {
          const img = new Image();
          img.decoding = 'async';
          img.loading = 'eager';
          img.src = a.imageUrl;
        } catch {
          /* prefetch is best-effort */
        }
      }

      if (a.audioUrl) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = a.audioUrl;
          // Trigger the actual fetch in browsers that respect preload
          audio.load();
        } catch {
          /* best-effort */
        }
      }

      if (a.videoUrl) {
        try {
          // <link rel="prefetch"> is the cleanest way to warm video caches
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'video';
          link.href = a.videoUrl;
          document.head.appendChild(link);
          // Auto-cleanup after 30s so head doesn't bloat
          setTimeout(() => link.remove(), 30_000);
        } catch {
          /* best-effort */
        }
      }
    }
  }, [assets, activeIndex, lookahead]);
}
