import { useEffect, useState, lazy, Suspense } from 'react';
import { BookOpen, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const StorybookReader = lazy(() => import('@/pages/StorybookReader'));

interface BookRow {
  id: string;
  title: string;
  hub: string;
  cefr_level: string;
  cover_image_url: string | null;
}

interface Props {
  bookingId: string;
  lessonId?: string | null;
  role: 'teacher' | 'student';
}

/**
 * Lists storybooks associated with the current classroom booking and opens them
 * in the dedicated Book Viewer. Storybooks NEVER route through the slide stage.
 */
export function ClassroomStorybookPanel({ bookingId, lessonId, role }: Props) {
  const [items, setItems] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      const query = (supabase as any).from('storybooks').select('id,title,hub,cefr_level,cover_image_url').eq('published', true);
      const filters: string[] = [];
      filters.push(`assigned_booking_id.eq.${bookingId}`);
      if (lessonId) filters.push(`linked_lesson_id.eq.${lessonId}`);
      const { data } = await query.or(filters.join(','));
      if (cancel) return;
      setItems((data ?? []) as BookRow[]);
      setLoading(false);
    })().catch(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [bookingId, lessonId]);

  return (
    <>
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-600" />
          <h3 className="font-bold text-sm">Classroom Storybooks</h3>
          <Badge variant="outline" className="text-[10px] ml-auto">{items.length}</Badge>
        </div>

        {loading ? (
          <div className="py-6 text-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline" /></div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No storybooks assigned to this session.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => setActiveBookId(b.id)}
                  className="w-full text-left rounded-xl border border-border/60 bg-background/50 hover:bg-accent p-2.5 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{b.title}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{b.cefr_level}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{b.hub} · open book</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeBookId && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="w-4 h-4 text-violet-600" />
              Classroom Story Mode {role === 'teacher' && <Badge variant="secondary" className="text-[10px]">Teacher control</Badge>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setActiveBookId(null)} aria-label="Close book">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>}>
              {/* Reader uses bookId from the URL; we render with key to remount under the overlay. */}
              <BookViewerEmbed bookId={activeBookId} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}

function BookViewerEmbed({ bookId }: { bookId: string }) {
  // The StorybookReader page reads :bookId from the URL. Render it inside an iframe
  // to its dedicated route so we reuse the immersive reader without forking its code.
  return (
    <iframe
      title="Storybook Reader"
      src={`/storybook/viewer/${bookId}`}
      className="w-full h-full border-0"
    />
  );
}

export default ClassroomStorybookPanel;
