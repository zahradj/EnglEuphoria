/**
 * Structural DOM-path mirroring for the embedded scene lesson player.
 *
 * Teacher and student render the exact same scene component tree for the
 * same scene data, so a click at child-index path [2, 0, 3] means the same
 * element on both sides. Recording that path (not coordinates, not a
 * selector) and replaying a real `.click()` at the matching path on the
 * other side reproduces the same local interaction — selection, reveal,
 * drag-drop's own click handlers, etc. — without needing every scene kind
 * to lift its state into a syncable shape.
 *
 * Deliberately NOT used for page-level navigation (that stays on the
 * existing scene-index broadcast) and doesn't attempt to replay continuous
 * gestures like drag-move or press-and-hold — only discrete clicks/taps.
 */

export function getDomPath(root: Element, el: Element): number[] | null {
  const path: number[] = [];
  let node: Element | null = el;
  while (node && node !== root) {
    const parent: Element | null = node.parentElement;
    if (!parent) return null;
    const idx = Array.prototype.indexOf.call(parent.children, node);
    if (idx < 0) return null;
    path.unshift(idx);
    node = parent;
  }
  return node === root ? path : null;
}

export function getElementAtPath(root: Element, path: number[]): HTMLElement | null {
  let node: Element = root;
  for (const idx of path) {
    const child = node.children[idx];
    if (!child) return null;
    node = child;
  }
  return node instanceof HTMLElement ? node : null;
}

/**
 * Runs `fn` with Element.prototype.setPointerCapture/releasePointerCapture
 * temporarily neutered, then restores them.
 *
 * A synthetically dispatched PointerEvent's pointerId is never registered
 * as an "active pointer" by the browser (that table is populated only by
 * real hardware input), so any scene component that calls
 * `el.setPointerCapture(e.pointerId)` in its own pointerdown handler — the
 * standard pattern for touch-friendly custom drag — throws a real
 * NotFoundError the instant a replayed pointerdown reaches it, aborting the
 * rest of that handler (e.g. the setState call that actually starts the
 * drag visual). Not a bug in this app's drag code; it's the platform
 * correctly refusing to let an untrusted event claim pointer capture. This
 * is safe to neuter only for the synchronous duration of one dispatchEvent
 * call, since dispatchEvent runs every listener to completion before
 * returning — nothing else can observe the patched prototype in between.
 */
export function withPointerCaptureNoop<T>(fn: () => T): T {
  const proto = Element.prototype as Element & {
    setPointerCapture(pointerId: number): void;
    releasePointerCapture(pointerId: number): void;
  };
  const originalSet = proto.setPointerCapture;
  const originalRelease = proto.releasePointerCapture;
  proto.setPointerCapture = function () {};
  proto.releasePointerCapture = function () {};
  try {
    return fn();
  } finally {
    proto.setPointerCapture = originalSet;
    proto.releasePointerCapture = originalRelease;
  }
}
