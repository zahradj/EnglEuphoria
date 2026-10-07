/**
 * A React.lazy()/dynamic import() can fail after a new deploy replaces the
 * hashed JS chunk files a still-open page references — "Failed to fetch
 * dynamically imported module: .../Section-<oldhash>.js". This isn't a
 * real bug in the code that ran; the browser just needs the current
 * index.html and its current chunk manifest. A single reload almost
 * always resolves it, so treating it as a hard crash (full error boundary,
 * a filed incident) is both scary for the user and noisy for whoever
 * reviews incidents. Confirmed as the actual cause of a batch of
 * `sentinel_incidents` rows on `/` (the homepage — including at least one
 * hit by Googlebot, which is what put a crashed "Something went
 * off-script" page into Google's search results) and one live classroom
 * crash.
 *
 * Guarded to at most one reload per minute (sessionStorage timestamp) so a
 * genuinely broken deployment — where the reload doesn't fix it — falls
 * through to the real error boundary instead of reloading forever.
 *
 * It used to be "once per tab, ever" (a flag that was never cleared): a
 * teacher who kept the same tab open across classes, with an earlier deploy
 * having already used up that one reload, got the crash card instead — the
 * live-class report of 2026-10-07 ("End Class didn't work, I had to
 * refresh": PostLessonSummary-<oldhash>.js after a deploy at 09:30 UTC).
 */
const RELOAD_FLAG = 'chunk_reload_attempted';
/** A second chunk failure within this window means the reload did not help — show the real error. */
export const CHUNK_RELOAD_WINDOW_MS = 60_000;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i.test(
    message,
  );
}

/**
 * A plain `window.location.reload()` is not guaranteed to fix a stale-chunk
 * crash: the app's service worker (see vite.config.ts's `workbox.runtimeCaching`)
 * serves navigations `NetworkFirst` with only a 3s timeout, and JS/CSS
 * `StaleWhileRevalidate` — so a slow or flaky network on that one reload can
 * still hand back the exact same stale `index.html`/chunk that just failed,
 * and the user watching the "Reload" button appears to do nothing at all.
 * This unregisters the service worker and clears its caches first, so the
 * reload that follows is forced to hit the network for fresh content —
 * confirmed as the fix for a live report of "the reload button isn't
 * reloading" on the Sentinel/GlobalErrorBoundary crash card.
 */
export async function hardReload(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // Best effort — reload below regardless, a plain reload is still better than nothing.
  } finally {
    window.location.reload();
  }
}

/** Reloads the page on a chunk-load failure, at most once per minute. Returns true if it triggered a reload (caller should not also render/log a crash). */
export function reloadOnceForChunkError(now: number = Date.now()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG));
    // Old builds stored '1' here; treat any non-timestamp as long ago.
    if (Number.isFinite(last) && last > 1_000_000_000_000 && now - last < CHUNK_RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(RELOAD_FLAG, String(now));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — still attempt the one reload below.
  }
  void hardReload();
  return true;
}
