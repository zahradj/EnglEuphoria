import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { CollaborativeCanvas } from './CollaborativeCanvas';

// ---- minimal browser stubs jsdom lacks ----
const rectFor = function (this: Element) {
  const isPiece = (this as HTMLElement).dataset?.testid === 'piece';
  const w = isPiece ? 100 : 800;
  const h = isPiece ? 100 : 600;
  return { left: 0, top: 0, right: w, bottom: h, width: w, height: h, x: 0, y: 0, toJSON() {} } as DOMRect;
};
const noopCtx = new Proxy({}, { get: () => () => {}, set: () => true });

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(rectFor);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => noopCtx as any);
  (globalThis as any).ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function pointer(type: string, target: EventTarget, x: number, y: number, id = 1) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: id });
  Object.defineProperty(e, 'pointerType', { value: 'touch' });
  target.dispatchEvent(e);
  return e;
}

/** A stage = pen layer (wrapper) + canvas, with a game piece and some empty space inside the stage. */
function setup(over: { smartPen?: boolean } = {}) {
  const onAddStroke = vi.fn();
  const pieceDown = vi.fn();
  const { container } = render(
    <div data-testid="stage">
      <div data-testid="empty" />
      <button data-testid="piece" onPointerDown={pieceDown}>A</button>
      <div className="absolute inset-0 z-50" style={{ pointerEvents: 'none' }}>
        <CollaborativeCanvas
          roomId="r" userId="u" userName="Kid" role="student"
          canDraw activeTool="pen" activeColor="#f00"
          strokes={[]} onAddStroke={onAddStroke}
          smartPen={over.smartPen ?? true}
        />
      </div>
    </div>,
  );
  const q = (id: string) => container.querySelector(`[data-testid="${id}"]`) as HTMLElement;
  return { onAddStroke, pieceDown, q, stage: q('stage') };
}

describe('student smart pen on the drawing canvas', () => {
  it('a stroke that starts on empty space draws', () => {
    const { onAddStroke, q } = setup();
    pointer('pointerdown', q('empty'), 100, 100);
    pointer('pointermove', window, 160, 130);
    pointer('pointermove', window, 220, 160);
    pointer('pointerup', window, 220, 160);
    expect(onAddStroke).toHaveBeenCalledTimes(1);
    const stroke = onAddStroke.mock.calls[0][0];
    expect(stroke.strokeData.points.length).toBeGreaterThanOrEqual(2);
    expect(stroke.strokeData.tool).toBe('pen');
  });

  it('a touch on a game piece goes to the game and does NOT draw', () => {
    const { onAddStroke, pieceDown, q } = setup();
    const down = pointer('pointerdown', q('piece'), 50, 50);
    pointer('pointermove', window, 120, 90);
    pointer('pointerup', window, 120, 90);
    expect(pieceDown).toHaveBeenCalledTimes(1); // the activity received the touch
    expect(down.defaultPrevented).toBe(false); // and it was not swallowed
    expect(onAddStroke).not.toHaveBeenCalled();
  });

  it('a stroke on empty space is not also delivered to the lesson underneath', () => {
    const { pieceDown, q, stage } = setup();
    const seenByStage = vi.fn();
    stage.addEventListener('pointerdown', seenByStage); // bubble phase, like a scene wrapper
    pointer('pointerdown', q('empty'), 300, 300);
    pointer('pointerup', window, 300, 300);
    expect(seenByStage).not.toHaveBeenCalled();
    expect(pieceDown).not.toHaveBeenCalled();
  });

  it('turns off cleanly: no smart-pen listeners and touch-action restored when the pen is put down', () => {
    const onAddStroke = vi.fn();
    const ui = (canDraw: boolean) => (
      <div data-testid="stage">
        <div data-testid="empty" />
        <div style={{ pointerEvents: 'none' }}>
          <CollaborativeCanvas roomId="r" userId="u" userName="Kid" role="student"
            canDraw={canDraw} activeTool="pen" activeColor="#f00" strokes={[]} onAddStroke={onAddStroke} smartPen />
        </div>
      </div>
    );
    const { container, rerender } = render(ui(true));
    const stage = container.querySelector('[data-testid="stage"]') as HTMLElement;
    expect(stage.style.touchAction).toBe('none'); // drawing needs it so a finger-drag doesn't scroll
    rerender(ui(false));
    expect(stage.style.touchAction).toBe('');
    pointer('pointerdown', container.querySelector('[data-testid="empty"]')!, 10, 10);
    pointer('pointerup', window, 10, 10);
    expect(onAddStroke).not.toHaveBeenCalled();
  });
});
