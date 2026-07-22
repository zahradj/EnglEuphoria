import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { loadBook, type LoadedBook } from '@/services/storybookReader';
import { ReaderChrome } from '@/components/storybook/ReaderChrome';
import { FlipBookViewer } from '@/components/storybook/FlipBookViewer';
import { useStorybookSession } from '@/hooks/useStorybookSession';
import { useStudentCefr, isBeginnerCefr } from '@/hooks/useStudentCefr';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PartyPopper, Image as ImageIcon, Volume2, Loader2, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import VocabGamesSlot from '@/vocab-games/VocabGamesSlot';
import type { Cefr, Hub, VocabTarget } from '@/vocab-games';
import { buildStorybookVocabGamesSlot } from '@/lib/vocabGamesSlotInjector';

const FONT_SCALES = [1, 1.15, 1.3];

export default function StorybookReader() {
  const { bookId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loaded, setLoaded] = useState<LoadedBook | null>(null);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [fontScale, setFontScale] = useState(0);
  const [completed, setCompleted] = useState(false);
  const flipRef = useRef<any>(null);
  const { cefr } = useStudentCefr();
  const beginnerAutoplay = isBeginnerCefr(cefr);

  const [mediaPending, setMediaPending] = useState(false);
  const [genBusy, setGenBusy] = useState<{ kind: 'image' | 'audio' | 'batch-image' | 'batch-audio'; pageId?: string } | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);

  // Studio Mode: enabled by ?studio=1 OR when the signed-in user owns the book.
  const studioParam = searchParams.get('studio') === '1';
  const ownsBook = !!user?.id && loaded?.book?.created_by === user.id;
  const studioMode = studioParam || ownsBook;

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // ~2 min @ 6s

    const tick = async () => {
      try {
        const lb = await loadBook(bookId);
        if (cancelled) return;
        setLoaded(lb);
        const pending = (lb?.flatPages ?? []).some(
          (p: any) => !p.illustration_url && p.page_type !== 'comprehension' && p.page_type !== 'speaking_checkpoint',
        );
        setMediaPending(pending);
        // Only auto-poll for students (not in Studio Mode — creators drive it manually).
        if (pending && !studioMode && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(tick, 6000);
        }
      } catch (e) {
        console.error(e);
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [bookId, studioMode]);

  const pages = loaded?.flatPages ?? [];
  const page = pages[index];

  const session = useStorybookSession({
    bookId,
    studentId: user?.id ?? null,
    totalPages: pages.length,
    lastPageId: page?.id,
  });

  // Emit page_complete when leaving a page
  const prevPageIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!page?.id) return;
    if (prevPageIdRef.current && prevPageIdRef.current !== page.id && session.current) {
      const words = countWords(pages.find((p) => p.id === prevPageIdRef.current));
      void session.current.emit({ pageId: prevPageIdRef.current, type: 'page_complete' }, words);
    }
    prevPageIdRef.current = page.id ?? null;
  }, [page?.id, pages, session]);

  const flipNext = () => flipRef.current?.pageFlip?.()?.flipNext?.();
  const flipPrev = () => flipRef.current?.pageFlip?.()?.flipPrev?.();

  const finish = () => {
    if (page?.id && session.current) {
      void session.current.emit({ pageId: page.id, type: 'page_complete' }, countWords(page));
    }
    setCompleted(true);
  };

  // ── Studio actions ──────────────────────────────────────────────
  const refreshBook = async () => {
    try {
      const lb = await loadBook(bookId);
      setLoaded(lb);
    } catch (e) { console.error(e); }
  };

  const runStudio = async (action: 'generate_image' | 'generate_audio', targetPageId: string) => {
    setGenBusy({ kind: action === 'generate_image' ? 'image' : 'audio', pageId: targetPageId });
    try {
      const { data, error } = await supabase.functions.invoke('storybook-studio', {
        body: { action, pageId: targetPageId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(action === 'generate_image' ? 'Illustration generated ✓' : 'Narration generated ✓');
      await refreshBook();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Generation failed.');
    } finally {
      setGenBusy(null);
    }
  };

  const generateAllRemaining = async (kind: 'image' | 'audio') => {
    const targets = pages.filter((p) => {
      if (!p.id) return false;
      if (p.page_type === 'comprehension' || p.page_type === 'speaking_checkpoint') return false;
      return kind === 'image' ? !p.illustration_url : !p.audio_url;
    });
    if (!targets.length) {
      toast.info(kind === 'image' ? 'All pages already have images.' : 'All pages already have audio.');
      return;
    }
    setGenBusy({ kind: kind === 'image' ? 'batch-image' : 'batch-audio' });
    setBatchProgress({ done: 0, total: targets.length });
    let okCount = 0;
    // Strictly first → last, one at a time (protects rate limits + voice consistency).
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i];
      try {
        const { data, error } = await supabase.functions.invoke('storybook-studio', {
          body: { action: kind === 'image' ? 'generate_image' : 'generate_audio', pageId: p.id },
        });
        if (error || (data as any)?.error) throw new Error((error as any)?.message || (data as any)?.error);
        okCount++;
      } catch (e: any) {
        console.warn(`${kind} gen failed for`, p.id, e);
        toast.error(`Page ${i + 1}: ${e?.message || 'generation failed'}`);
      }
      setBatchProgress({ done: i + 1, total: targets.length });
      await refreshBook();
    }
    toast.success(`Generated ${okCount}/${targets.length} ${kind === 'image' ? 'illustrations' : 'narrations'} ✓`);
    setGenBusy(null);
    setBatchProgress(null);
  };

  if (!loaded) {
    return <div className="max-w-3xl mx-auto p-8 space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-96 w-full" /></div>;
  }

  // Build vocab targets from book targets + inline definitions across pages.
  const vocabTargets: VocabTarget[] = useMemo(() => {
    if (!loaded) return [];
    const targetWords: string[] = ((loaded.book as any).vocabulary_targets ?? []).filter(Boolean);
    const defMap = new Map<string, { definition?: string; example?: string }>();
    for (const p of loaded.flatPages) {
      const data: any = (p as any).content?.data ?? {};
      const inline = Array.isArray(data.vocab_inline) ? data.vocab_inline : [];
      for (const v of inline) {
        const w = String(v?.word ?? '').trim().toLowerCase();
        if (!w) continue;
        if (!defMap.has(w)) defMap.set(w, { definition: v.definition, example: v.example });
      }
    }
    return targetWords
      .map((w) => {
        const key = String(w).trim().toLowerCase();
        const meta = defMap.get(key);
        return { word: key, definition: meta?.definition, example: meta?.example };
      })
      .filter((t) => !!t.definition);
  }, [loaded]);

  const reinforcementSlot = useMemo(() => {
    if (!loaded || vocabTargets.length < 2) return null;
    const hub = ((loaded.book as any).hub ?? 'academy') as Hub;
    const cefr = ((loaded.book as any).cefr_level ?? (loaded.book as any).cefr ?? 'A1') as Cefr;
    return buildStorybookVocabGamesSlot({
      hub,
      cefr,
      bookId,
      targets: vocabTargets,
    });
  }, [loaded, vocabTargets, bookId]);

  if (completed) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-primary/10 via-background to-background px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <PartyPopper className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">You finished "{loaded.book.title}"!</h1>
            <p className="text-muted-foreground">Your reading was tracked — your tutor will see your progress.</p>
          </div>

          {reinforcementSlot && (
            <div>
              <div className="text-center text-sm font-medium mb-3 text-muted-foreground">
                🎯 Quick vocab check before you go
              </div>
              <VocabGamesSlot
                lessonId={`storybook:${bookId}`}
                hub={reinforcementSlot.hub}
                cefr={reinforcementSlot.cefr}
                targets={reinforcementSlot.targets}
                mode="review"
              />
            </div>
          )}

          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <Button onClick={() => navigate('/library')} size="lg">Back to library</Button>
            <Button variant="ghost" onClick={() => { setCompleted(false); setIndex(0); }}>Read again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return <div className="p-8 text-center text-muted-foreground">This book has no pages yet.</div>;
  }

  const scale = FONT_SCALES[fontScale];

  return (
    <div className="min-h-dvh bg-[hsl(var(--comic-book-bg))] flex flex-col">
      <ReaderChrome
        title={loaded.book.title}
        chapterTitle={page.chapter_title}
        pageIndex={index}
        totalPages={pages.length}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        fontScale={scale}
        onCycleFontScale={() => setFontScale((f) => (f + 1) % FONT_SCALES.length)}
      />

      {studioMode && (
        <div className="w-full bg-primary/5 border-b border-primary/20">
          <div className="max-w-5xl mx-auto px-3 md:px-6 py-2 flex items-center gap-2 flex-wrap text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-primary">
              <Wand2 className="h-4 w-4" /> Studio Mode
            </span>
            <span className="text-muted-foreground text-xs">
              Page {index + 1} · {page.illustration_url ? 'has image' : 'no image'} · {page.audio_url ? 'has audio' : 'no audio'}
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant={page.illustration_url ? 'outline' : 'default'}
              onClick={() => page.id && runStudio('generate_image', page.id)}
              disabled={!page.id || !!genBusy}
            >
              {genBusy?.kind === 'image' && genBusy.pageId === page.id
                ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                : <ImageIcon className="h-4 w-4 mr-1.5" />}
              {page.illustration_url ? 'Regenerate image' : 'Generate image'}
            </Button>
            <Button
              size="sm"
              variant={page.audio_url ? 'outline' : 'default'}
              onClick={() => page.id && runStudio('generate_audio', page.id)}
              disabled={!page.id || !!genBusy}
            >
              {genBusy?.kind === 'audio' && genBusy.pageId === page.id
                ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                : <Volume2 className="h-4 w-4 mr-1.5" />}
              {page.audio_url ? 'Regenerate audio' : 'Generate audio'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => generateAllRemaining('image')}
              disabled={!!genBusy}
            >
              {genBusy?.kind === 'batch-image'
                ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                : <Wand2 className="h-4 w-4 mr-1.5" />}
              {genBusy?.kind === 'batch-image' && batchProgress
                ? `Images ${batchProgress.done}/${batchProgress.total}`
                : 'Generate all images'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => generateAllRemaining('audio')}
              disabled={!!genBusy}
            >
              {genBusy?.kind === 'batch-audio'
                ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                : <Volume2 className="h-4 w-4 mr-1.5" />}
              {genBusy?.kind === 'batch-audio' && batchProgress
                ? `Audio ${batchProgress.done}/${batchProgress.total}`
                : 'Generate all audio'}
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-4 py-4 md:py-6 flex flex-col items-center" style={{ fontSize: `${scale}rem` }}>
        {mediaPending && !studioMode && (
          <div className="mb-3 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium animate-pulse">
            🎨 Illustrations & narration are rendering… pages will refresh automatically.
          </div>
        )}
        <FlipBookViewer
          flipBookRef={flipRef}
          pages={pages}
          startIndex={index}
          muted={muted}
          beginnerAutoplay={beginnerAutoplay}
          onPageFlip={(idx) => setIndex(idx)}
          onVocabLookup={(word) => session.current?.emit({ pageId: page.id ?? '', type: 'vocab_lookup', payload: { word } })}
          onComprehension={(correct) => session.current?.emit({ pageId: page.id ?? '', type: 'comprehension_attempt', payload: { correct } })}
          onSpeakingAttempt={(payload) => session.current?.emit({ pageId: page.id ?? '', type: 'speaking_attempt', payload })}
        />

        <nav className="flex items-center justify-between mt-4 w-full max-w-4xl">
          <Button variant="ghost" onClick={flipPrev} disabled={index === 0}>
            <ChevronLeft className="h-5 w-5 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">{index + 1} / {pages.length}</span>
          {index < pages.length - 1 ? (
            <Button onClick={flipNext}>
              Next <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          ) : (
            <Button onClick={finish}>Finish book <PartyPopper className="h-5 w-5 ml-1" /></Button>
          )}
        </nav>
      </main>
    </div>
  );
}

function countWords(page?: { content?: any }): number {
  if (!page?.content) return 0;
  const data = (page.content as any).data ?? {};
  const txt = (data.text ?? data.prompt ?? data.question ?? '') as string;
  const dlg = Array.isArray(data.lines) ? data.lines.map((l: any) => l.text).join(' ') : '';
  return (`${txt} ${dlg}`).trim().split(/\s+/).filter(Boolean).length;
}
