/**
 * Renders a `mode: 'presentation'` UnifiedMoment — the PPP-style beats
 * (intro, vocab/phonics discovery, storybook, reward summary) using the
 * existing 9 LessonBlock kinds from src/game-runtime/engine/types.ts.
 *
 * True Pre-A1 beginners often can't reliably decode English text yet — a
 * page of written vocabulary/story content isn't accessible on its own. So
 * every text block gets a "hear it" speaker button (usePlaygroundAudio's
 * playVoice, the same static-cache-with-live-fallback hook every other
 * Playground game already uses) — nothing here is text-only.
 *
 * When the moment carries a `sceneImageUrl` (or its intro block carries the
 * older `heroImageUrl`), the whole moment renders as a full-bleed
 * illustrated scene — matching Playground's per-scene illustrated
 * richness — with light content cards floating over it. Without an image,
 * it's plain light cards on white, keeping focus on the content.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';
import type { UnifiedMoment } from '@/unified-lessons/types';
import { useHubTheme } from './HubTheme';
import { NavFooter } from './NavFooter';
import logoWhite from '@/assets/logo-white.png';

function HearButton({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
  const { playVoice } = usePlaygroundAudio();
  const dim = size === 'sm' ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base';
  return (
    <button
      type="button"
      onClick={() => playVoice(text)}
      aria-label={`Hear: ${text}`}
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full text-white shadow ${dim}`}
      style={{ backgroundColor: 'var(--unified-accent)' }}
    >
      🔊
    </button>
  );
}

/**
 * Isolated phonics sounds must ONLY ever play the real recorded clip —
 * never a live ElevenLabs fallback. A live TTS engine reading a raw phoneme
 * in isolation mispronounces it unpredictably, which teaches the wrong
 * sound. So unlike HearButton, this plays a literal <audio> file and does
 * nothing at all if the block has no recorded `audio` yet.
 */
function PhonicsHearButton({ src, label }: { src?: string; label: string }) {
  if (!src) return null;
  return (
    <button
      type="button"
      onClick={() => new Audio(src).play().catch(() => {})}
      aria-label={`Hear the sound: ${label}`}
      className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white shadow"
      style={{ backgroundColor: 'var(--unified-accent)' }}
    >
      🔊
    </button>
  );
}

function BlockView({ block, hasScene }: { block: UnifiedMoment['blocks'][number]; hasScene: boolean }) {
  switch (block.type) {
    case 'intro':
      // A cover-page treatment, not a card: logo + "Unit · Lesson" kicker +
      // title only, sitting directly on the illustration so the scene
      // reads clearly instead of being boxed off. White text needs the
      // photo backdrop, so it only applies when a scene image is present.
      return hasScene ? (
        <div className="text-center">
          <img src={logoWhite} alt="EnglEuphoria" className="mx-auto h-9 w-auto drop-shadow-lg sm:h-10" />
          {block.kicker && (
            <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-md">{block.kicker}</p>
          )}
          <div className="mt-2 flex items-center justify-center gap-3">
            <h1 className="text-4xl font-black text-white drop-shadow-lg sm:text-5xl">{block.title}</h1>
            <HearButton text={block.subtitle ? `${block.title}. ${block.subtitle}` : block.title} />
          </div>
        </div>
      ) : (
        <div className="text-center">
          {block.kicker && (
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{block.kicker}</p>
          )}
          <div className="mt-2 flex items-center justify-center gap-3">
            <h1 className="text-4xl font-black sm:text-5xl" style={{ color: 'var(--unified-accent)' }}>{block.title}</h1>
            <HearButton text={block.subtitle ? `${block.title}. ${block.subtitle}` : block.title} />
          </div>
        </div>
      );
    case 'vocab_solo':
      return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          {block.image && (
            <div className="relative bg-slate-50">
              <img src={block.image} alt="" className="mx-auto h-64 w-auto max-w-full object-contain sm:h-72" />
              <div
                className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-2.5 text-white"
                style={{ backgroundColor: 'var(--unified-accent)' }}
              >
                <span className="text-lg font-black">{block.word}</span>
                <HearButton text={`${block.word}. ${block.definition}`} size="sm" />
              </div>
            </div>
          )}
          <div className="p-4">
            {!block.image && (
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-xl font-black text-slate-800">{block.word}</span>
                <HearButton text={`${block.word}. ${block.definition}`} />
              </div>
            )}
            <p className="text-slate-600">{block.definition}</p>
          </div>
        </div>
      );
    case 'phonics_focus':
      return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          {block.image && (
            <div className="relative bg-slate-50">
              <img src={block.image} alt="" className="mx-auto h-48 w-auto max-w-full object-contain sm:h-56" />
              <div
                className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-2.5 text-white"
                style={{ backgroundColor: 'var(--unified-accent)' }}
              >
                <span className="text-2xl font-black">/{block.sound}/</span>
                <PhonicsHearButton src={block.audio} label={block.sound} />
              </div>
            </div>
          )}
          <div className="p-4">
            {!block.image && (
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-xl font-black text-slate-800">/{block.sound}/</span>
                <PhonicsHearButton src={block.audio} label={block.sound} />
              </div>
            )}
            <p className="text-slate-600">{block.examples.join(', ')}</p>
          </div>
        </div>
      );
    case 'storybook':
      return <StorybookView block={block} />;
    case 'lesson_summary':
      return (
        <div className="rounded-3xl bg-white/95 p-7 text-center shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
          <h2 className="text-3xl font-black" style={{ color: 'var(--unified-accent)' }}>{block.title}</h2>
          <ul className="mx-auto mt-4 max-w-md space-y-2 text-left">
            {block.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 px-4 py-2 text-slate-700">
                <span className="flex-1">✓ {b}</span>
                <HearButton text={b} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

/**
 * Reveals one story page at a time instead of dumping the whole story as a
 * wall of text — matches Playground's page-by-page storybook pacing and
 * keeps a beginner from being overwhelmed by three paragraphs at once.
 *
 * No enclosing card/frame — the page text floats as a speech bubble near
 * the top of the scene, like dialogue coming from the illustrated
 * character, not a text box laid over the picture.
 */
function StorybookView({ block }: { block: Extract<UnifiedMoment['blocks'][number], { type: 'storybook' }> }) {
  const [page, setPage] = useState(0);
  const isLastPage = page >= block.pages.length - 1;
  const current = block.pages[page];

  return (
    <div>
      <p className="mb-3 text-center">
        <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow backdrop-blur-sm">
          {block.title} · Page {page + 1}/{block.pages.length}
        </span>
      </p>
      <motion.div key={page} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm">
        <div className="flex items-start gap-2 rounded-3xl rounded-bl-md bg-white px-5 py-4 shadow-xl">
          <p className="flex-1 text-base font-bold text-slate-800">{current.text}</p>
          <HearButton text={current.text} size="sm" />
        </div>
      </motion.div>
      {!isLastPage && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="mx-auto mt-4 block rounded-full px-6 py-2.5 text-sm font-black text-white shadow-lg"
          style={{ backgroundColor: 'var(--unified-accent)' }}
        >
          Next page →
        </button>
      )}
    </div>
  );
}

export function PresentationSection({
  moment,
  onNext,
  onBack,
  isFirst,
  isLast,
  pageLabel,
}: {
  moment: UnifiedMoment;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  pageLabel: string;
}) {
  const theme = useHubTheme();
  const introBlock = moment.blocks.find((b) => b.type === 'intro');
  const sceneImage = moment.sceneImageUrl ?? (introBlock?.type === 'intro' ? introBlock.heroImageUrl : undefined);
  // A cover-page moment (just the intro block, nothing else) centers its
  // title in the scene instead of hugging the top — it's not competing
  // with characters the way a bubble/card would.
  const isCoverPage = moment.blocks.length === 1 && moment.blocks[0].type === 'intro';

  const blocksOnly = (
    <div className="mx-auto flex max-w-2xl flex-col gap-5" style={{ ['--unified-accent' as string]: theme.accent }}>
      {moment.blocks.map((block, i) => (
        <BlockView key={i} block={block} hasScene={!!sceneImage} />
      ))}
    </div>
  );

  const scene = !sceneImage ? (
    blocksOnly
  ) : (
    <div
      className={`relative flex min-h-[75vh] flex-col overflow-hidden rounded-3xl shadow-lg ${isCoverPage ? 'justify-center' : ''}`}
    >
      <img src={sceneImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.25) 100%)' }} />
      {/* Content hugs the top of the scene, in the sky/background band above
          where illustrated characters are framed, so bubbles/cards read as
          speech coming from above them instead of covering their faces
          (cover pages are the exception — centered, see isCoverPage). */}
      <div className={`relative px-4 sm:px-8 ${isCoverPage ? 'py-10' : 'pb-10 pt-8'}`}>{blocksOnly}</div>
    </div>
  );

  return (
    <div>
      {scene}
      <NavFooter
        onBack={onBack}
        backDisabled={isFirst}
        onNext={onNext}
        nextLabel={isLast ? 'Finish ✨' : 'Next →'}
        pageLabel={pageLabel}
        accent={theme.accent}
        accent2={theme.accent2}
      />
    </div>
  );
}
