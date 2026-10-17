// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useFx } from '../fx/useFx';
import { LessonPlayer } from '../LessonPlayer';
import { SCENES } from '../scenes/registry';
import { sortScene, type SortScene } from '../scenes/sort/Sort';
import { memoryScene, type MemoryScene } from '../scenes/memory/Memory';
import { Reward } from '../scenes/kit';
import type { LessonScript, SceneBase, SceneFx, SceneProps } from '../types';

vi.mock('../services/voice', () => ({ saySequence: vi.fn(async () => undefined), setMuted: vi.fn(), stopVoice: vi.fn(), sayLine: vi.fn(async () => false) }));
beforeEach(() => { vi.useFakeTimers(); window.localStorage.clear(); });
afterEach(() => { cleanup(); vi.useRealTimers(); delete SCENES.fxtest; });

const fakeFx = (): SceneFx => ({ calm: false, burst: vi.fn(), float: vi.fn(), shake: vi.fn(), confetti: vi.fn(), at: () => ({ x: 50, y: 50 }), burstAt: vi.fn(), floatAt: vi.fn() });

describe('useFx (game feel at the source)', () => {
  it('normal mode: burst, float, shake and confetti all produce effects, then clear themselves', () => {
    const { result } = renderHook(() => useFx(false));
    act(() => { result.current.api.burst(10, 20, 'teal'); result.current.api.float(10, 20, '+10'); result.current.api.shake('hard'); result.current.api.confetti(); });
    expect(result.current.bursts).toHaveLength(1); expect(result.current.floaters).toHaveLength(1);
    expect(result.current.shaking).toBe('hard'); expect(result.current.confettis).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.bursts).toHaveLength(0); expect(result.current.floaters).toHaveLength(0); expect(result.current.shaking).toBe(false); expect(result.current.confettis).toHaveLength(0);
  });
  it('calm mode: no burst, shake or confetti, but the floating text still shows (it only fades) so feedback is visible', () => {
    const { result } = renderHook(() => useFx(true));
    act(() => { result.current.api.burst(1, 1); result.current.api.shake(); result.current.api.confetti(); result.current.api.float(1, 1, '+10'); });
    expect(result.current.bursts).toHaveLength(0); expect(result.current.shaking).toBe(false); expect(result.current.confettis).toHaveLength(0);
    expect(result.current.floaters).toHaveLength(1); expect(result.current.api.calm).toBe(true);
  });
});

describe('scenes reach the effects through the player', () => {
  interface T extends SceneBase { kind: 'fxtest' }
  function View({ fx }: SceneProps<T>) { return <button type="button" onClick={() => { fx?.shake(); fx?.float(40, 40, '+10'); }}>poke</button>; }
  const script: LessonScript = { blueprintId: 'B1-S01-E1', title: 't', criteria: ['c'], cast: ['Vee'], partMinutes: [5, 8, 8, 8, 8, 8, 8, 7], scenes: [{ id: 'a', part: 1, kind: 'fxtest' }] };
  it('a scene can shake the stage and float text; the shell shows the shake; Calm mode removes the shake only', () => {
    SCENES.fxtest = { view: View, spoken: () => [], validate: () => [] };
    render(<LessonPlayer script={script} ephemeral />);
    fireEvent.click(screen.getByText('poke'));
    expect(document.querySelector('.av-root')?.getAttribute('data-shaking')).toBe('soft');
    expect(document.querySelector('.av-float')?.textContent).toBe('+10');
    act(() => { vi.advanceTimersByTime(600); });
    expect(document.querySelector('.av-root')?.getAttribute('data-shaking')).toBeNull();
    cleanup();
    window.localStorage.setItem('academy-player-prefs-v2', JSON.stringify({ calm: true, sound: false }));
    render(<LessonPlayer script={script} ephemeral />);
    fireEvent.click(screen.getByText('poke'));
    expect(document.querySelector('.av-root')?.getAttribute('data-shaking')).toBeNull();
    expect(document.querySelector('.av-float')?.textContent).toBe('+10');
  });
});

describe('games use the effects', () => {
  const base = { script: { criteria: ['I can'] } as never, artBase: '/a', calm: false, seed: 3, summary: { xp: 0, gems: 0, mistakes: [] } };
  it('sort: a right drop bursts and floats the points at the box; a miss does not burst; the cast reacts', () => {
    const fx = fakeFx();
    const scene: SortScene = { id: 's', part: 4, kind: 'sort', title: 'Sort', prompt: 'Go', tries: 3, bins: [{ id: 'a', label: 'AAA' }, { id: 'b', label: 'BBB' }], items: [{ id: '1', text: 'one', bin: 'a' }, { id: '2', text: 'two', bin: 'b' }, { id: '3', text: 'three', bin: 'a' }, { id: '4', text: 'four', bin: 'b' }] };
    render(<sortScene.view {...base} scene={scene} fx={fx} onDone={vi.fn()} />);
    fireEvent.click(screen.getByText(/Start the mission/));
    const cur = () => scene.items.find((i) => i.text === document.querySelector('.av-card-now p')!.textContent)!;
    const wrongBin = screen.getByText(cur().bin === 'a' ? 'BBB' : 'AAA').closest('button')!;
    fireEvent.click(wrongBin);
    expect(fx.burstAt).not.toHaveBeenCalled();
    const rightBin = screen.getByText(cur().bin === 'a' ? 'AAA' : 'BBB').closest('button')!;
    fireEvent.click(rightBin);
    expect(fx.burstAt).toHaveBeenCalledTimes(1);
    expect(fx.floatAt).toHaveBeenCalledWith(rightBin, '+10', 'gold');
    expect(document.querySelector('.av-cast[data-mood="happy"]')).toBeTruthy();
  });
  it('memory: cards are 3D (back and front faces); a match bursts after the flip', () => {
    const fx = fakeFx();
    const scene: MemoryScene = { id: 'm', part: 2, kind: 'memory', title: 'Memory', pairs: [{ art: 'a1', text: 'one' }, { art: 'a2', text: 'two' }, { art: 'a3', text: 'three' }] };
    render(<memoryScene.view {...base} scene={scene} fx={fx} onDone={vi.fn()} />);
    expect(document.querySelectorAll('.av-mem .av-mem-back')).toHaveLength(6);
    expect(document.querySelectorAll('.av-mem .av-mem-front')).toHaveLength(6);
    const cards = [...document.querySelectorAll<HTMLButtonElement>('.av-mem')];
    const byPair = (k: number) => cards.filter((_, n) => n >= 0).filter((c) => (c.querySelector('b')?.textContent ?? '') === ['one', 'two', 'three'][k] || (c.querySelector('img')?.getAttribute('src') ?? '').endsWith(`a${k + 1}.webp`));
    const [x, y] = byPair(0);
    fireEvent.click(x); fireEvent.click(y);
    act(() => { vi.advanceTimersByTime(600); });
    expect(fx.burstAt).toHaveBeenCalled();
  });
});

describe('reward moment', () => {
  it('shows stars and the count-up number at once in calm mode', () => {
    render(<Reward score={40} stars={2} gem calm />);
    expect(screen.getByTestId('av-reward').textContent).toContain('40');
    expect(document.querySelectorAll('.av-reward-stars i[data-on]')).toHaveLength(2);
  });
});
