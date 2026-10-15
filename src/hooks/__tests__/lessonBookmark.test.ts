import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const maybeSingle = vi.fn();
const upsert = vi.fn(async () => ({ error: null }));
const eq2 = { maybeSingle: (...a: unknown[]) => maybeSingle(...a) };
const eq1 = { eq: () => eq2 };
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => eq1 }), upsert: (...a: unknown[]) => upsert(...(a as [])) }) },
}));

import { readServerBookmark, useLessonAutoSave } from '../useLessonAutoSave';

const LESSON = '11111111-2222-3333-4444-555555555555';
const USER = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

describe('readServerBookmark (continue on another device)', () => {
  beforeEach(() => maybeSingle.mockReset());

  it('returns the saved slide for an unfinished lesson', async () => {
    maybeSingle.mockResolvedValue({ data: { slide_index: 7, stars_remaining: 2, completed: false }, error: null });
    expect(await readServerBookmark(USER, LESSON)).toEqual({ slide_index: 7, stars_remaining: 2 });
  });
  it('returns nothing once the lesson is completed', async () => {
    maybeSingle.mockResolvedValue({ data: { slide_index: 30, stars_remaining: 3, completed: true }, error: null });
    expect(await readServerBookmark(USER, LESSON)).toBeNull();
  });
  it('fails soft on errors, missing rows, non-uuid lessons and missing user', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    expect(await readServerBookmark(USER, LESSON)).toBeNull();
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    expect(await readServerBookmark(USER, LESSON)).toBeNull();
    maybeSingle.mockRejectedValueOnce(new Error('network'));
    expect(await readServerBookmark(USER, LESSON)).toBeNull();
    expect(await readServerBookmark(USER, 'not-a-uuid')).toBeNull();
    expect(await readServerBookmark(undefined, LESSON)).toBeNull();
  });
});

describe('useLessonAutoSave waits for the resume decision', () => {
  beforeEach(() => { vi.useFakeTimers(); upsert.mockClear(); });
  afterEach(() => vi.useRealTimers());

  it('does not overwrite the server position while paused, then saves once released', async () => {
    const { rerender } = renderHook((p: { paused: boolean; idx: number }) =>
      useLessonAutoSave({ lessonId: LESSON, studentId: USER, slideIndex: p.idx, starsRemaining: 3, totalSlides: 30, completed: false, serverPaused: p.paused }),
      { initialProps: { paused: true, idx: 0 } });
    await vi.advanceTimersByTimeAsync(3000);
    expect(upsert).not.toHaveBeenCalled();
    rerender({ paused: false, idx: 7 });
    await vi.advanceTimersByTimeAsync(1500);
    expect(upsert).toHaveBeenCalledTimes(1);
    expect((upsert.mock.calls[0] as unknown as [{ slide_index: number }])[0].slide_index).toBe(7);
  });
});
