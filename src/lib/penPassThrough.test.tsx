import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { isActivityTarget } from './penPassThrough';

afterEach(cleanup);

// A "stage" of 1000x1000 so the backdrop rule (>= 60% of the stage) is easy to trigger.
const stub = (el: Element, w: number, h: number) => {
  (el as HTMLElement).getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: w, bottom: h, width: w, height: h, x: 0, y: 0, toJSON() {} }) as DOMRect;
};

function mount(ui: React.ReactElement) {
  const { container } = render(<div data-testid="frame">{ui}</div>);
  const frame = container.querySelector('[data-testid="frame"]') as HTMLElement;
  stub(frame, 1000, 1000);
  frame.querySelectorAll('*').forEach((el) => stub(el, 100, 100)); // small pieces by default
  return { frame, q: (id: string) => frame.querySelector(`[data-testid="${id}"]`) as HTMLElement };
}

describe('smart pen: is the touch on a game piece, or on empty space?', () => {
  it('empty space draws', () => {
    const { frame, q } = mount(<div><div data-testid="empty" /></div>);
    expect(isActivityTarget(q('empty'), frame)).toBe(false);
  });

  it('buttons, inputs and links are game pieces', () => {
    const { frame, q } = mount(
      <div>
        <button data-testid="b">A</button>
        <input data-testid="i" />
        <a href="/x" data-testid="a">link</a>
      </div>,
    );
    expect(isActivityTarget(q('b'), frame)).toBe(true);
    expect(isActivityTarget(q('i'), frame)).toBe(true);
    expect(isActivityTarget(q('a'), frame)).toBe(true);
  });

  it('a plain <div onClick> tile is a game piece (no markup needed)', () => {
    const { frame, q } = mount(<div><div data-testid="tile" onClick={() => {}}><span data-testid="inner">🐱</span></div></div>);
    expect(isActivityTarget(q('tile'), frame)).toBe(true);
    expect(isActivityTarget(q('inner'), frame)).toBe(true); // a touch on the tile's picture counts too
  });

  it('a drag handle (onPointerDown) is a game piece', () => {
    const { frame, q } = mount(<div><div data-testid="drag" onPointerDown={() => {}} /></div>);
    expect(isActivityTarget(q('drag'), frame)).toBe(true);
  });

  it('native draggable and the data-activity opt-in count', () => {
    const { frame, q } = mount(
      <div>
        <div data-testid="d" draggable />
        <div data-testid="opt" data-activity />
      </div>,
    );
    expect(isActivityTarget(q('d'), frame)).toBe(true);
    expect(isActivityTarget(q('opt'), frame)).toBe(true);
  });

  it('a scene-sized wrapper with a click handler is a backdrop, not a game piece — the pen can still draw on it', () => {
    const { frame, q } = mount(
      <div data-testid="wrapper" onClick={() => {}}>
        <div data-testid="empty" />
      </div>,
    );
    stub(q('wrapper'), 900, 900); // covers most of the stage
    expect(isActivityTarget(q('empty'), frame)).toBe(false);
  });

  it('a small piece inside a big clickable backdrop is still a game piece', () => {
    const { frame, q } = mount(
      <div data-testid="wrapper" onClick={() => {}}>
        <button data-testid="piece">A</button>
      </div>,
    );
    stub(q('wrapper'), 900, 900);
    expect(isActivityTarget(q('piece'), frame)).toBe(true);
  });

  it('a drag-library item (declares touch-action, no React handler) is a game piece', () => {
    const { frame, q } = mount(<div><div data-testid="framer" style={{ touchAction: 'pan-y' } as React.CSSProperties}><span data-testid="in">word</span></div></div>);
    (q('framer').style as any).touchAction = 'pan-y'; // jsdom does not map style props to CSS; real browsers do
    expect(isActivityTarget(q('framer'), frame)).toBe(true);
    expect(isActivityTarget(q('in'), frame)).toBe(true);
  });

  it('non-elements are not game pieces', () => {
    const { frame } = mount(<div />);
    expect(isActivityTarget(null, frame)).toBe(false);
    expect(isActivityTarget(window, frame)).toBe(false);
  });
});
