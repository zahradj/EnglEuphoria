// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LessonPlayer } from '../LessonPlayer';
import { SCENES } from '../scenes/registry';
import { validateScript } from '../engine/validateScript';
import { loadPrefs } from '../services/prefs';
import { loadProgress } from '../services/progress';
import type { LessonScript, SceneBase, SceneProps } from '../types';

vi.mock('../services/voice', () => ({ saySequence: vi.fn(async () => undefined), setMuted: vi.fn(), stopVoice: vi.fn() }));

interface TestScene extends SceneBase { kind: 'test' }
function TestView({ onDone, scene }: SceneProps<TestScene>) {
  return <button type="button" onClick={() => onDone({ won: true, score: 10 })}>win {scene.id}</button>;
}
const script: LessonScript = {
  blueprintId: 'B1-S01-E1',
  title: 'Test lesson',
  criteria: ['I can test'],
  cast: ['Vee'],
  partMinutes: [5, 8, 8, 8, 8, 8, 8, 7],
  scenes: [
    { id: 'l', part: 0, kind: 'lobby', heading: 'Hello' } as SceneBase,
    { id: 't1', part: 1, kind: 'test' },
    { id: 't2', part: 2, kind: 'test' },
  ],
};

beforeEach(() => {
  window.localStorage.clear();
  SCENES.test = { view: TestView, spoken: () => [], validate: () => [] };
});
afterEach(() => { cleanup(); delete SCENES.test; });

describe('LessonPlayer', () => {
  it('shows the chapter pill and the 8-part strip; the lobby starts the lesson', () => {
    render(<LessonPlayer script={script} />);
    expect(screen.getByTestId('av-chapter').textContent).toMatch(/Chapter .* of 8 · The dare/);
    expect(document.querySelectorAll('.av-strip li')).toHaveLength(8);
    fireEvent.click(screen.getByText(/Start the mission/));
    expect(screen.getByText('win t1')).toBeTruthy();
  });
  it('Next is locked until the scene is done (student), then opens', () => {
    render(<LessonPlayer script={script} />);
    fireEvent.click(screen.getByText(/Start the mission/));
    const next = screen.getByText(/Next/).closest('button') as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.click(screen.getByText('win t1'));
    expect(next.disabled).toBe(false);
    fireEvent.click(next);
    expect(screen.getByText('win t2')).toBeTruthy();
  });
  it('the teacher can always move on', () => {
    render(<LessonPlayer script={script} role="teacher" index={1} onIndex={() => undefined} ephemeral />);
    expect((screen.getByText(/Next/).closest('button') as HTMLButtonElement).disabled).toBe(false);
  });
  it('a student in a live class has no Back/Next of their own', () => {
    render(<LessonPlayer script={script} role="student" index={1} ephemeral />);
    expect(screen.queryByText(/Next/)).toBeNull();
    expect(screen.queryByText(/Back/)).toBeNull();
  });
  it('Calm mode is saved and switches the shell', () => {
    render(<LessonPlayer script={script} />);
    fireEvent.click(screen.getByLabelText('More'));
    fireEvent.click(screen.getByLabelText('Calm mode'));
    expect(document.querySelector('.av-root')?.getAttribute('data-calm')).toBe('true');
    expect(loadPrefs().calm).toBe(true);
  });
  it('saves progress after the first page and offers to resume', () => {
    const first = render(<LessonPlayer script={script} />);
    fireEvent.click(screen.getByText(/Start the mission/));
    expect(loadProgress('B1-S01-E1', script.scenes.map((s) => s.id))?.index).toBe(1);
    first.unmount();
    render(<LessonPlayer script={script} />);
    expect(screen.getByText('Continue where you stopped?')).toBeTruthy();
  });
  it('a scene that throws shows a calm card, not a blank page', () => {
    SCENES.test = { view: () => { throw new Error('boom'); }, spoken: () => [], validate: () => [] };
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<LessonPlayer script={script} role="teacher" index={1} onIndex={() => undefined} ephemeral />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe('validateScript', () => {
  it('accepts a good script and names the problems of a bad one', () => {
    expect(validateScript(script)).toEqual([]);
    const bad = { ...script, blueprintId: 'X', partMinutes: [10], scenes: [{ id: 'a', part: 9, kind: 'nope' }, { id: 'a', part: 0, kind: 'nope' }] } as LessonScript;
    const p = validateScript(bad).join('\n');
    expect(p).toMatch(/blueprint X does not exist/);
    expect(p).toMatch(/partMinutes must sum to 60/);
    expect(p).toMatch(/duplicate scene id a/);
    expect(p).toMatch(/unknown scene kind "nope"/);
  });
});
