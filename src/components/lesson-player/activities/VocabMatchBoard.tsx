/**
 * VocabMatchBoard — whole-vocab matching board.
 *
 * One slide renders the ENTIRE target-vocab set as a board with three modes:
 *   - word_image:  left column = word tiles, right column = image tiles
 *   - audio_image: left column = 🔊 audio tiles, right column = image tiles
 *   - audio_word:  left column = 🔊 audio tiles, right column = word tiles
 *
 * Interaction is hub-aware:
 *   - playground → tap-tap (tap left, then tap right) — easier motor.
 *   - academy / success → drag-line (drag from left handle to right).
 *
 * Learner must pair EVERY item before the slide is considered complete.
 * Per-pair feedback (green check / red shake) is immediate; mismatches reset.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Volume2, XCircle } from 'lucide-react';
import { playSlideAudio } from '@/lib/playSlideAudio';
import { cn } from '@/lib/utils';

export type VocabMatchMode = 'word_image' | 'audio_image' | 'audio_word';

export interface VocabPair {
  id: string;
  word: string;
  definition?: string;
  image_url?: string | null;
  image_prompt?: string;
  audio_url?: string | null;
  audio_prompt?: string;
}

interface Slide {
  activityType?: string;
  mode?: VocabMatchMode;
  instruction?: string;
  pairs?: VocabPair[];
  vocab?: VocabPair[];
  hub?: 'playground' | 'academy' | 'success' | 'professional';
}

interface Props {
  slide: any;
  hub?: 'playground' | 'academy' | 'success' | 'professional';
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onComplete?: () => void;
}

const HUB_ACCENT: Record<string, string> = {
  playground: 'bg-orange-500 text-white border-orange-600',
  academy:    'bg-violet-600 text-white border-violet-700',
  success:    'bg-emerald-600 text-white border-emerald-700',
  professional: 'bg-emerald-600 text-white border-emerald-700',
};

function shuffleDeterministic<T>(arr: T[], seed: string): T[] {
  // Deterministic LCG-based shuffle so re-renders don't reorder mid-game.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabMatchBoard({ slide, hub = 'playground', onCorrect, onIncorrect, onComplete }: Props) {
  const mode: VocabMatchMode = (slide.mode ?? 'word_image') as VocabMatchMode;
  const pairs: VocabPair[] = (slide.pairs ?? slide.vocab ?? []).filter(Boolean);
  const accent = HUB_ACCENT[hub] ?? HUB_ACCENT.playground;
  const interactionMode: 'tap' | 'drag' = hub === 'playground' ? 'tap' : 'drag';

  // Stable shuffled right column.
  const seed = useMemo(() => pairs.map((p) => p.id ?? p.word).join('|'), [pairs]);
  const rightOrder = useMemo(() => shuffleDeterministic(pairs, seed + 'R'), [pairs, seed]);

  const [matched, setMatched] = useState<Record<string, true>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ leftId: string; rightId: string; ok: boolean } | null>(null);
  const completeFiredRef = useRef(false);

  const allDone = pairs.length > 0 && Object.keys(matched).length === pairs.length;

  useEffect(() => {
    if (allDone && !completeFiredRef.current) {
      completeFiredRef.current = true;
      onComplete?.();
    }
  }, [allDone, onComplete]);

  const playAudio = (p: VocabPair) => {
    if (p.audio_url) {
      const a = new Audio(p.audio_url);
      a.play().catch(() => {});
      return;
    }
    // Fallback: speak via shared helper using audio_prompt / word as TTS text.
    try { playSlideAudio({ voice: { text: p.audio_prompt ?? p.word, autoPlay: true } } as any); } catch { /* noop */ }
  };

  const attemptMatch = (leftId: string, rightId: string) => {
    const ok = leftId === rightId;
    setFlash({ leftId, rightId, ok });
    if (ok) {
      setMatched((m) => ({ ...m, [leftId]: true }));
      onCorrect?.();
    } else {
      onIncorrect?.();
    }
    setSelectedLeft(null);
    window.setTimeout(() => setFlash(null), 600);
  };

  const onLeftTap = (id: string) => {
    if (matched[id]) return;
    if (interactionMode !== 'tap') return;
    setSelectedLeft((cur) => (cur === id ? null : id));
  };
  const onRightTap = (id: string) => {
    if (matched[id]) return;
    if (interactionMode !== 'tap') return;
    if (!selectedLeft) return;
    attemptMatch(selectedLeft, id);
  };

  // Drag handlers (academy / success).
  const onLeftDragStart = (e: React.DragEvent, id: string) => {
    if (matched[id]) return;
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onRightDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onRightDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (matched[id]) return;
    const leftId = e.dataTransfer.getData('text/plain');
    if (leftId) attemptMatch(leftId, id);
  };

  const renderLeftContent = (p: VocabPair) => {
    if (mode === 'audio_image' || mode === 'audio_word') {
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); playAudio(p); }}
          className="flex items-center gap-2 text-base font-semibold"
          aria-label={`Play audio for ${p.word}`}
        >
          <Volume2 className="h-6 w-6" />
          <span className="text-sm opacity-70">Listen</span>
        </button>
      );
    }
    // word_image
    return <div className="text-lg font-bold tracking-tight">{p.word}</div>;
  };

  const renderRightContent = (p: VocabPair) => {
    if (mode === 'audio_word' || mode === 'word_image') {
      // word_image right side shows IMAGES; audio_word right side shows WORDS
      if (mode === 'audio_word') {
        return <div className="text-lg font-bold tracking-tight">{p.word}</div>;
      }
      return p.image_url ? (
        <img src={p.image_url} alt={p.word} className="w-full h-24 object-contain rounded-lg" />
      ) : (
        <div className="w-full h-24 grid place-items-center text-xs text-muted-foreground bg-muted rounded-lg">
          {p.word}
        </div>
      );
    }
    // audio_image → images on right
    return p.image_url ? (
      <img src={p.image_url} alt={p.word} className="w-full h-24 object-contain rounded-lg" />
    ) : (
      <div className="w-full h-24 grid place-items-center text-xs text-muted-foreground bg-muted rounded-lg">
        {p.word}
      </div>
    );
  };

  if (!pairs.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No vocabulary pairs available for this board.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      <header className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight" data-early-text>
          {slide.instruction ?? (mode === 'word_image' ? 'Match the word with the picture' :
                                  mode === 'audio_image' ? 'Tap 🔊, then tap the matching picture' :
                                  'Tap 🔊, then tap the matching word')}
        </h2>
        <p className="text-sm text-muted-foreground" data-early-text>
          {Object.keys(matched).length} / {pairs.length} matched
          {interactionMode === 'drag' ? ' · drag to pair' : ' · tap to pair'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* LEFT column — original order */}
        <div className="space-y-2 sm:space-y-3">
          {pairs.map((p) => {
            const isMatched = !!matched[p.id ?? p.word];
            const isSelected = selectedLeft === (p.id ?? p.word);
            const flashing = flash?.leftId === (p.id ?? p.word);
            return (
              <button
                key={`L-${p.id ?? p.word}`}
                type="button"
                draggable={interactionMode === 'drag' && !isMatched}
                onDragStart={(e) => onLeftDragStart(e, p.id ?? p.word)}
                onClick={() => onLeftTap(p.id ?? p.word)}
                className={cn(
                  'w-full min-h-[72px] rounded-2xl border-2 px-3 py-2 flex items-center justify-center transition-all',
                  'bg-card text-card-foreground shadow-sm',
                  isMatched && 'opacity-60 bg-emerald-50 border-emerald-400 dark:bg-emerald-950/30',
                  isSelected && !isMatched && accent,
                  flashing && flash?.ok && 'border-emerald-500 ring-4 ring-emerald-300',
                  flashing && !flash?.ok && 'border-red-500 ring-4 ring-red-300 animate-shake',
                )}
                disabled={isMatched}
              >
                {renderLeftContent(p)}
                {isMatched && <CheckCircle2 className="h-5 w-5 text-emerald-600 ml-2" />}
              </button>
            );
          })}
        </div>

        {/* RIGHT column — shuffled */}
        <div className="space-y-2 sm:space-y-3">
          {rightOrder.map((p) => {
            const isMatched = !!matched[p.id ?? p.word];
            const flashing = flash?.rightId === (p.id ?? p.word);
            return (
              <button
                key={`R-${p.id ?? p.word}`}
                type="button"
                onDragOver={onRightDragOver}
                onDrop={(e) => onRightDrop(e, p.id ?? p.word)}
                onClick={() => onRightTap(p.id ?? p.word)}
                className={cn(
                  'w-full min-h-[96px] rounded-2xl border-2 px-2 py-2 flex items-center justify-center transition-all',
                  'bg-card text-card-foreground shadow-sm',
                  isMatched && 'opacity-60 bg-emerald-50 border-emerald-400 dark:bg-emerald-950/30',
                  selectedLeft && !isMatched && 'ring-2 ring-offset-1 ring-primary/40',
                  flashing && flash?.ok && 'border-emerald-500 ring-4 ring-emerald-300',
                  flashing && !flash?.ok && 'border-red-500 ring-4 ring-red-300 animate-shake',
                )}
                disabled={isMatched}
              >
                {renderRightContent(p)}
                {isMatched && <CheckCircle2 className="h-5 w-5 text-emerald-600 ml-2" />}
                {flashing && !flash?.ok && <XCircle className="h-5 w-5 text-red-500 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {allDone && (
        <div className="text-center py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold">
          🎉 All matched!
        </div>
      )}
    </div>
  );
}
