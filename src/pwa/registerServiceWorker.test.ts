import { describe, expect, it } from 'vitest';
import { LIVE_PAGE } from './registerServiceWorker';

describe('service worker: never reload in the middle of a lesson', () => {
  it('waits on lesson, class and game pages', () => {
    for (const p of ['/classroom/abc', '/student-classroom', '/playground-scene/welcome-town-lesson-2', '/playground/1/2', '/academy-lesson/x', '/homework-quest/q', '/homework/a', '/play/l1', '/dashboard/games/x', '/arcade', '/ai-placement-test']) {
      expect(LIVE_PAGE.test(p), p).toBe(true);
    }
  });
  it('reloads at once elsewhere', () => {
    for (const p of ['/', '/dashboard', '/playground-library', '/library', '/pricing', '/teacher']) {
      expect(LIVE_PAGE.test(p), p).toBe(false);
    }
  });
});
