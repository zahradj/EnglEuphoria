import { useEffect, useRef, useCallback } from 'react';
import { whiteboardService } from '@/services/whiteboardService';

interface UseWebScrollSyncOptions {
  roomId: string;
  userId: string;
  /** 'teacher' broadcasts scroll; 'student' receives and applies it */
  role: 'teacher' | 'student';
  /** Disable when the embed isn't visible */
  enabled?: boolean;
  /** Throttle interval in ms for outgoing scroll events (default 50ms) */
  throttleMs?: number;
}

/**
 * Syncs the scroll position of a parent wrapper around an embedded iframe.
 *
 * Why a wrapper? Cross-origin iframes (YouTube, Wikipedia, Google Docs) block
 * the parent page from reading or controlling their internal scroll. The
 * workaround is to give the iframe a fixed large height and put it inside a
 * scrollable div — we then sync the WRAPPER's scroll position instead.
 */
export function useWebScrollSync({
  roomId,
  userId,
  role,
  enabled = true,
  throttleMs = 50,
}: UseWebScrollSyncOptions) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const lastSentRef = useRef<number>(0);
  const isApplyingRemoteRef = useRef<boolean>(false);

  // Teacher: broadcast scroll position as a percentage (0..1)
  const handleScroll = useCallback(() => {
    if (role !== 'teacher' || !enabled) return;
    if (isApplyingRemoteRef.current) return; // avoid feedback loop
    const el = wrapperRef.current;
    if (!el) return;
    const now = Date.now();
    if (now - lastSentRef.current < throttleMs) return;
    lastSentRef.current = now;
    const denom = el.scrollHeight - el.clientHeight;
    const pct = denom > 0 ? el.scrollTop / denom : 0;
    void whiteboardService.sendScroll(roomId, pct, userId);
  }, [roomId, userId, role, enabled, throttleMs]);

  // Student: subscribe and apply incoming scroll percentage
  useEffect(() => {
    if (role !== 'student' || !enabled || !roomId) return;

    const unsub = whiteboardService.subscribeToScroll(roomId, ({ scrollPercentage, senderId }) => {
      if (senderId === userId) return;
      const el = wrapperRef.current;
      if (!el) return;
      const target = (el.scrollHeight - el.clientHeight) * scrollPercentage;
      isApplyingRemoteRef.current = true;
      el.scrollTop = target;
      // release the lock on next frame so user-driven scroll can resume
      requestAnimationFrame(() => {
        isApplyingRemoteRef.current = false;
      });
    });

    return unsub;
  }, [roomId, userId, role, enabled]);

  return { wrapperRef, onScroll: handleScroll };
}
