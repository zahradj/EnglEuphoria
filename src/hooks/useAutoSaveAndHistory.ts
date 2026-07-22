import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AutoSaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface Args {
  lessonId: string | null;
  slides: any[];
  title: string;
  /** Persist a draft silently (no toast). Returns lessonId or null. */
  silentSaveDraft: (slides: any[], meta: { title: string }) => Promise<string | null>;
  /** Debounce window in ms. Defaults to 5000. */
  delay?: number;
  enabled?: boolean;
}

/**
 * Watches `slides`/`title` and quietly persists a draft after the user
 * stops editing for `delay` ms. Exposes a status string for the UI badge.
 */
export function useAutoSave({
  lessonId,
  slides,
  title,
  silentSaveDraft,
  delay = 5000,
  enabled = true,
}: Args) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<number | null>(null);
  const firstRunRef = useRef(true);
  const lastSerialized = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;
    const serialized = JSON.stringify({ slides, title });
    if (firstRunRef.current) {
      firstRunRef.current = false;
      lastSerialized.current = serialized;
      return;
    }
    if (serialized === lastSerialized.current) return;
    setStatus('dirty');
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      setStatus('saving');
      try {
        const id = await silentSaveDraft(slides, { title });
        if (id) {
          lastSerialized.current = serialized;
          setLastSavedAt(new Date());
          setStatus('saved');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    }, delay);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [slides, title, enabled, delay, silentSaveDraft]);

  return { status, lastSavedAt };
}

export interface LessonRevision {
  id: string;
  lesson_id: string;
  title: string | null;
  content: any;
  kind: 'manual' | 'publish' | 'auto';
  created_at: string;
  note: string | null;
}

/**
 * Captures named snapshots and lists the most recent ones for a lesson.
 */
export function useRevisionHistory(lessonId: string | null) {
  const [revisions, setRevisions] = useState<LessonRevision[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!lessonId) {
      setRevisions([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('lesson_revisions' as any)
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (!error && data) setRevisions(data as any);
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const captureRevision = useCallback(
    async (snapshot: { title: string; slides: any[]; kind: 'manual' | 'publish' | 'auto'; note?: string }) => {
      if (!lessonId) return;
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;
      if (!userId) return;
      await supabase.from('lesson_revisions' as any).insert({
        lesson_id: lessonId,
        created_by: userId,
        title: snapshot.title,
        content: { slides: snapshot.slides },
        kind: snapshot.kind,
        note: snapshot.note ?? null,
      } as any);
      refresh();
    },
    [lessonId, refresh],
  );

  return { revisions, loading, refresh, captureRevision };
}
