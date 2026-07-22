import { useEffect, useRef } from 'react';
import { StorybookReadingSession } from '@/storybook/observer';
import type { ReadingSessionMode } from '@/storybook/types';

export function useStorybookSession(opts: {
  bookId: string;
  studentId: string | null;
  mode?: ReadingSessionMode;
  totalPages: number;
  lastPageId?: string;
}) {
  const ref = useRef<StorybookReadingSession | null>(null);

  useEffect(() => {
    if (!opts.studentId || !opts.bookId) return;
    const s = new StorybookReadingSession({
      bookId: opts.bookId,
      studentId: opts.studentId,
      mode: opts.mode ?? 'solo',
    });
    ref.current = s;
    void s.start().catch(() => {});
    return () => {
      void s.end(opts.totalPages, opts.lastPageId).catch(() => {});
      ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.bookId, opts.studentId]);

  return ref;
}
