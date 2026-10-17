// Bridge from the live classroom to a v2 lesson: TEACHER owns the page index; STUDENT follows it and plays the page.
// Clicks and typed text are replayed on the other screen (DOM-path replay, as in the Playground classroom), so the teacher watches the student play.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { whiteboardService, type SceneTapPayload } from '@/services/whiteboardService';
import { getDomPath, getElementAtPath } from '@/content/playground-library/unit1/scenePathSync';
import { LessonPlayer } from '../LessonPlayer';
import { loadScript } from '../lessonScripts';
import type { LessonScript } from '../types';

export interface EmbeddedPlayerHandle { goNext: () => void; goBack: () => void; goToIndex: (i: number) => void; setInteractionUnlocked: (u: boolean) => void }

interface Props {
  /** library id of the lesson (loaded on demand) */
  lessonId?: string;
  /** or the script itself */
  script?: LessonScript | null;
  roomId: string;
  role: 'teacher' | 'student';
  persistedSceneIdx?: number | null;
  onSceneIdxPersist?: (i: number) => void;
  artBase?: string;
  onNavState?: (s: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean; lockToggleApplicable: boolean }) => void;
}

// areas that look the same on both screens
const SHARED = ['.av-stage', '.av-hud', '.av-dock'] as const;

export const EmbeddedPlayerLesson = forwardRef<EmbeddedPlayerHandle, Props>(function EmbeddedPlayerLesson(
  { lessonId, script: given, roomId, role, persistedSceneIdx, onSceneIdxPersist, artBase = '/academy-art', onNavState }, ref) {
  const [loaded, setLoaded] = useState<LessonScript | null>(null);
  useEffect(() => {
    if (given || !lessonId) return;
    let live = true;
    void loadScript(lessonId)?.then((s) => { if (live) setLoaded(s); });
    return () => { live = false; };
  }, [lessonId, given]);
  const script = given ?? loaded;
  const total = script?.scenes.length ?? 0;
  const [idx, setIdx] = useState(() => Math.max(0, persistedSceneIdx ?? 0));
  const idxRef = useRef(idx); idxRef.current = idx;
  const totalRef = useRef(total); totalRef.current = total;
  const wrapRef = useRef<HTMLDivElement>(null);
  const replaying = useRef(false);
  const pending = useRef<SceneTapPayload[]>([]);

  useEffect(() => { if (role === 'student' && persistedSceneIdx != null) setIdx(persistedSceneIdx); }, [persistedSceneIdx, role]);
  const move = useCallback((n: number) => {
    const next = Math.max(0, Math.min(Math.max(totalRef.current - 1, 0), n));
    setIdx(next);
    onSceneIdxPersist?.(next);
  }, [onSceneIdxPersist]);
  useImperativeHandle(ref, () => ({ goNext: () => move(idxRef.current + 1), goBack: () => move(idxRef.current - 1), goToIndex: move, setInteractionUnlocked: () => undefined }), [move]);
  useEffect(() => { if (total > 0) onNavState?.({ sceneIdx: idx, total, canNavigate: true, interactionUnlocked: false, lockToggleApplicable: false }); }, [idx, total, onNavState]);

  const apply = (p: SceneTapPayload) => {
    const root = wrapRef.current?.querySelector(p.sel ?? '.av-stage') ?? null;
    const el = root ? getElementAtPath(root, p.path) : null;
    if (!el) return;
    replaying.current = true;
    try {
      if (p.kind === 'input' && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
        const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, p.value ?? '');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (p.kind === 'click') (el as HTMLElement).click();
    } finally { replaying.current = false; }
  };

  useEffect(() => {
    if (!roomId || !script) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const send = (e: Event, kind: 'click' | 'input') => {
      if (replaying.current) return;
      const el = e.target as Element | null;
      if (!el) return;
      const sel = SHARED.find((q) => el.closest(q));
      const root = sel ? el.closest(sel) : null;
      if (!sel || !root) return;
      const path = getDomPath(root, el);
      if (!path) return;
      void whiteboardService.sendSceneTap(roomId, { path, kind, slide: idxRef.current, value: kind === 'input' ? (el as HTMLInputElement).value : undefined, sel, senderRole: role, senderId: role });
    };
    const onClick = (e: Event) => send(e, 'click');
    const onInput = (e: Event) => send(e, 'input');
    wrap.addEventListener('click', onClick, true);
    wrap.addEventListener('input', onInput, true);
    const off = whiteboardService.subscribeToSceneTap(roomId, (p) => {
      if (p.senderRole === role || p.slide == null || p.kind === 'ping') return;
      if (p.slide === idxRef.current) apply(p); else if (p.slide > idxRef.current) pending.current.push(p);
    });
    return () => { wrap.removeEventListener('click', onClick, true); wrap.removeEventListener('input', onInput, true); off(); };
  }, [role, roomId, script]);
  useEffect(() => {
    const due = pending.current.filter((p) => p.slide === idx);
    pending.current = pending.current.filter((p) => (p.slide ?? 0) > idx);
    if (!due.length) return;
    const t = setTimeout(() => due.forEach(apply), 80);
    return () => clearTimeout(t);
  }, [idx]);

  if (!script) return <div className="h-full w-full" data-testid="av-embed-missing" />;
  return (
    <div ref={wrapRef} className="relative h-full w-full" data-testid="av-embed" data-role={role}>
      <LessonPlayer script={script} artBase={artBase} role={role} index={idx} onIndex={role === 'teacher' ? move : undefined} ephemeral />
    </div>
  );
});
