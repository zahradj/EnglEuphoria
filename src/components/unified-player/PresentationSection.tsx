/**
 * Renders a `mode: 'presentation'` UnifiedMoment — the PPP-style beats
 * (intro, vocab/phonics discovery, storybook, reward summary) using the
 * existing 9 LessonBlock kinds from src/game-runtime/engine/types.ts.
 *
 * Full-screen slide shell: the slide content fills the whole viewport (no
 * floating card, no page margin), with the Back/Next bar pinned to the
 * bottom as its own strip. Images are full-bleed backgrounds with a
 * floating caption, not small inset pictures.
 *
 * True Pre-A1 beginners often can't reliably decode English text yet — a
 * page of written vocabulary/story content isn't accessible on its own. So
 * every text block gets a "hear it" speaker button (usePlaygroundAudio's
 * playVoice, the same static-cache-with-live-fallback hook every other
 * Playground game already uses) — nothing here is text-only.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';
import type { UnifiedMoment } from '@/unified-lessons/types';
import { useHubTheme } from './HubTheme';
import { NavFooter } from './NavFooter';
import { SlideFrame } from './SlideFrame';
import logoWhite from '@/assets/logo-white.png';

/** A vocabulary color that reads as "tappable" against both a white bubble
 * and a photo backdrop — distinct from the hub accent so it never gets
 * mistaken for a themed UI element. */
const VOCAB_COLOR = '#e11d48';

function HearButton({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
  const { playVoice } = usePlaygroundAudio();
  const dim = size === 'sm' ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base';
  return (
    <button
      type="button"
      onClick={() => playVoice(text)}
      aria-label={`Hear: ${text}`}
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow ${dim}`}
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
function PhonicsHearButton({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <button
      type="button"
      onClick={() => new Audio(src).play().catch(() => {})}
      aria-label="Hear the sound"
      className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow"
    >
      🔊
    </button>
  );
}

type Block = UnifiedMoment['blocks'][number];

/** Renders one block as a full SlideFrame — title bar + contained content. */
function SlideForBlock({
  block,
  accent,
  accent2,
  sceneImage,
}: {
  block: Block;
  accent: string;
  accent2: string;
  /** The moment's own illustration (welcome/story/speaking/reward scenes) — shown as a contained picture, not moment-level background art. */
  sceneImage?: string;
}) {
  switch (block.type) {
    case 'intro': {
      const image = sceneImage ?? block.heroImageUrl;
      return (
        <SlideFrame
          kicker={block.kicker}
          title={block.title}
          accent={accent}
          accent2={accent2}
          image={image}
          large
          headerRight={
            <div className="flex flex-shrink-0 items-center gap-2">
              <img src={logoWhite} alt="EnglEuphoria" className="h-6 w-auto opacity-90 sm:h-8" />
              <HearButton text={block.subtitle ? `${block.title}. ${block.subtitle}` : block.title} />
            </div>
          }
        />
      );
    }
    case 'vocab_solo':
      // The word repeats here in the opaque caption card — the overlaid
      // title can lose contrast against a busy image, but this card is
      // always legible regardless of what's behind it.
      return (
        <SlideFrame title={block.word} accent={accent} accent2={accent2} image={block.image} headerRight={<HearButton text={`${block.word}. ${block.definition}`} />}>
          <div className="mx-auto max-w-xl rounded-2xl bg-white/95 px-6 py-5 shadow-xl backdrop-blur-sm">
            <div className="text-2xl font-black text-slate-800 sm:text-3xl">{block.word}</div>
            <p className="mt-2 text-lg text-slate-700">{block.definition}</p>
          </div>
        </SlideFrame>
      );
    case 'phonics_focus':
      return <PhonicsSlide block={block} accent={accent} />;
    case 'storybook':
      return <StorybookSlide block={block} accent={accent} accent2={accent2} sceneImage={sceneImage} />;
    case 'lesson_summary':
      return (
        <SlideFrame title={block.title} accent={accent} accent2={accent2} image={sceneImage}>
          <ul className="mx-auto max-h-[60vh] w-full max-w-xl space-y-2 overflow-y-auto rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm">
            {block.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-base text-slate-700">
                <span className="flex-1">✓ {b}</span>
                <HearButtonDark text={b} />
              </li>
            ))}
          </ul>
        </SlideFrame>
      );
    default:
      return null;
  }
}

const PHONICS_WORD_POSITIONS = [
  'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2', // N
  'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', // E
  'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2', // S
  'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', // W
];

/**
 * The sound itself is the whole point of a phonics card, so it sits huge
 * and centered in its own badge — not tucked into a small header label —
 * with its example words ringed around it (N/E/S/W) instead of listed as
 * a caption-card chip row underneath. Full-screen, no card frame.
 */
function PhonicsSlide({ block, accent }: { block: Extract<Block, { type: 'phonics_focus' }>; accent: string }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {block.image && (
        <>
          <img src={block.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      <div className="relative z-10 p-4 sm:p-8">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">Phonics</span>
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center px-16 pb-4 sm:px-32">
        <div className="relative h-40 w-40 sm:h-56 sm:w-56">
          <div
            className="grid h-full w-full place-items-center rounded-full bg-white shadow-2xl"
            style={{ boxShadow: `0 0 0 6px ${accent}, 0 20px 40px rgba(0,0,0,0.35)` }}
          >
            <span className="text-4xl font-black sm:text-6xl" style={{ color: accent }}>/{block.sound}/</span>
          </div>
          {block.examples.slice(0, 4).map((ex, i) => (
            <span
              key={i}
              className={`absolute whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-lg sm:text-base ${PHONICS_WORD_POSITIONS[i]}`}
            >
              {ex}
            </span>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center pb-6 sm:pb-10">
        <PhonicsHearButton src={block.audio} />
      </div>
    </div>
  );
}

/** Same as HearButton but tinted for use on light backgrounds (outside a title bar). */
function HearButtonDark({ text }: { text: string }) {
  const { playVoice } = usePlaygroundAudio();
  return (
    <button
      type="button"
      onClick={() => playVoice(text)}
      aria-label={`Hear: ${text}`}
      className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm text-slate-700 shadow"
    >
      🔊
    </button>
  );
}

/**
 * A moment with several vocab_solo or phonics_focus cards in a row used to
 * just stack them vertically, which forced scrolling to see them all. This
 * shows one full-screen slide at a time — tap the arrows or a dot to flip
 * through the deck.
 */
function FlashcardDeck({ blocks, accent, accent2 }: { blocks: Block[]; accent: string; accent2: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = blocks.length;

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)));
  };

  return (
    <div className="relative h-full w-full">
      {/* AnimatePresence stalled here — the index state advanced correctly
          but the exiting card's animation never resolved, so the new card
          never mounted. A plain enter-only motion.div (no AnimatePresence)
          sidesteps that; StorybookSlide uses the same pattern successfully. */}
      <div className="h-full w-full overflow-hidden">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          <SlideForBlock block={blocks[index]} accent={accent} accent2={accent2} />
        </motion.div>
      </div>
      <button
        type="button"
        onClick={() => go(-1)}
        disabled={index === 0}
        aria-label="Previous card"
        className="absolute left-3 top-1/2 z-20 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl font-black text-slate-700 ring-4 ring-white/40 transition hover:scale-110 active:translate-y-[calc(-50%+3px)] active:shadow-none disabled:opacity-0 sm:left-6"
        style={{ boxShadow: '0 5px 0 0 rgba(0,0,0,0.15)' }}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        disabled={index === total - 1}
        aria-label="Next card"
        className="absolute right-3 top-1/2 z-20 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl font-black text-slate-700 ring-4 ring-white/40 transition hover:scale-110 active:translate-y-[calc(-50%+3px)] active:shadow-none disabled:opacity-0 sm:right-6"
        style={{ boxShadow: '0 5px 0 0 rgba(0,0,0,0.15)' }}
      >
        ›
      </button>
      {/* Dot "tabs" — a solid white pill tray (not bare dots floating on
          whatever happens to be behind them) so they read as a deliberate
          UI control against either the image or the white caption card,
          with the active dot pulled out into a big pill the way a real
          game's page-tracker looks. */}
      <div className="absolute inset-x-0 bottom-4 z-20 mx-auto flex w-fit items-center justify-center gap-2 rounded-full bg-white px-3 py-2 shadow-lg ring-1 ring-black/5 sm:bottom-6">
        {blocks.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
            aria-label={`Go to card ${i + 1}`}
            className="h-3 rounded-full transition-all active:scale-90"
            style={{
              width: i === index ? '1.75rem' : '0.75rem',
              backgroundColor: i === index ? accent : '#e2e8f0',
            }}
          />
        ))}
      </div>
    </div>
  );
}

type VocabEntry = { word: string; definition: string };

/**
 * Splits a line of dialogue on its vocab words and renders each match as a
 * bold, underlined, colored, tappable span — everything else passes through
 * as plain text. Tapping calls `onPick` with that word's full entry so the
 * caller can pop the definition card.
 */
function renderWithVocab(text: string, vocab: VocabEntry[] | undefined, onPick: (v: VocabEntry) => void) {
  if (!vocab || vocab.length === 0) return text;
  const escaped = vocab.map((v) => v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));
  return parts.map((part, i) => {
    const match = vocab.find((v) => v.word.toLowerCase() === part.toLowerCase());
    if (!match) return <span key={i}>{part}</span>;
    return (
      <button
        key={i}
        type="button"
        onClick={() => onPick(match)}
        className="font-black underline decoration-2 underline-offset-2"
        style={{ color: VOCAB_COLOR }}
      >
        {part}
      </button>
    );
  });
}

/**
 * The card that pops when a vocabulary word is tapped mid-story — hears the
 * word immediately (the first "listen"), then offers "hear again" for the
 * repeat before the student closes it and the conversation continues.
 */
function VocabCard({ entry, onClose }: { entry: VocabEntry; onClose: () => void }) {
  const { playVoice } = usePlaygroundAudio();
  useEffect(() => {
    playVoice(entry.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.word]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: VOCAB_COLOR }}>
          Vocabulary
        </div>
        <div className="mt-1 text-3xl font-black text-slate-800">{entry.word}</div>
        <p className="mt-2 text-slate-600">{entry.definition}</p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => playVoice(entry.word)}
            className="rounded-2xl px-5 py-2.5 text-sm font-black text-white transition active:translate-y-1 active:shadow-none"
            style={{ backgroundColor: VOCAB_COLOR, boxShadow: '0 4px 0 0 #9f1239' }}
          >
            🔊 Hear again
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-700 transition active:translate-y-1 active:shadow-none"
            style={{ boxShadow: '0 4px 0 0 #e2e8f0' }}
          >
            🗣️ I repeated it
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A story to read AND listen-and-repeat, not just read — each page must be
 * heard (🔊) and confirmed repeated (🗣️) before "Next page" unlocks, the
 * same hear-then-repeat gating ListenRepeatGame already uses elsewhere in
 * this lesson. Reveals one page at a time so a beginner isn't overwhelmed
 * by the whole story as a wall of text.
 *
 * Two rendering modes, chosen by whether any page names a `speaker`:
 * - Conversation mode (the real Playground story-scene pattern — see
 *   welcome-town/SceneRenderer.tsx's RoleplayScene): one full-bleed speech
 *   bubble at a time, anchored left/right by who's talking, with any
 *   bolded vocab words inside it tappable.
 * - Legacy mode (no page has a speaker): the original single centered
 *   caption card, so already-authored content with no speaker field keeps
 *   rendering exactly as before.
 */
function StorybookSlide({
  block,
  accent,
  accent2,
  sceneImage,
}: {
  block: Extract<Block, { type: 'storybook' }>;
  accent: string;
  accent2: string;
  sceneImage?: string;
}) {
  const theme = useHubTheme();
  const { playVoice } = usePlaygroundAudio();
  const [page, setPage] = useState(0);
  const [heard, setHeard] = useState(false);
  const [repeated, setRepeated] = useState(false);
  const [openVocab, setOpenVocab] = useState<VocabEntry | null>(null);
  const isLastPage = page >= block.pages.length - 1;
  const current = block.pages[page];
  const isConversation = block.pages.some((p) => p.speaker);

  // Stable left/right assignment: the first distinct speaker encountered
  // (reading the whole script, not just pages seen so far) sits on the
  // left, the second on the right — so a character doesn't jump sides if
  // they happen to speak first on a later page than their scene partner.
  const speakerOrder = useMemo(() => {
    const seen: string[] = [];
    for (const p of block.pages) {
      if (p.speaker && !seen.includes(p.speaker)) seen.push(p.speaker);
    }
    return seen;
  }, [block.pages]);

  const goToPage = (p: number) => {
    setPage(p);
    setHeard(false);
    setRepeated(false);
  };

  const hear = () => {
    playVoice(current.text);
    setHeard(true);
  };

  if (!isConversation) {
    return (
      <SlideFrame kicker={`Page ${page + 1} / ${block.pages.length}`} title={block.title} accent={accent} accent2={accent2} image={sceneImage}>
        <motion.div key={page} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-2xl bg-white/95 px-6 py-5 shadow-xl backdrop-blur-sm">
          <p className="text-xl font-bold text-slate-800">{renderWithVocab(current.text, current.vocab, setOpenVocab)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={hear}
              className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-black text-white transition hover:scale-105 active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: accent, boxShadow: `0 4px 0 0 ${accent2}` }}
            >
              🔊 Hear it
            </button>
            <button
              type="button"
              onClick={() => setRepeated(true)}
              disabled={!heard}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-700 transition active:translate-y-1 active:shadow-none disabled:opacity-40"
              style={{ boxShadow: '0 4px 0 0 #e2e8f0' }}
            >
              🗣️ I said it
            </button>
            {!isLastPage ? (
              <button
                onClick={() => goToPage(page + 1)}
                disabled={!repeated}
                className="rounded-2xl px-5 py-2.5 text-sm font-black text-white transition active:translate-y-1 active:shadow-none disabled:opacity-40"
                style={{ backgroundColor: accent, boxShadow: `0 4px 0 0 ${accent2}` }}
              >
                Next page →
              </button>
            ) : (
              repeated && <span className="font-bold text-green-600">🎉 Great reading!</span>
            )}
          </div>
        </motion.div>
        {openVocab && <VocabCard entry={openVocab} onClose={() => setOpenVocab(null)} />}
      </SlideFrame>
    );
  }

  const side = !current.speaker ? 'center' : speakerOrder.indexOf(current.speaker) % 2 === 0 ? 'left' : 'right';
  const justify = side === 'left' ? 'justify-start' : side === 'right' ? 'justify-end' : 'justify-center';
  const bgImage = current.image ?? sceneImage;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={bgImage ? undefined : { backgroundImage: theme.slideBackground }}>
      {bgImage && (
        <>
          <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.05) 32%, rgba(15,23,42,0.05) 60%, rgba(15,23,42,0.65) 100%)' }}
          />
        </>
      )}
      <div className="relative z-10 flex-shrink-0 p-4 sm:p-8">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
          {block.title} · {page + 1} / {block.pages.length}
        </span>
      </div>
      <div className={`relative z-10 flex flex-1 items-center px-4 sm:px-10 ${justify}`}>
        <motion.div
          key={page}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[85%] rounded-3xl bg-white px-5 py-4 text-left shadow-2xl sm:max-w-md sm:px-6 sm:py-5"
        >
          {current.speaker && <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">{current.speaker}</div>}
          <p className="text-xl font-bold text-slate-800 sm:text-2xl">
            &ldquo;{renderWithVocab(current.text, current.vocab, setOpenVocab)}&rdquo;
          </p>
        </motion.div>
      </div>
      <div className="relative z-10 flex flex-shrink-0 flex-wrap items-center justify-center gap-2 p-4 sm:p-6">
        <button
          type="button"
          onClick={hear}
          className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-black text-white transition hover:scale-105 active:translate-y-1 active:shadow-none"
          style={{ backgroundColor: accent, boxShadow: `0 4px 0 0 ${accent2}` }}
        >
          🔊 Hear it
        </button>
        <button
          type="button"
          onClick={() => setRepeated(true)}
          disabled={!heard}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition active:translate-y-1 active:shadow-none disabled:opacity-40"
          style={{ boxShadow: '0 4px 0 0 #e2e8f0' }}
        >
          🗣️ I said it
        </button>
        {!isLastPage ? (
          <button
            onClick={() => goToPage(page + 1)}
            disabled={!repeated}
            className="rounded-2xl px-5 py-2.5 text-sm font-black text-white transition active:translate-y-1 active:shadow-none disabled:opacity-40"
            style={{ backgroundColor: accent, boxShadow: `0 4px 0 0 ${accent2}` }}
          >
            Next →
          </button>
        ) : (
          repeated && <span className="rounded-full bg-white/90 px-4 py-2 font-bold text-green-600 shadow">🎉 Great reading!</span>
        )}
      </div>
      {openVocab && <VocabCard entry={openVocab} onClose={() => setOpenVocab(null)} />}
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
  // Several vocab/phonics cards back to back used to just stack and force
  // scrolling — show them as a one-at-a-time flashcard deck instead.
  const isFlashcardDeck =
    moment.blocks.length > 1 &&
    (moment.blocks[0].type === 'vocab_solo' || moment.blocks[0].type === 'phonics_focus') &&
    moment.blocks.every((b) => b.type === moment.blocks[0].type);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {isFlashcardDeck ? (
          <FlashcardDeck blocks={moment.blocks} accent={theme.accent} accent2={theme.accent2} />
        ) : (
          moment.blocks.map((block, i) => (
            <SlideForBlock key={i} block={block} accent={theme.accent} accent2={theme.accent2} sceneImage={moment.sceneImageUrl} />
          ))
        )}
      </div>
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
