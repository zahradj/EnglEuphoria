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

function BlockView({ block }: { block: UnifiedMoment['blocks'][number] }) {
  switch (block.type) {
    case 'intro':
      return (
        <div className="rounded-3xl bg-white/95 p-8 text-center shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-black sm:text-5xl" style={{ color: 'var(--unified-accent)' }}>{block.title}</h1>
            <HearButton text={block.subtitle ? `${block.title}. ${block.subtitle}` : block.title} />
          </div>
          {block.subtitle && <p className="mx-auto mt-3 max-w-md text-lg font-medium text-slate-600">{block.subtitle}</p>}
        </div>
      );
    case 'vocab_solo':
      return (
        <div className="overflow-hidden rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
          {block.image && (
            <img src={block.image} alt="" className="h-40 w-full object-cover sm:h-48" />
          )}
          <div className="flex items-start gap-3 p-5">
            <div className="flex-1">
              <div className="text-xl font-black text-slate-800">{block.word}</div>
              <p className="mt-1 text-slate-600">{block.definition}</p>
            </div>
            <HearButton text={`${block.word}. ${block.definition}`} />
          </div>
        </div>
      );
    case 'phonics_focus':
      return (
        <div className="flex items-start gap-3 rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
          <div className="flex-1">
            <div className="text-xl font-black text-slate-800">/{block.sound}/</div>
            <p className="mt-1 text-slate-600">{block.examples.join(', ')}</p>
          </div>
          <HearButton text={block.sound} />
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
  isLast,
}: {
  moment: UnifiedMoment;
  onNext: () => void;
  isLast: boolean;
}) {
  const theme = useHubTheme();
  const introBlock = moment.blocks.find((b) => b.type === 'intro');
  const sceneImage = moment.sceneImageUrl ?? (introBlock?.type === 'intro' ? introBlock.heroImageUrl : undefined);

  const content = (
    <div className="mx-auto flex max-w-2xl flex-col gap-5" style={{ ['--unified-accent' as string]: theme.accent }}>
      {moment.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
      <button
        onClick={onNext}
        className="mx-auto rounded-full px-10 py-4 text-lg font-black text-white shadow-md transition hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}
      >
        {isLast ? 'Finish ✨' : 'Continue →'}
      </button>
    </div>
  );

  if (!sceneImage) return content;

  return (
    <div className="relative flex min-h-[75vh] flex-col justify-center overflow-hidden rounded-3xl shadow-lg">
      <img src={sceneImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.55) 100%)' }} />
      <div className="relative px-4 py-10 sm:px-8">{content}</div>
    </div>
  );
}
