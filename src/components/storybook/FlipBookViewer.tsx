import { forwardRef, useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { StorybookPage } from '@/storybook/types';
import { PageRenderer } from './PageRenderer';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface Props {
  pages: Array<StorybookPage & { chapter_title?: string }>;
  startIndex?: number;
  muted: boolean;
  beginnerAutoplay: boolean;
  onPageFlip?: (index: number, page: StorybookPage | undefined) => void;
  onVocabLookup?: (word: string) => void;
  onComprehension?: (correct: boolean) => void;
  onSpeakingAttempt?: (payload: Record<string, unknown>) => void;
  flipBookRef?: React.MutableRefObject<any>;
}

// react-pageflip requires each page to be a forwardRef'd DOM element.
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div ref={ref} className="bg-[hsl(var(--comic-paper-bg))] overflow-hidden">
    <div className="w-full h-full p-1 md:p-2">{children}</div>
  </div>
));
Page.displayName = 'FlipPage';

const FLIP_SFX = '/audio/paper-flip.mp3';

export function FlipBookViewer({
  pages,
  startIndex = 0,
  muted,
  beginnerAutoplay,
  onPageFlip,
  onVocabLookup,
  onComprehension,
  onSpeakingAttempt,
  flipBookRef,
}: Props) {
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const pageAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Measure container for responsive flipbook — use the available viewport so
  // illustrations have room to breathe instead of being compressed into a small frame.
  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth - 24, 1280);
      const h = Math.min(window.innerHeight - 140, 820);
      setSize({ w, h });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const playSfx = () => {
    if (muted) return;
    try {
      if (!sfxRef.current) sfxRef.current = new Audio(FLIP_SFX);
      sfxRef.current.currentTime = 0;
      void sfxRef.current.play().catch(() => {});
    } catch { /* noop */ }
  };

  const playPageAudio = (page?: StorybookPage) => {
    pageAudioRef.current?.pause();
    pageAudioRef.current = null;
    if (!page?.audio_url || muted) return;
    const a = new Audio(page.audio_url);
    pageAudioRef.current = a;
    void a.play().catch(() => {});
  };

  const handleFlip = (e: { data: number }) => {
    const idx = e.data;
    setCurrentIdx(idx);
    playSfx();
    const page = pages[idx];
    onPageFlip?.(idx, page);
    if (beginnerAutoplay) playPageAudio(page);
  };

  useEffect(() => () => { pageAudioRef.current?.pause(); }, []);

  if (!size.w) return null;

  // Mobile: single page width = full width; Desktop: spread = width / 2 per leaf
  const isMobile = size.w < 768;
  const pageW = isMobile ? size.w : Math.floor(size.w / 2);
  const pageH = size.h;

  const currentPage = pages[currentIdx];
  const showListen = !beginnerAutoplay && !!currentPage?.audio_url;

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* @ts-expect-error HTMLFlipBook typing is loose */}
      <HTMLFlipBook
        ref={flipBookRef}
        width={pageW}
        height={pageH}
        size="stretch"
        minWidth={320}
        maxWidth={960}
        minHeight={480}
        maxHeight={1100}
        maxShadowOpacity={0.5}
        showCover={false}
        mobileScrollSupport
        usePortrait={isMobile}
        drawShadow
        onFlip={handleFlip}
        className="storybook-flipbook"
        style={{}}
        startPage={startIndex}
        flippingTime={650}
        useMouseEvents
        clickEventForward
        swipeDistance={30}
        showPageCorners
        disableFlipByClick={false}
      >
        {pages.map((p, i) => (
          <Page key={p.id ?? i}>
            <PageRenderer
              page={p}
              onVocabLookup={onVocabLookup}
              onComprehension={onComprehension}
              onSpeakingAttempt={onSpeakingAttempt}
            />
          </Page>
        ))}
      </HTMLFlipBook>

      {showListen && (
        <Button
          variant="secondary"
          size="lg"
          onClick={() => playPageAudio(currentPage)}
          className="absolute bottom-4 right-4 z-30 rounded-full backdrop-blur bg-background/80 hover:bg-background border-2 border-[hsl(var(--comic-caption-border))] shadow-lg"
          aria-label="Listen to this page"
        >
          <Volume2 className="h-5 w-5 mr-2" />
          Listen
        </Button>
      )}
    </div>
  );
}
