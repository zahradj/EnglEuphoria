import { useEffect, type RefObject } from 'react';
import { reactPropsOf } from '@/lib/penPassThrough';

/**
 * In a live class only the TEACHER changes the slide (owner, 2026-10-14). A scene's own "Next ⭐" /
 * "Continue" button calls the `onNext` it is given; the student's lesson player hands every scene this
 * do-nothing function instead of its `goNext`, and the buttons that carry it are hidden, so a student can
 * never move the class on. The teacher's player keeps the real `goNext`.
 */
export const TEACHER_ADVANCES: () => void = () => {};

/** Hide every button inside `root` whose click handler is `handler`; returns how many were hidden. */
export function hideButtonsWithHandler(root: Element, handler: unknown): number {
  let hidden = 0;
  root.querySelectorAll<HTMLElement>('button, [role="button"], a').forEach((el) => {
    if (el.dataset.teacherAdvances === '1') return;
    const props = reactPropsOf(el);
    if (props && (props.onClick === handler || props.onPointerUp === handler)) {
      el.dataset.teacherAdvances = '1';
      el.style.setProperty('display', 'none', 'important');
      hidden += 1;
    }
  });
  return hidden;
}

/** While `enabled`, keep the scene's "next" buttons hidden as scenes render and re-render. */
export function useHideTeacherOnlyButtons(rootRef: RefObject<HTMLElement | null>, enabled: boolean, sceneKey: string) {
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    let raf = 0;
    const scan = () => { raf = 0; hideButtonsWithHandler(root, TEACHER_ADVANCES); };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(scan); };
    scan();
    const mo = new MutationObserver(schedule);
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'class'] });
    return () => { mo.disconnect(); if (raf) window.cancelAnimationFrame(raf); };
  }, [rootRef, enabled, sceneKey]);
}
