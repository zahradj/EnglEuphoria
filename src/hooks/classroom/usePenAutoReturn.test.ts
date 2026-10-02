import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePenAutoReturn } from './usePenAutoReturn';

afterEach(() => vi.useRealTimers());

describe('pen hands itself back to the pointer', () => {
  it('returns after the idle time when the pen is on', () => {
    vi.useFakeTimers();
    const back = vi.fn();
    renderHook(() => usePenAutoReturn(true, 0, back, 8000));
    vi.advanceTimersByTime(7999);
    expect(back).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('a new stroke restarts the wait', () => {
    vi.useFakeTimers();
    const back = vi.fn();
    const { rerender } = renderHook(({ k }) => usePenAutoReturn(true, k, back, 8000), { initialProps: { k: 0 } });
    vi.advanceTimersByTime(6000);
    rerender({ k: 1 }); // student drew something
    vi.advanceTimersByTime(6000);
    expect(back).not.toHaveBeenCalled(); // 12s in total, but only 6s since the last stroke
    vi.advanceTimersByTime(2500);
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('does nothing while the pointer is selected', () => {
    vi.useFakeTimers();
    const back = vi.fn();
    renderHook(() => usePenAutoReturn(false, 0, back, 8000));
    vi.advanceTimersByTime(60000);
    expect(back).not.toHaveBeenCalled();
  });

  it('stops waiting when the pen is put down early', () => {
    vi.useFakeTimers();
    const back = vi.fn();
    const { rerender } = renderHook(({ a }) => usePenAutoReturn(a, 0, back, 8000), { initialProps: { a: true } });
    vi.advanceTimersByTime(3000);
    rerender({ a: false });
    vi.advanceTimersByTime(20000);
    expect(back).not.toHaveBeenCalled();
  });
});
