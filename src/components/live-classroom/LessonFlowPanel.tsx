import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchLessonMeta, getAdjacentLesson, type LessonMeta } from '@/services/activeCoreLessonResolver';
import { toast } from 'sonner';

interface Props {
  lessonId: string | null;
  onLoadLesson: (lessonId: string) => void;
}

/**
 * Teacher-only 'Lesson Flow' control panel. Enforces strict linear
 * progression through the curriculum matrix — Prev / Next only.
 */
export function LessonFlowPanel({ lessonId, onLoadLesson }: Props) {
  const [meta, setMeta] = useState<LessonMeta | null>(null);
  const [prev, setPrev] = useState<LessonMeta | null>(null);
  const [next, setNext] = useState<LessonMeta | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!lessonId) { setMeta(null); setPrev(null); setNext(null); return; }
    let cancelled = false;
    (async () => {
      setBusy(true);
      const [m, p, n] = await Promise.all([
        fetchLessonMeta(lessonId),
        getAdjacentLesson(lessonId, 'prev'),
        getAdjacentLesson(lessonId, 'next'),
      ]);
      if (cancelled) return;
      setMeta(m); setPrev(p); setNext(n); setBusy(false);
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  const handleFetch = (target: LessonMeta | null, label: string) => {
    if (!target) return;
    onLoadLesson(target.id);
    toast.success(`Loaded ${label}: ${target.title}`);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" /> Lesson Flow
      </div>

      <div className="rounded-xl border border-border bg-background p-3 space-y-1">
        {busy ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading…</div>
        ) : meta ? (
          <>
            <div className="text-sm font-semibold leading-tight line-clamp-2">{meta.title}</div>
            <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
              {meta.slot_cefr_level && <span className="px-1.5 py-0.5 rounded bg-muted">{meta.slot_cefr_level.toUpperCase()}</span>}
              {meta.slot_unit_number != null && <span className="px-1.5 py-0.5 rounded bg-muted">Unit {meta.slot_unit_number}</span>}
              {meta.slot_lesson_number != null && <span className="px-1.5 py-0.5 rounded bg-muted">Lesson {meta.slot_lesson_number}</span>}
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">No active lesson.</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          className="justify-start gap-2"
          disabled={!prev || busy}
          onClick={() => handleFetch(prev, 'previous lesson')}
        >
          <ChevronLeft className="h-4 w-4" />
          Fetch Previous Lesson
        </Button>
        <Button
          variant="default"
          size="sm"
          className="justify-start gap-2"
          disabled={!next || busy}
          onClick={() => handleFetch(next, 'next lesson')}
        >
          <ChevronRight className="h-4 w-4" />
          Fetch Next Lesson
        </Button>
      </div>

      {!prev && meta && (
        <p className="text-[10px] text-muted-foreground italic">This is Lesson 1 of the curriculum.</p>
      )}
      {!next && meta && (
        <p className="text-[10px] text-muted-foreground italic">End of the curriculum reached.</p>
      )}
    </aside>
  );
}
