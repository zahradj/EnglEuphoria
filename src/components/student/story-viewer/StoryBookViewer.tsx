import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  Loader2,
  Square,
  Play,
  Pause,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';

export type StoryLayout = 'classic' | 'immersive';
export type StoryVisualStyle =
  | 'classic'
  | 'comic_western'
  | 'manga_rtl'
  | 'webtoon'
  | 'picture_book'
  | 'comic_spread';

export interface StoryPanel {
  image_prompt?: string;
  image_url?: string;
  imageUrl?: string;
  size?: 'full' | 'wide' | 'tall' | 'square';
  caption?: string;
  dialogue?: Array<{ speaker?: string; text: string }>;
}

export interface StoryPage {
  title?: string;
  text: string;
  imageUrl?: string;
  panels?: StoryPanel[];
  mcq?: {
    question: string;
    options: string[];
    correct_index: number;
  };
}

interface StoryBookViewerProps {
  title: string;
  pages: StoryPage[];
  layout?: StoryLayout;
  visualStyle?: StoryVisualStyle;
  coverImageUrl?: string;
  onExit?: () => void;
  /** When true, viewer fills its parent (absolute) instead of covering the viewport (fixed). */
  embedded?: boolean;
}

/** Outer-shell positioning helper. Embedded mode keeps the viewer inside its
 *  parent so Studio chrome (Save button, sidebar, toolbar) stays interactive. */
const shellPos = (embedded?: boolean) =>
  embedded ? 'absolute inset-0' : 'fixed inset-0 z-50';

const FALLBACK_BG =
  'linear-gradient(135deg, hsl(262 60% 18%), hsl(280 50% 28%), hsl(220 55% 22%))';

const panelImageOf = (p: StoryPanel): string | undefined =>
  p.image_url || p.imageUrl || undefined;

export const StoryBookViewer: React.FC<StoryBookViewerProps> = ({
  title,
  pages,
  layout = 'immersive',
  visualStyle = 'classic',
  coverImageUrl,
  onExit,
  embedded = false,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [mcqAnswered, setMcqAnswered] = useState<Record<number, number>>({});
  const tts = useTextToSpeech();

  const safePages = useMemo(
    () => (Array.isArray(pages) ? pages : []).filter(
      (p) => p && (p.text || p.mcq || (p.panels && p.panels.length > 0)),
    ),
    [pages],
  );
  const total = safePages.length;
  const page = safePages[pageIndex];
  const pageImage = page?.imageUrl || coverImageUrl;

  const isWebtoon = visualStyle === 'webtoon';
  const isComic = visualStyle === 'comic_western';
  const isManga = visualStyle === 'manga_rtl';
  const isPictureBook = visualStyle === 'picture_book';
  const isComicSpread = visualStyle === 'comic_spread';
  const isPaneled = isComic || isManga || isWebtoon || isComicSpread;

  // Stop narration on page change / unmount
  useEffect(() => {
    return () => {
      tts.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  // Keyboard navigation (disabled for webtoon — single scroll, no pagination)
  useEffect(() => {
    if (isWebtoon) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(pageIndex + (isManga ? -1 : 1));
      else if (e.key === 'ArrowLeft') goTo(pageIndex + (isManga ? 1 : -1));
      else if (e.key === 'Escape' && onExit) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, total, isWebtoon, isManga]);

  if (!page) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background text-muted-foreground">
        This story has no pages yet.
      </div>
    );
  }

  const goTo = (next: number) => {
    if (next < 0 || next >= total) return;
    tts.stop();
    setDirection(next > pageIndex ? 1 : -1);
    setPageIndex(next);
  };

  const collectPageNarration = (p: StoryPage): string => {
    if (!p) return '';
    const parts: string[] = [];
    if (p.text) parts.push(p.text);
    if (p.panels) {
      for (const pan of p.panels) {
        if (pan.caption) parts.push(pan.caption);
        if (pan.dialogue) for (const d of pan.dialogue) {
          parts.push(d.speaker ? `${d.speaker} says: ${d.text}` : d.text);
        }
      }
    }
    return parts.join(' ');
  };

  const handlePlayNarration = () => {
    if (tts.isPlaying) {
      tts.stop();
      return;
    }
    const text = collectPageNarration(page);
    if (text) tts.speak(text, { speed: 0.95 });
  };

  // ─── Webtoon: single vertical scroll, no pagination ───
  if (isWebtoon) {
    return (
      <WebtoonScroller
        title={title}
        pages={safePages}
        onExit={onExit}
        ttsLoading={tts.isLoading}
        ttsPlaying={tts.isPlaying}
        onPlay={handlePlayNarration}
        mcqAnswered={mcqAnswered}
        setMcqAnswered={setMcqAnswered}
        embedded={embedded}
      />
    );
  }

  // ─── Picture Book: large image + bottom audio bar (Kids Hub) ───
  if (isPictureBook) {
    return (
      <PictureBookViewer
        title={title}
        pages={safePages}
        pageIndex={pageIndex}
        goTo={goTo}
        onExit={onExit}
        ttsLoading={tts.isLoading}
        ttsPlaying={tts.isPlaying}
        onPlay={handlePlayNarration}
        mcqAnswered={mcqAnswered}
        setMcqAnswered={setMcqAnswered}
        embedded={embedded}
      />
    );
  }

  // ─── Comic Spread: two-page side-by-side spread (Academy Hub) ───
  if (isComicSpread) {
    return (
      <ComicSpreadViewer
        title={title}
        pages={safePages}
        pageIndex={pageIndex}
        goTo={goTo}
        onExit={onExit}
        ttsLoading={tts.isLoading}
        ttsPlaying={tts.isPlaying}
        onPlay={handlePlayNarration}
        mcqAnswered={mcqAnswered}
        setMcqAnswered={setMcqAnswered}
        embedded={embedded}
      />
    );
  }

  const isImmersive = layout === 'immersive' && !isPaneled;

  return (
    <div
      className={cn(shellPos(embedded), 'overflow-hidden')}
      style={{
        background:
          isImmersive && pageImage
            ? undefined
            : isManga
            ? '#0a0a0a'
            : isComic
            ? 'radial-gradient(circle at 30% 20%, #1e293b, #020617)'
            : FALLBACK_BG,
      }}
    >
      {/* Immersive (classic style only): full-bleed background image with Ken Burns */}
      {isImmersive && pageImage && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${pageIndex}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pageImage})` }}
          />
        </AnimatePresence>
      )}
      {isImmersive && pageImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 pointer-events-none" />
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
            {isComic ? 'Comic' : isManga ? '漫画 · Manga' : 'Story'}
          </span>
          <span className="hidden sm:block text-sm font-semibold text-white/90 truncate max-w-md">
            {title}
          </span>
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 transition-colors"
            aria-label="Exit story"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Page dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
        {safePages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === pageIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60',
            )}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>

      {/* Edge arrows — for manga, swap left/right meanings */}
      <button
        onClick={() => goTo(pageIndex + (isManga ? 1 : -1))}
        disabled={isManga ? pageIndex === total - 1 : pageIndex === 0}
        className={cn(
          'group absolute left-0 top-0 bottom-0 z-20 w-16 sm:w-24 flex items-center justify-center',
          'disabled:opacity-0 disabled:pointer-events-none transition-opacity',
        )}
        aria-label={isManga ? 'Next page (manga RTL)' : 'Previous page'}
      >
        <span className="rounded-full bg-white/10 group-hover:bg-white/25 backdrop-blur-md p-3 transition-all group-hover:-translate-x-0.5">
          <ChevronLeft className="w-6 h-6 text-white" />
        </span>
      </button>
      <button
        onClick={() => goTo(pageIndex + (isManga ? -1 : 1))}
        disabled={isManga ? pageIndex === 0 : pageIndex === total - 1}
        className={cn(
          'group absolute right-0 top-0 bottom-0 z-20 w-16 sm:w-24 flex items-center justify-center',
          'disabled:opacity-0 disabled:pointer-events-none transition-opacity',
        )}
        aria-label={isManga ? 'Previous page (manga RTL)' : 'Next page'}
      >
        <span className="rounded-full bg-white/10 group-hover:bg-white/25 backdrop-blur-md p-3 transition-all group-hover:translate-x-0.5">
          <ChevronRight className="w-6 h-6 text-white" />
        </span>
      </button>

      {/* Page content with crossfade + slide */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={pageIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-10 flex"
        >
          {isComic || isManga ? (
            <ComicPage
              page={page}
              pageIndex={pageIndex}
              total={total}
              monochrome={isManga}
              rtl={isManga}
              ttsLoading={tts.isLoading}
              ttsPlaying={tts.isPlaying}
              onPlay={handlePlayNarration}
              mcqAnswered={mcqAnswered}
              setMcqAnswered={setMcqAnswered}
            />
          ) : isImmersive ? (
            <ImmersiveCard
              page={page}
              pageIndex={pageIndex}
              total={total}
              ttsLoading={tts.isLoading}
              ttsPlaying={tts.isPlaying}
              onPlay={handlePlayNarration}
              mcqAnswered={mcqAnswered}
              setMcqAnswered={setMcqAnswered}
            />
          ) : (
            <ClassicSplit
              page={page}
              pageImage={pageImage}
              pageIndex={pageIndex}
              total={total}
              ttsLoading={tts.isLoading}
              ttsPlaying={tts.isPlaying}
              onPlay={handlePlayNarration}
              mcqAnswered={mcqAnswered}
              setMcqAnswered={setMcqAnswered}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Sub-layouts
// ────────────────────────────────────────────────────────────────────────

interface SubProps {
  page: StoryPage;
  pageIndex: number;
  total: number;
  ttsLoading: boolean;
  ttsPlaying: boolean;
  onPlay: () => void;
  mcqAnswered: Record<number, number>;
  setMcqAnswered: React.Dispatch<React.SetStateAction<Record<number, number>>>;
}

const NarrationButton: React.FC<{
  loading: boolean;
  playing: boolean;
  onClick: () => void;
  variant?: 'light' | 'dark';
}> = ({ loading, playing, onClick, variant = 'dark' }) => {
  const Icon = loading ? Loader2 : playing ? Square : Volume2;
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        'rounded-full font-semibold gap-2 shadow-lg',
        variant === 'dark'
          ? 'bg-white text-slate-900 hover:bg-white/90'
          : 'bg-slate-900 text-white hover:bg-slate-800',
      )}
    >
      <Icon className={cn('w-5 h-5', loading && 'animate-spin')} />
      {loading ? 'Loading…' : playing ? 'Stop' : 'Play Narration'}
    </Button>
  );
};

const McqBlock: React.FC<{
  pageIndex: number;
  mcq: NonNullable<StoryPage['mcq']>;
  answered: number | undefined;
  onAnswer: (i: number) => void;
  variant: 'light' | 'dark';
}> = ({ mcq, answered, onAnswer, variant }) => (
  <div className="space-y-3 mt-4">
    <p className={cn('text-sm font-bold', variant === 'dark' ? 'text-white' : 'text-slate-900')}>
      {mcq.question}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {mcq.options.map((opt, i) => {
        const picked = answered === i;
        const correct = answered != null && i === mcq.correct_index;
        const wrong = picked && i !== mcq.correct_index;
        return (
          <button
            key={i}
            onClick={() => answered == null && onAnswer(i)}
            disabled={answered != null}
            className={cn(
              'text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
              variant === 'dark'
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50',
              correct && 'bg-emerald-500/90 border-emerald-300 text-white',
              wrong && 'bg-rose-500/90 border-rose-300 text-white',
              answered != null && !picked && !correct && 'opacity-60',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Speech bubble (overlaid on a panel image) ───
const BUBBLE_POSITIONS = [
  'top-3 left-3',
  'bottom-3 right-3',
  'top-3 right-3',
  'bottom-3 left-3',
];

const SpeechBubble: React.FC<{
  speaker?: string;
  text: string;
  index: number;
  variant: 'comic' | 'manga';
}> = ({ speaker, text, index, variant }) => {
  const pos = BUBBLE_POSITIONS[index % BUBBLE_POSITIONS.length];
  return (
    <div
      className={cn(
        'absolute z-20 max-w-[60%] px-3 py-2 rounded-2xl shadow-md text-slate-900',
        variant === 'comic'
          ? 'bg-white border-2 border-slate-900 font-semibold'
          : 'bg-white border border-slate-800 font-medium',
        pos,
      )}
      style={{ fontFamily: variant === 'comic' ? "'Comic Neue', 'Bangers', system-ui" : "'Bangers', system-ui" }}
    >
      {speaker ? (
        <span className="block text-[10px] uppercase tracking-wider text-rose-600 font-bold mb-0.5">
          {speaker}
        </span>
      ) : null}
      <span className="text-sm leading-snug">{text}</span>
    </div>
  );
};

const sizeToSpan = (size?: StoryPanel['size']): string => {
  switch (size) {
    case 'full': return 'col-span-6 row-span-2';
    case 'wide': return 'col-span-4 row-span-1';
    case 'tall': return 'col-span-2 row-span-2';
    default:     return 'col-span-3 row-span-1';
  }
};

// ─── Comic / Manga page (multi-panel CSS grid) ───
const ComicPage: React.FC<SubProps & { monochrome: boolean; rtl: boolean }> = ({
  page,
  pageIndex,
  total,
  monochrome,
  rtl,
  ttsLoading,
  ttsPlaying,
  onPlay,
  mcqAnswered,
  setMcqAnswered,
}) => {
  // Synthesize a single panel from page text + image when AI returned no panel array
  const panels: StoryPanel[] = (page.panels && page.panels.length > 0)
    ? page.panels
    : page.imageUrl
      ? [{ image_url: page.imageUrl, size: 'full', caption: page.text }]
      : [];

  return (
    <div className="relative w-full h-full overflow-y-auto px-4 sm:px-8 py-16 sm:py-20">
      <div
        className="max-w-5xl mx-auto grid grid-cols-6 auto-rows-[140px] sm:auto-rows-[180px] gap-3 sm:gap-4 grid-flow-row-dense"
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {panels.map((panel, i) => {
          const img = panelImageOf(panel);
          return (
            <div
              key={i}
              className={cn(
                'relative overflow-hidden rounded-lg border-2 bg-slate-200',
                monochrome ? 'border-slate-100' : 'border-slate-900',
                sizeToSpan(panel.size),
              )}
            >
              {img ? (
                <img
                  src={img}
                  alt={panel.caption || `Panel ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={monochrome ? { filter: 'grayscale(1) contrast(1.1)' } : undefined}
                  dir="ltr"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono p-3 text-center">
                  {panel.image_prompt || 'Illustration loading…'}
                </div>
              )}

              {/* Caption box (bottom narration band) */}
              {panel.caption && (
                <div
                  dir={rtl ? 'rtl' : 'ltr'}
                  className={cn(
                    'absolute left-2 right-2 bottom-2 z-10 px-3 py-1.5 rounded text-xs font-bold',
                    monochrome
                      ? 'bg-slate-100 text-slate-900 border border-slate-900'
                      : 'bg-amber-100 text-slate-900 border-2 border-slate-900',
                  )}
                  style={{ fontFamily: "'Bangers', 'Impact', system-ui" }}
                >
                  {panel.caption}
                </div>
              )}

              {/* Speech bubbles */}
              {Array.isArray(panel.dialogue) &&
                panel.dialogue.slice(0, 4).map((d, j) => (
                  <div dir={rtl ? 'rtl' : 'ltr'} key={j}>
                    <SpeechBubble
                      speaker={d.speaker}
                      text={d.text}
                      index={j}
                      variant={monochrome ? 'manga' : 'comic'}
                    />
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* Comprehension MCQ */}
      {page.mcq && (
        <div className="max-w-3xl mx-auto mt-8 rounded-2xl bg-white/95 dark:bg-slate-900/90 p-6 backdrop-blur-md border border-slate-200 dark:border-slate-700">
          <McqBlock
            pageIndex={pageIndex}
            mcq={page.mcq}
            answered={mcqAnswered[pageIndex]}
            onAnswer={(i) => setMcqAnswered((prev) => ({ ...prev, [pageIndex]: i }))}
            variant="light"
          />
        </div>
      )}

      {/* Bottom action bar */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mt-6 px-2">
        <NarrationButton
          loading={ttsLoading}
          playing={ttsPlaying}
          onClick={onPlay}
          variant="dark"
        />
        <span className="text-xs font-semibold tracking-wider text-white/70">
          {rtl ? `${total - pageIndex} / ${total}` : `${pageIndex + 1} / ${total}`}
        </span>
      </div>
    </div>
  );
};

// ─── Webtoon: single vertical scroll, no pagination ───
const WebtoonScroller: React.FC<{
  title: string;
  pages: StoryPage[];
  onExit?: () => void;
  ttsLoading: boolean;
  ttsPlaying: boolean;
  onPlay: () => void;
  mcqAnswered: Record<number, number>;
  setMcqAnswered: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  embedded?: boolean;
}> = ({ title, pages, onExit, ttsLoading, ttsPlaying, onPlay, mcqAnswered, setMcqAnswered, embedded }) => {
  // Flatten all panels from all pages into one continuous column.
  const allPanels: Array<{ pageIdx: number; panel: StoryPanel }> = [];
  pages.forEach((p, pageIdx) => {
    if (p.panels && p.panels.length > 0) {
      p.panels.forEach((panel) => allPanels.push({ pageIdx, panel }));
    } else if (p.imageUrl || p.text) {
      allPanels.push({
        pageIdx,
        panel: { image_url: p.imageUrl, caption: p.text, size: 'wide' },
      });
    }
  });

  return (
    <div className={cn(shellPos(embedded), 'overflow-y-auto bg-slate-950')}>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/70 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">Webtoon</span>
          <span className="text-sm font-semibold text-white/90 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <NarrationButton
            loading={ttsLoading}
            playing={ttsPlaying}
            onClick={onPlay}
            variant="dark"
          />
          {onExit && (
            <button
              onClick={onExit}
              className="rounded-full bg-white/10 hover:bg-white/20 p-2 transition-colors"
              aria-label="Exit story"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Continuous vertical column */}
      <div className="max-w-md mx-auto flex flex-col">
        {allPanels.map(({ panel }, i) => {
          const img = panelImageOf(panel);
          return (
            <div key={i} className="relative w-full bg-slate-900">
              {img ? (
                <img
                  src={img}
                  alt={panel.caption || `Panel ${i + 1}`}
                  className="block w-full h-auto"
                />
              ) : (
                <div className="aspect-[4/5] flex items-center justify-center text-slate-400 text-xs font-mono p-6 text-center">
                  {panel.image_prompt || 'Illustration loading…'}
                </div>
              )}
              {/* Speech bubbles */}
              {Array.isArray(panel.dialogue) &&
                panel.dialogue.slice(0, 4).map((d, j) => (
                  <SpeechBubble
                    key={j}
                    speaker={d.speaker}
                    text={d.text}
                    index={j}
                    variant="comic"
                  />
                ))}
              {/* Caption */}
              {panel.caption && (
                <div className="px-4 py-3 text-sm text-white/90 bg-slate-900 border-t border-white/5">
                  {panel.caption}
                </div>
              )}
            </div>
          );
        })}

        {/* Comprehension at the very end (uses last page's mcq if present) */}
        {pages.map((p, idx) => p.mcq ? (
          <div key={`mcq-${idx}`} className="rounded-2xl bg-white/95 m-4 p-6">
            <McqBlock
              pageIndex={idx}
              mcq={p.mcq}
              answered={mcqAnswered[idx]}
              onAnswer={(i) => setMcqAnswered((prev) => ({ ...prev, [idx]: i }))}
              variant="light"
            />
          </div>
        ) : null)}

        <div className="h-24" />
      </div>
    </div>
  );
};

const ImmersiveCard: React.FC<SubProps> = ({
  page,
  pageIndex,
  total,
  ttsLoading,
  ttsPlaying,
  onPlay,
  mcqAnswered,
  setMcqAnswered,
}) => (
  <div className="relative w-full h-full flex items-end justify-center px-4 sm:px-12 pb-10 sm:pb-16">
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="w-full max-w-3xl rounded-3xl bg-black/45 backdrop-blur-xl border border-white/15 shadow-2xl p-6 sm:p-8 text-white"
    >
      {page.title && (
        <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-white/60 mb-3">
          {page.title}
        </h3>
      )}
      <p className="text-lg sm:text-xl leading-relaxed font-medium text-white/95 whitespace-pre-line">
        {page.text}
      </p>

      {page.mcq && (
        <McqBlock
          pageIndex={pageIndex}
          mcq={page.mcq}
          answered={mcqAnswered[pageIndex]}
          onAnswer={(i) => setMcqAnswered((prev) => ({ ...prev, [pageIndex]: i }))}
          variant="dark"
        />
      )}

      <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/15">
        <NarrationButton
          loading={ttsLoading}
          playing={ttsPlaying}
          onClick={onPlay}
          variant="dark"
        />
        <span className="text-xs font-semibold tracking-wider text-white/60">
          {pageIndex + 1} / {total}
        </span>
      </div>
    </motion.div>
  </div>
);

const ClassicSplit: React.FC<SubProps & { pageImage?: string }> = ({
  page,
  pageImage,
  pageIndex,
  total,
  ttsLoading,
  ttsPlaying,
  onPlay,
  mcqAnswered,
  setMcqAnswered,
}) => (
  <div className="relative w-full h-full flex flex-col md:flex-row bg-[#fdfbf6]">
    <div className="relative w-full md:w-1/2 h-1/3 md:h-full bg-slate-200 overflow-hidden">
      {pageImage ? (
        <img
          src={pageImage}
          alt={page.title || `Page ${pageIndex + 1}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
          No illustration
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent md:bg-none" />
    </div>

    <div className="relative w-full md:w-1/2 h-2/3 md:h-full flex flex-col justify-center px-8 sm:px-14 py-10 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full">
        {page.title && (
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-4">
            {page.title}
          </h3>
        )}
        <p
          className="text-xl sm:text-2xl leading-[1.7] text-slate-800 whitespace-pre-line"
          style={{ fontFamily: "'Lora', 'Georgia', serif" }}
        >
          {page.text}
        </p>

        {page.mcq && (
          <McqBlock
            pageIndex={pageIndex}
            mcq={page.mcq}
            answered={mcqAnswered[pageIndex]}
            onAnswer={(i) => setMcqAnswered((prev) => ({ ...prev, [pageIndex]: i }))}
            variant="light"
          />
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <NarrationButton
            loading={ttsLoading}
            playing={ttsPlaying}
            onClick={onPlay}
            variant="light"
          />
          <span className="text-xs font-semibold tracking-wider text-slate-400">
            Page {pageIndex + 1} of {total}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────
// PICTURE BOOK VIEWER (Kids Hub)
// Full-screen image, top blue header, sticky bottom audio bar.
// ────────────────────────────────────────────────────────────────────────
interface BookViewerProps {
  title: string;
  pages: StoryPage[];
  pageIndex: number;
  goTo: (n: number) => void;
  onExit?: () => void;
  ttsLoading: boolean;
  ttsPlaying: boolean;
  onPlay: () => void;
  mcqAnswered: Record<number, number>;
  setMcqAnswered: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  embedded?: boolean;
}

const PictureBookViewer: React.FC<BookViewerProps> = ({
  title,
  pages,
  pageIndex,
  goTo,
  onExit,
  ttsLoading,
  ttsPlaying,
  onPlay,
  mcqAnswered,
  setMcqAnswered,
  embedded,
}) => {
  const total = pages.length;
  const page = pages[pageIndex];
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Animate progress bar while narration plays (UI only — TTS has no real position)
  useEffect(() => {
    if (!ttsPlaying) {
      setProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const start = performance.now();
    const estDuration = Math.max(4000, (page?.text?.length || 80) * 55);
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / estDuration) * 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ttsPlaying, pageIndex, page?.text]);

  return (
    <div
      className={cn(shellPos(embedded), 'flex flex-col bg-sky-50')}
      style={{ fontFamily: "'Quicksand', 'Comic Neue', 'Comic Sans MS', system-ui" }}
    >
      {/* Top blue header bar */}
      <header className="relative flex items-center justify-between px-4 sm:px-6 py-3 bg-sky-500 text-white shadow-md z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-extrabold tracking-[0.2em] uppercase opacity-90">
            Picture Book
          </span>
          <span className="hidden sm:block text-sm font-bold truncate max-w-md">
            {title}
          </span>
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="rounded-full bg-white/20 hover:bg-white/30 p-2 transition-colors"
            aria-label="Close reader"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </header>

      {/* Main content area */}
      <main className="relative flex-1 overflow-hidden flex flex-col">
        {/* Image fills the area */}
        <div className="relative flex-1 flex items-center justify-center bg-white p-4 sm:p-8">
          {page?.imageUrl ? (
            <img
              src={page.imageUrl}
              alt={page.title || `Page ${pageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-xl"
            />
          ) : (
            <div className="w-full max-w-2xl aspect-[4/3] rounded-2xl bg-sky-100 border-4 border-dashed border-sky-300 flex items-center justify-center text-sky-500 font-bold">
              Illustration loading…
            </div>
          )}

          {/* Story text overlay near top */}
          {page?.text && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 max-w-[88%] sm:max-w-2xl">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-5 py-4 border-2 border-sky-200">
                <p className="text-lg sm:text-2xl leading-snug font-bold text-slate-800 text-center whitespace-pre-line">
                  {page.text}
                </p>
              </div>
            </div>
          )}

          {/* Edge nav zones */}
          <button
            onClick={() => goTo(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="group absolute left-0 top-0 bottom-0 w-16 sm:w-24 flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Previous page"
          >
            <span className="rounded-full bg-sky-500/90 group-hover:bg-sky-600 text-white p-3 shadow-lg transition-all">
              <ChevronLeft className="w-7 h-7" />
            </span>
          </button>
          <button
            onClick={() => goTo(pageIndex + 1)}
            disabled={pageIndex === total - 1}
            className="group absolute right-0 top-0 bottom-0 w-16 sm:w-24 flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Next page"
          >
            <span className="rounded-full bg-sky-500/90 group-hover:bg-sky-600 text-white p-3 shadow-lg transition-all">
              <ChevronRight className="w-7 h-7" />
            </span>
          </button>
        </div>

        {/* MCQ if present */}
        {page?.mcq && (
          <div className="px-4 sm:px-8 pb-4">
            <div className="max-w-2xl mx-auto rounded-2xl bg-white p-5 shadow border-2 border-sky-200">
              <McqBlock
                pageIndex={pageIndex}
                mcq={page.mcq}
                answered={mcqAnswered[pageIndex]}
                onAnswer={(i) => setMcqAnswered((prev) => ({ ...prev, [pageIndex]: i }))}
                variant="light"
              />
            </div>
          </div>
        )}
      </main>

      {/* Bottom sticky audio bar */}
      <footer className="relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-white border-t-2 border-sky-100 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-20">
        <button
          onClick={onPlay}
          disabled={ttsLoading}
          className={cn(
            'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all',
            'bg-emerald-500 hover:bg-emerald-600 active:scale-95',
            ttsLoading && 'opacity-70 cursor-wait',
          )}
          aria-label={ttsPlaying ? 'Pause narration' : 'Play narration'}
        >
          {ttsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : ttsPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Progress slider */}
        <div className="flex-1 h-2 bg-sky-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Page indicator */}
        <span className="flex-shrink-0 text-xs sm:text-sm font-extrabold tracking-wider text-sky-700 uppercase">
          Page {pageIndex + 1} of {total}
        </span>

        <button
          className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center text-sky-700 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// COMIC SPREAD VIEWER (Academy Hub)
// Two-page side-by-side spread on desktop, stacked on mobile.
// ────────────────────────────────────────────────────────────────────────
const ComicSpreadViewer: React.FC<BookViewerProps> = ({
  title,
  pages,
  pageIndex,
  goTo,
  onExit,
  ttsLoading,
  ttsPlaying,
  onPlay,
  mcqAnswered,
  setMcqAnswered,
  embedded,
}) => {
  const total = pages.length;
  // Spread = current page + next page (snap to even indices)
  const leftIdx = pageIndex - (pageIndex % 2);
  const rightIdx = leftIdx + 1;
  const leftPage = pages[leftIdx];
  const rightPage = rightIdx < total ? pages[rightIdx] : undefined;

  const goSpread = (dir: 1 | -1) => {
    const next = leftIdx + dir * 2;
    if (next < 0 || next >= total) return;
    goTo(next);
  };

  return (
    <div className={cn(shellPos(embedded), 'flex flex-col bg-slate-900')}>
      {/* Top blue header bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-sky-600 text-white shadow-md z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-extrabold tracking-[0.2em] uppercase opacity-90">
            Comic
          </span>
          <span className="hidden sm:block text-sm font-bold truncate max-w-md">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPlay}
            disabled={ttsLoading}
            className="rounded-full bg-white/20 hover:bg-white/30 p-2 transition-colors"
            aria-label="Play narration"
          >
            {ttsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : ttsPlaying ? (
              <Square className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="rounded-full bg-white/20 hover:bg-white/30 p-2 transition-colors"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Two-page spread */}
      <main className="relative flex-1 overflow-hidden flex items-stretch justify-center bg-gradient-to-b from-slate-800 to-slate-950 p-3 sm:p-6">
        <div className="relative w-full max-w-7xl flex flex-col md:flex-row items-stretch gap-0 bg-amber-50 rounded-lg shadow-2xl overflow-hidden">
          {/* Binding shadow on desktop */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-slate-900/30 shadow-[0_0_20px_rgba(0,0,0,0.4)] z-10 pointer-events-none" />

          <ComicSpreadPage page={leftPage} pageNumber={leftIdx + 1} />
          {rightPage ? (
            <ComicSpreadPage page={rightPage} pageNumber={rightIdx + 1} />
          ) : (
            <div className="hidden md:flex w-1/2 items-center justify-center text-slate-400 text-sm font-mono">
              — End —
            </div>
          )}
        </div>

        {/* Edge nav zones */}
        <button
          onClick={() => goSpread(-1)}
          disabled={leftIdx === 0}
          className="group absolute left-0 top-0 bottom-0 w-12 sm:w-20 flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none z-20"
          aria-label="Previous spread"
        >
          <span className="rounded-full bg-white/10 group-hover:bg-white/25 backdrop-blur-md p-3 transition-all">
            <ChevronLeft className="w-6 h-6 text-white" />
          </span>
        </button>
        <button
          onClick={() => goSpread(1)}
          disabled={leftIdx + 2 >= total}
          className="group absolute right-0 top-0 bottom-0 w-12 sm:w-20 flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none z-20"
          aria-label="Next spread"
        >
          <span className="rounded-full bg-white/10 group-hover:bg-white/25 backdrop-blur-md p-3 transition-all">
            <ChevronRight className="w-6 h-6 text-white" />
          </span>
        </button>
      </main>

      {/* MCQ on the active spread, if present */}
      {(leftPage?.mcq || rightPage?.mcq) && (
        <div className="px-4 sm:px-6 pb-3 bg-slate-900">
          <div className="max-w-3xl mx-auto rounded-2xl bg-white p-5 shadow">
            {(() => {
              const idx = leftPage?.mcq ? leftIdx : rightIdx;
              const mcq = leftPage?.mcq || rightPage?.mcq!;
              return (
                <McqBlock
                  pageIndex={idx}
                  mcq={mcq}
                  answered={mcqAnswered[idx]}
                  onAnswer={(i) => setMcqAnswered((prev) => ({ ...prev, [idx]: i }))}
                  variant="light"
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Footer page indicator */}
      <footer className="flex items-center justify-center px-6 py-2 bg-slate-950 text-slate-300 text-xs font-bold tracking-widest uppercase border-t border-white/5">
        Pages {leftIdx + 1}{rightPage ? `–${rightIdx + 1}` : ''} of {total}
      </footer>
    </div>
  );
};

const ComicSpreadPage: React.FC<{ page?: StoryPage; pageNumber: number }> = ({
  page,
  pageNumber,
}) => {
  if (!page) return <div className="w-full md:w-1/2" />;
  const panels: StoryPanel[] = (page.panels && page.panels.length > 0)
    ? page.panels
    : page.imageUrl
      ? [{ image_url: page.imageUrl, size: 'full', caption: page.text }]
      : page.text
        ? [{ caption: page.text, size: 'full' }]
        : [];

  return (
    <div className="relative w-full md:w-1/2 bg-amber-50 p-3 sm:p-5 flex flex-col">
      <div className="flex-1 grid grid-cols-6 auto-rows-[120px] sm:auto-rows-[160px] gap-2 sm:gap-3 grid-flow-row-dense">
        {panels.map((panel, i) => {
          const img = panelImageOf(panel);
          return (
            <div
              key={i}
              className={cn(
                'relative overflow-hidden bg-white border-[3px] border-slate-900 shadow-[3px_3px_0_rgba(0,0,0,0.85)]',
                sizeToSpan(panel.size),
              )}
            >
              {img ? (
                <img
                  src={img}
                  alt={panel.caption || `Panel ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono p-3 text-center">
                  {panel.image_prompt || panel.caption || 'Panel'}
                </div>
              )}

              {panel.caption && (
                <div
                  className="absolute left-1.5 right-1.5 bottom-1.5 z-10 px-2 py-1 rounded text-[11px] sm:text-xs font-bold bg-amber-100 text-slate-900 border-2 border-slate-900"
                  style={{ fontFamily: "'Bangers', 'Impact', system-ui" }}
                >
                  {panel.caption}
                </div>
              )}

              {Array.isArray(panel.dialogue) &&
                panel.dialogue.slice(0, 4).map((d, j) => (
                  <ComicSpeechBubble
                    key={j}
                    speaker={d.speaker}
                    text={d.text}
                    index={j}
                  />
                ))}
            </div>
          );
        })}
      </div>
      <div className="text-center text-[10px] font-bold text-slate-500 tracking-widest uppercase pt-2">
        — {pageNumber} —
      </div>
    </div>
  );
};

// Speech bubble with a small "tail" for the comic spread
const ComicSpeechBubble: React.FC<{
  speaker?: string;
  text: string;
  index: number;
}> = ({ speaker, text, index }) => {
  const positions = [
    { pos: 'top-2 left-2', tail: 'left-4 -bottom-2 border-t-white' },
    { pos: 'top-2 right-2', tail: 'right-4 -bottom-2 border-t-white' },
    { pos: 'bottom-10 left-2', tail: 'left-4 -bottom-2 border-t-white' },
    { pos: 'bottom-10 right-2', tail: 'right-4 -bottom-2 border-t-white' },
  ];
  const { pos, tail } = positions[index % positions.length];
  return (
    <div
      className={cn(
        'absolute z-20 max-w-[65%] px-3 py-1.5 rounded-2xl bg-white border-[2.5px] border-slate-900 shadow-md',
        pos,
      )}
      style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', system-ui" }}
    >
      {speaker && (
        <span className="block text-[9px] uppercase tracking-wider text-rose-600 font-extrabold mb-0.5">
          {speaker}
        </span>
      )}
      <span className="text-[12px] leading-snug font-semibold text-slate-900">{text}</span>
      {/* tail */}
      <span
        className={cn(
          'absolute w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px]',
          tail,
        )}
      />
    </div>
  );
};

export default StoryBookViewer;
