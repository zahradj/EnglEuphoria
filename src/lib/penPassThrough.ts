/**
 * "Smart pen" hit-testing for the student's drawing layer.
 *
 * With the pen on, a touch that lands on a game piece (a draggable card, an
 * answer button, a tile…) must reach that piece, and a touch on empty space
 * should draw. This decides which one a touch is.
 *
 * It needs no per-activity markup: React records the props of every DOM node it
 * renders (under a `__reactProps$…` key), so "does this element have a click /
 * drag handler?" can be answered for any activity, including ones added later.
 */

/** Elements that are interactive by their nature. `data-activity` opts any element in. */
const INTERACTIVE_SELECTOR = [
  'button', 'a[href]', 'input', 'select', 'textarea', 'label', 'summary',
  '[role="button"]', '[role="link"]', '[role="slider"]', '[role="option"]', '[role="checkbox"]', '[role="radio"]',
  '[draggable="true"]', '[contenteditable="true"]', '[data-activity]',
].join(',');

/** React props that mean "this element reacts to a touch". */
const TOUCH_HANDLER_PROPS = [
  'onClick', 'onDoubleClick', 'onPointerDown', 'onPointerUp', 'onMouseDown', 'onMouseUp', 'onTouchStart', 'onTouchEnd', 'onDragStart',
] as const;

/**
 * An element covering most of the stage is a backdrop (a scene wrapper with a
 * click handler), not a game piece — treating it as interactive would stop the
 * pen from ever drawing on that scene.
 */
export const BACKDROP_AREA_FRACTION = 0.6;

function reactPropsOf(el: Element): Record<string, unknown> | null {
  for (const key of Object.keys(el)) {
    if (key.startsWith('__reactProps$')) return (el as unknown as Record<string, Record<string, unknown>>)[key];
  }
  return null;
}

function isBackdrop(el: Element, frameArea: number): boolean {
  if (frameArea <= 0) return false;
  const r = el.getBoundingClientRect();
  return r.width * r.height >= frameArea * BACKDROP_AREA_FRACTION;
}

/**
 * Is the element under the finger something the student is meant to touch
 * (true → let the lesson have the touch) rather than empty space (false → draw)?
 * `frame` is the stage the pen layer sits in; the search stops there.
 */
export function isActivityTarget(target: EventTarget | null, frame: Element): boolean {
  if (!(target instanceof Element)) return false;
  const fr = frame.getBoundingClientRect();
  const frameArea = fr.width * fr.height;

  for (let el: Element | null = target; el && el !== frame; el = el.parentElement) {
    if (isBackdrop(el, frameArea)) continue;
    if (el.matches(INTERACTIVE_SELECTOR)) return true;
    const props = reactPropsOf(el);
    if (props && TOUCH_HANDLER_PROPS.some((p) => typeof props[p] === 'function')) return true;
    if (claimsItsOwnGestures(el)) return true;
  }
  return false;
}

/**
 * Drag libraries (framer-motion drag / Reorder, custom pointer drags, Tailwind `touch-none`) set
 * `touch-action` on whatever the finger is meant to move, and leave no React handler to find.
 * An element that declares its own touch gestures is a game piece.
 */
function claimsItsOwnGestures(el: Element): boolean {
  const inline = (el as HTMLElement).style?.touchAction;
  let value = inline;
  if (!value && typeof getComputedStyle === 'function') {
    try { value = getComputedStyle(el).touchAction; } catch { value = ''; }
  }
  return !!value && value !== 'auto' && value !== 'initial' && value !== 'unset' && value !== 'inherit';
}
