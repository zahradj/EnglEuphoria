// Structural DOM-path mirroring for the live classroom (Academy-owned; the idea is the Playground's, re-implemented here for hub separation).
// Teacher and student render the same scene tree from the same data, so a child-index path means the same element on both screens.
// Only discrete clicks and typed text are replayed; page changes stay on the scene-index broadcast.

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
