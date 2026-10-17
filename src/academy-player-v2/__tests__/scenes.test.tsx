// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ruleScene, type RuleScene } from '../scenes/rule/Rule';
import { modelScene, type ModelScene } from '../scenes/model/Model';
import { sortScene, type SortScene } from '../scenes/sort/Sort';
import { choiceScene, type ChoiceScene } from '../scenes/choice/Choice';
import { wrapScene, type WrapScene } from '../scenes/wrap/Wrap';

vi.mock('../services/voice', () => ({ sayLine: vi.fn(async () => false), stopVoice: vi.fn() }));
afterEach(cleanup);
const base = { script: { criteria: ['I can'] } as never, artBase: '/a', calm: true, seed: 3, summary: { xp: 50, gems: 2, mistakes: ['I have went'] } };

describe('rule', () => {
  const scene: RuleScene = { id: 'r', part: 3, kind: 'rule', title: 'Been or gone', who: 'Vee', lines: [{ rule: 'been = came back', example: 'I have been to Rome.' }, { rule: 'gone = still away', example: 'He has gone to Rome.' }] };
  it('needs every line said before it is done; validates ≤ 3 lines and examples', () => {
    const onDone = vi.fn();
    render(<ruleScene.view {...base} scene={scene} onDone={onDone} />);
    fireEvent.click(screen.getByText(/Say it out loud/));
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText(/Say it out loud/));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(ruleScene.validate(scene)).toEqual([]);
    expect(ruleScene.validate({ ...scene, lines: [...scene.lines, ...scene.lines] }).join()).toMatch(/at most 3/);
    expect(ruleScene.validate({ ...scene, lines: [{ rule: 'x', example: '' }] }).join()).toMatch(/needs an example/);
  });
});

describe('model', () => {
  const scene: ModelScene = { id: 'm', part: 3, kind: 'model', title: 'Ever', who: 'Theo', steps: [{ phase: 'iDo', text: 'Have you ever been to Rome?' }, { phase: 'weDo', text: 'Say it with me.' }, { phase: 'youDo', text: 'Ask me.' }] };
  it('goes I do, we do, you do and finishes after you do', () => {
    const onDone = vi.fn();
    render(<modelScene.view {...base} scene={scene} onDone={onDone} />);
    fireEvent.click(screen.getByText(/Next/)); fireEvent.click(screen.getByText(/Next/));
    fireEvent.click(screen.getByText(/Say it out loud/));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(modelScene.validate(scene)).toEqual([]);
    expect(modelScene.validate({ ...scene, steps: [scene.steps[2], scene.steps[0]] }).join()).toMatch(/I do/);
  });
});

describe('sort game', () => {
  const scene: SortScene = { id: 's', part: 4, kind: 'sort', title: 'Been or gone', prompt: 'Sort them.', tries: 2, bins: [{ id: 'a', label: 'BEEN' }, { id: 'b', label: 'GONE' }], items: [{ id: '1', text: 'one', bin: 'a' }, { id: '2', text: 'two', bin: 'b' }, { id: '3', text: 'three', bin: 'a' }, { id: '4', text: 'four', bin: 'b' }] };
  const binOf = (txt: string) => { const it = scene.items.find((i) => i.text === txt)!; return screen.getByText(it.bin === 'a' ? 'BEEN' : 'GONE').closest('button') as HTMLElement; };
  const wrongOf = (txt: string) => { const it = scene.items.find((i) => i.text === txt)!; return screen.getByText(it.bin === 'a' ? 'GONE' : 'BEEN').closest('button') as HTMLElement; };
  const current = () => document.querySelector('.av-card-now p')!.textContent!;
  it('plays to a win, reporting score and the mistake', () => {
    const onDone = vi.fn();
    render(<sortScene.view {...base} scene={scene} onDone={onDone} />);
    fireEvent.click(screen.getByText(/Start the mission/));
    fireEvent.click(wrongOf(current()));
    const missed = current();
    for (let k = 0; k < 4; k++) fireEvent.click(binOf(current()));
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.mistakes).toEqual([missed]);
    expect(r.score).toBeGreaterThan(0);
  });
  it('out of tries shows retry; validate catches a card with no box', () => {
    render(<sortScene.view {...base} scene={scene} onDone={vi.fn()} />);
    fireEvent.click(screen.getByText(/Start the mission/));
    fireEvent.click(wrongOf(current())); fireEvent.click(wrongOf(current()));
    expect(screen.getByText('Start again')).toBeTruthy();
    expect(sortScene.validate({ ...scene, items: scene.items.map((i) => ({ ...i, bin: 'z' })) }).join()).toMatch(/does not exist/);
  });
});

describe('choice and wrap', () => {
  const q: ChoiceScene = { id: 'c', part: 5, kind: 'choice', title: 'Check', questions: [{ q: 'Pick', options: ['x', 'y'], answer: 1 }] };
  it('a wrong tap is logged, a right one finishes with the mistake', () => {
    const onDone = vi.fn();
    render(<choiceScene.view {...base} scene={q} onDone={onDone} />);
    fireEvent.click(screen.getByText('x'));
    fireEvent.click(screen.getByText('y'));
    fireEvent.click(screen.getByText(/Finish the lesson/));
    expect(onDone).toHaveBeenCalledWith({ won: true, score: 0, mistakes: ['Pick'] });
    expect(choiceScene.validate({ ...q, questions: [{ q: 'a', options: ['x', 'y'], answer: 5 }] }).join()).toMatch(/not an option/);
  });
  it('the wrap shows XP, gems and what to practise, and needs the teach-back', () => {
    const w: WrapScene = { id: 'w', part: 7, kind: 'wrap', heading: 'Nice work', teachBack: 'Been or gone?' };
    const onDone = vi.fn();
    render(<wrapScene.view {...base} scene={w} onDone={onDone} />);
    expect(screen.getByText('I have went')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
    fireEvent.click(screen.getByText(/Say it out loud/));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(wrapScene.validate({ ...w, teachBack: '' }).join()).toMatch(/teach-back/);
  });
});
