/**
 * a11y — accessibility shim for the Phaser game runtime.
 *
 * Phaser draws to a canvas, which is opaque to screen readers. This module
 * provides:
 *   - Announcer: a singleton ARIA live region appended next to the canvas
 *     host. Scenes call `Announcer.say(text)` for status updates.
 *   - setupCanvasA11y: tags the Phaser canvas with role + label + tabindex
 *     so it can be focused with the keyboard and named to screen readers.
 *   - reducedMotion(): media-query check used by BaseScene to suppress
 *     non-essential tweens (shakes, scale pulses, ripple).
 *
 * Keyboard model (handled by BaseScene helpers, not here): 1-9 directly
 * pick a choice; Arrow keys move focus between cards; Enter/Space confirm.
 */

let liveRegion: HTMLDivElement | null = null;
let statusRegion: HTMLDivElement | null = null;
let lastSpoken = '';

function ensureRegions(): void {
  if (liveRegion && statusRegion) return;
  if (typeof document === 'undefined') return;

  if (!statusRegion) {
    statusRegion = document.createElement('div');
    statusRegion.setAttribute('role', 'status');
    statusRegion.setAttribute('aria-live', 'polite');
    statusRegion.setAttribute('aria-atomic', 'true');
    statusRegion.className = 'sr-only';
    Object.assign(statusRegion.style, srOnlyStyle());
    document.body.appendChild(statusRegion);
  }

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'alert');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    Object.assign(liveRegion.style, srOnlyStyle());
    document.body.appendChild(liveRegion);
  }
}

function srOnlyStyle(): Partial<CSSStyleDeclaration> {
  return {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: '0',
  };
}

export const Announcer = {
  /** Polite update (does not interrupt). */
  say(text: string): void {
    if (!text) return;
    ensureRegions();
    if (!statusRegion) return;
    if (text === lastSpoken) {
      // Force re-announcement by toggling content.
      statusRegion.textContent = '';
      window.setTimeout(() => { if (statusRegion) statusRegion.textContent = text; }, 30);
    } else {
      statusRegion.textContent = text;
    }
    lastSpoken = text;
  },
  /** Assertive update (interrupts). */
  alert(text: string): void {
    if (!text) return;
    ensureRegions();
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.setTimeout(() => { if (liveRegion) liveRegion.textContent = text; }, 30);
  },
  destroy(): void {
    liveRegion?.remove();
    statusRegion?.remove();
    liveRegion = null;
    statusRegion = null;
    lastSpoken = '';
  },
};

export interface CanvasA11yOptions {
  label: string;
  description?: string;
}

export function setupCanvasA11y(host: HTMLElement, opts: CanvasA11yOptions): () => void {
  ensureRegions();
  host.setAttribute('role', 'application');
  host.setAttribute('aria-label', opts.label);
  if (opts.description) host.setAttribute('aria-describedby', 'phaser-game-desc');

  // Make the host focusable so keyboard events route here even before a
  // canvas is created.
  if (!host.hasAttribute('tabindex')) host.setAttribute('tabindex', '0');

  // Tag the inner canvas once Phaser creates it.
  const observer = new MutationObserver(() => {
    const canvas = host.querySelector('canvas');
    if (canvas && !canvas.hasAttribute('aria-label')) {
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', opts.label);
    }
  });
  observer.observe(host, { childList: true, subtree: true });

  return () => observer.disconnect();
}

export function reducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
