import { afterEach, describe, expect, it, vi } from 'vitest';
import { CHUNK_RELOAD_WINDOW_MS, isChunkLoadError, reloadOnceForChunkError } from '../chunkLoadRecovery';

// A teacher keeps one tab open across classes. An earlier stale-chunk reload must not use up
// the recovery for the rest of the day (live class 2026-10-07: End Class crashed instead).
describe('chunk-load recovery', () => {
  afterEach(() => { sessionStorage.clear(); vi.restoreAllMocks(); });

  it('recognises stale-chunk errors', () => {
    expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module: https://x/assets/PostLessonSummary-C4wwL9jO.js'))).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  it('reloads again after the window, but not twice in a row (no reload loop)', () => {
    const reload = vi.fn();
    Object.defineProperty(window, 'location', { value: { ...window.location, reload }, writable: true });
    const t0 = 1_791_000_000_000;
    expect(reloadOnceForChunkError(t0)).toBe(true);
    expect(reloadOnceForChunkError(t0 + 5_000)).toBe(false);
    expect(reloadOnceForChunkError(t0 + CHUNK_RELOAD_WINDOW_MS + 1)).toBe(true);
  });

  it('treats the old "1" flag from earlier builds as long ago', () => {
    sessionStorage.setItem('chunk_reload_attempted', '1');
    expect(reloadOnceForChunkError(1_791_000_000_000)).toBe(true);
  });
});
