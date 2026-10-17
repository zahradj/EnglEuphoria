// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { comicScene, type ComicScene } from '../scenes/comic/Comic';

vi.mock('../services/voice', () => ({ sayLine: vi.fn(async () => false), stopVoice: vi.fn() }));
afterEach(cleanup);

const scene: ComicScene = {
  id: 'c', part: 2, kind: 'comic', title: 'The bus',
  beats: [
    { plate: 'p1', caption: 'Morning.', spots: { Vee: { x: 3, y: 10, w: 40 }, Theo: { x: 55, y: 10, w: 40 } }, lines: [{ who: 'Vee', text: 'Hello.' }, { who: 'Theo', text: 'Hi!', sfx: 'Wow' }] },
    { plate: 'p2', lines: [{ who: 'Vee', text: 'Go.' }] },
    { plate: 'p3', lines: [{ who: 'Theo', text: 'Done.' }] },
  ],
};
const View = comicScene.view;
const props = { scene, script: {} as never, artBase: '/a', calm: true, seed: 1 };

describe('comic scene', () => {
  it('shows the first line, steps on tap, keeps the previous speaker dimmed, and reports done at the last line', () => {
    const onDone = vi.fn();
    render(<View {...props} onDone={onDone} />);
    expect(screen.getByRole('status').textContent).toContain('Hello.');
    fireEvent.click(screen.getByText(/Next line/));
    expect(screen.getByLabelText('Theo: Hi!')).toBeTruthy();
    expect(document.querySelector('[data-old="true"]')?.textContent).toContain('Hello.');
    expect(document.querySelector('.av-comic-sfx')?.textContent).toBe('Wow');
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText(/Next line/));
    fireEvent.click(screen.getByText(/Next line/));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
  it('validates 3-5 plates and spots on the picture', () => {
    expect(comicScene.validate(scene)).toEqual([]);
    expect(comicScene.validate({ ...scene, beats: scene.beats.slice(0, 1) }).join()).toMatch(/3-5 plates/);
    expect(comicScene.validate({ ...scene, beats: [{ ...scene.beats[0], spots: { Vee: { x: 70, y: 1, w: 40 } } }, ...scene.beats.slice(1)] }).join()).toMatch(/off the picture/);
  });
});
