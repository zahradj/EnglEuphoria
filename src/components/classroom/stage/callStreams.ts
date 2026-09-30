import { useEffect, useState, type DragEvent } from 'react';

/**
 * The classroom's live call streams, shared with lesson content (e.g. the
 * Playground "Live Stage" frame). The classroom shells publish them; a
 * scene reads them by ROLE, so "put the student on stage" shows the
 * student's call video on both screens — the student's own camera on their
 * side, the received stream on the teacher's — without the scene ever
 * opening a camera itself.
 */
export type CallRole = 'teacher' | 'student';

/** dataTransfer type used when a video tile is dragged onto the stage. */
export const PARTICIPANT_DRAG_TYPE = 'application/x-ee-participant';

interface CallStreamsState {
  self: CallRole | null;
  teacher: MediaStream | null;
  student: MediaStream | null;
}

let current: CallStreamsState = { self: null, teacher: null, student: null };
const listeners = new Set<() => void>();

export function publishCallStreams(next: CallStreamsState) {
  if (next.self === current.self && next.teacher === current.teacher && next.student === current.student) return;
  current = next;
  listeners.forEach((l) => l());
}

export function clearCallStreams() {
  publishCallStreams({ self: null, teacher: null, student: null });
}

export function useCallStreams(): CallStreamsState {
  const [state, setState] = useState(current);
  useEffect(() => {
    const l = () => setState(current);
    listeners.add(l);
    l();
    return () => { listeners.delete(l); };
  }, []);
  return state;
}

/** Props that make a video tile draggable onto the stage frame. */
export function participantDragProps(role: CallRole) {
  return {
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData(PARTICIPANT_DRAG_TYPE, role);
      e.dataTransfer.setData('text/plain', role);
      e.dataTransfer.effectAllowed = 'copy';
    },
    title: 'Drag onto the lesson’s stage frame',
  } as const;
}
