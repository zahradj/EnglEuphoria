import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn() } }));

import { createResumeSaver, hasSomethingToResume, resolveResumeIndex, resumePercent } from './lessonResumeService';

const scenes = Array.from({ length: 10 }, (_, i) => ({ id: `s${i}` }));

describe('where a student continues', () => {
  it('uses the saved scene id (survives edits to the lesson), else the saved index', () => {
    expect(resolveResumeIndex({ sceneId: 's4', sceneIndex: 99 }, scenes)).toBe(4);
    expect(resolveResumeIndex({ sceneId: 'gone', sceneIndex: 6 }, scenes)).toBe(6);
    expect(resolveResumeIndex({ sceneId: null, sceneIndex: 3 }, scenes)).toBe(3);
  });
  it('never lands on the finale (that completes the lesson): steps back one scene', () => {
    expect(resolveResumeIndex({ sceneId: 's9', sceneIndex: 9 }, scenes)).toBe(8);
    expect(resolveResumeIndex({ sceneId: null, sceneIndex: 50 }, scenes)).toBe(8);
  });
  it('nothing saved, or a one-scene lesson: start at the beginning', () => {
    expect(resolveResumeIndex(null, scenes)).toBe(0);
    expect(resolveResumeIndex({ sceneId: 's0', sceneIndex: 0 }, [{ id: 'only' }])).toBe(0);
  });
  it('offers Continue only past the first scene; percent runs 0–100', () => {
    expect(hasSomethingToResume(0)).toBe(false);
    expect(hasSomethingToResume(1)).toBe(true);
    expect(resumePercent(0, 10)).toBe(0);
    expect(resumePercent(9, 10)).toBe(100);
    expect(resumePercent(3, 10)).toBe(33);
  });
});

describe('automatic saving while the student plays', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const make = () => {
    const write = vi.fn().mockResolvedValue(true);
    const markStarted = vi.fn().mockResolvedValue(undefined);
    const saver = createResumeSaver({ userId: 'U', lessonId: 'L', scenes, delayMs: 700, write, markStarted });
    return { saver, write, markStarted };
  };

  it('a burst of quick moves is ONE write of the last scene, and marks the lesson in progress once', async () => {
    const { saver, write, markStarted } = make();
    saver.note(1); saver.note(2); saver.note(3);
    expect(write).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(800);
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith({ userId: 'U', lessonId: 'L', sceneId: 's3', sceneIndex: 3, totalScenes: 10 });
    saver.note(4);
    await vi.advanceTimersByTimeAsync(800);
    expect(write).toHaveBeenCalledTimes(2);
    expect(markStarted).toHaveBeenCalledTimes(1);
  });

  it('scene 0 (the lesson has not really started) is never saved', async () => {
    const { saver, write, markStarted } = make();
    saver.note(0);
    await vi.advanceTimersByTimeAsync(2000);
    expect(write).not.toHaveBeenCalled();
    expect(markStarted).not.toHaveBeenCalled();
  });

  it('flush writes at once (lesson closed / tab hidden), and nothing is written twice', async () => {
    const { saver, write } = make();
    saver.note(5);
    await saver.flush();
    expect(write).toHaveBeenCalledWith(expect.objectContaining({ sceneIndex: 5 }));
    await vi.advanceTimersByTimeAsync(2000);
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('cancel (the lesson was completed) drops a pending write so a finished lesson never comes back as "in progress"', async () => {
    const { saver, write } = make();
    saver.note(8);
    saver.cancel();
    await vi.advanceTimersByTimeAsync(2000);
    await saver.flush();
    expect(write).not.toHaveBeenCalled();
  });
});
