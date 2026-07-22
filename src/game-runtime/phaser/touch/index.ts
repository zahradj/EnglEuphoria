/**
 * touch — mobile/tablet tuning for the Phaser game runtime.
 *
 *   - `isTouchDevice()` — feature-detects pointer:coarse / touch points.
 *   - `haptic(pattern)` — fires the Vibration API when available; silently
 *     no-ops on iOS/desktop. Patterns are short by design so they reinforce
 *     UI events instead of distracting from speech tasks.
 *   - `setupTouchHost(el)` — locks the game host against the browser
 *     gestures that wreck full-screen canvas games: pinch-zoom, double-tap
 *     zoom, long-press text selection, pull-to-refresh, context menus.
 *
 * These primitives are pure DOM/Web API — no Phaser dependency — so they
 * are safe to import from bootGame before the game instance exists.
 */

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(pointer: coarse)').matches) return true;
  return (navigator.maxTouchPoints ?? 0) > 0;
}

export type HapticKind = 'tap' | 'success' | 'error' | 'celebrate';

const HAPTIC_PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,
  success: [12, 40, 12],
  error: [40, 30, 40],
  celebrate: [10, 30, 10, 30, 20],
};

export function haptic(kind: HapticKind): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  if (!isTouchDevice()) return;
  try {
    navigator.vibrate(HAPTIC_PATTERNS[kind]);
  } catch {
    // Some browsers throw if the page is hidden — never propagate.
  }
}

/**
 * Lock down browser gestures around the game host. Returns a cleanup fn.
 */
export function setupTouchHost(host: HTMLElement): () => void {
  // Prevent the OS from intercepting taps as zoom / scroll / text-select.
  const prevStyles: Partial<CSSStyleDeclaration> = {
    touchAction: host.style.touchAction,
    userSelect: host.style.userSelect,
    webkitUserSelect: (host.style as unknown as { webkitUserSelect?: string }).webkitUserSelect,
    overscrollBehavior: host.style.overscrollBehavior,
  };
  host.style.touchAction = 'manipulation';
  host.style.userSelect = 'none';
  (host.style as unknown as { webkitUserSelect?: string }).webkitUserSelect = 'none';
  host.style.overscrollBehavior = 'contain';

  // Block pinch-zoom & double-tap-zoom on iOS where touchAction alone is
  // not enough (gesture* events are non-standard but still fire).
  const preventDefault = (e: Event) => e.preventDefault();
  host.addEventListener('gesturestart', preventDefault as EventListener);
  host.addEventListener('gesturechange', preventDefault as EventListener);
  host.addEventListener('contextmenu', preventDefault);

  // Block multi-touch pinch on Android. Single-finger touches pass through
  // so Phaser still receives normal pointer events.
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault();
  };
  host.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    host.style.touchAction = prevStyles.touchAction ?? '';
    host.style.userSelect = prevStyles.userSelect ?? '';
    (host.style as unknown as { webkitUserSelect?: string }).webkitUserSelect =
      prevStyles.webkitUserSelect ?? '';
    host.style.overscrollBehavior = prevStyles.overscrollBehavior ?? '';
    host.removeEventListener('gesturestart', preventDefault as EventListener);
    host.removeEventListener('gesturechange', preventDefault as EventListener);
    host.removeEventListener('contextmenu', preventDefault);
    host.removeEventListener('touchmove', onTouchMove);
  };
}

/** Standard 44px minimum tap target (Apple HIG / WCAG 2.5.5). */
export const MIN_TAP_PX = 44;

/**
 * Expand a Phaser interactive rectangle's hit area to at least 44×44 so
 * undersized visuals still meet tap-target guidelines. Caller passes the
 * intrinsic visual width/height; we return the padded hit area.
 */
export function generousHitArea(width: number, height: number): { w: number; h: number } {
  return {
    w: Math.max(width, MIN_TAP_PX),
    h: Math.max(height, MIN_TAP_PX),
  };
}
