/**
 * MemoryGrid — deterministic card-flip memory game.
 *
 * Word ↔ definition pairs. Same seed → same layout (so a teacher previewing
 * the lesson sees exactly what the student will play). Compassionate feedback:
 * wrong pair flips back after 800ms with no red flash at Playground register.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import type { Cefr, VocabGameEvent, VocabTarget, Hub } from '../types';
import { HUB_THEMES } from '../theme';
import { useVocabGameIntelligence } from '@/games/intelligence/useVocabGameIntelligence';

interface Card {
  id: string;
  pairKey: string;
  face: 'word' | 'def';
  text: string;
  imageUrl?: string | null;
}

function shuffleDeterministic<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export interface MemoryGridProps {
  targets: VocabTarget[];
  hub: Hub;
  seedKey: string;
  cefr?: Cefr;
  onEvent?: (e: Omit<VocabGameEvent, 'game'>) => void;
  onDone?: (summary: { correct: number; total: number; ms: number }) => void;
}

export default function MemoryGrid({
  targets,
  hub,
  seedKey,
  cefr,
  onEvent,
  onDone,
}: MemoryGridProps) {
  const theme = HUB_THEMES[hub];
  const pairs = useMemo(
    () => targets.filter((t) => t.word && t.definition).slice(0, 6),
    [targets],
  );

  const cards = useMemo<Card[]>(() => {
    const seed = hashString(seedKey);
    const base: Card[] = [];
    for (const t of pairs) {
      base.push({
        id: `${t.word}-w`,
        pairKey: t.word,
        face: 'word',
        text: t.word,
        imageUrl: t.image_url ?? null,
      });
      base.push({
        id: `${t.word}-d`,
        pairKey: t.word,
        face: 'def',
        text: t.definition ?? '',
      });
    }
    return shuffleDeterministic(base, seed);
  }, [pairs, seedKey]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const intel = useVocabGameIntelligence({ cefr, words: pairs.map((p) => p.word) });

  useEffect(() => {
    if (matched.size === pairs.length * 2 && pairs.length > 0) {
      onDone?.({ correct, total: pairs.length, ms: Date.now() - startedAt });
    }
  }, [matched, pairs.length, correct, startedAt, onDone]);

  const onCardClick = useCallback(
    (card: Card) => {
      if (matched.has(card.id) || flipped.includes(card.id) || flipped.length === 2) return;
      const next = [...flipped, card.id];
      setFlipped(next);
      if (next.length === 2) {
        const [aId, bId] = next;
        const a = cards.find((c) => c.id === aId)!;
        const b = cards.find((c) => c.id === bId)!;
        const isMatch = a.pairKey === b.pairKey && a.face !== b.face;
        const ms = Date.now() - startedAt;
        setAttempts((n) => n + 1);
        onEvent?.({
          round_index: attempts,
          correct: isMatch,
          target_word: a.pairKey,
          ms_elapsed: ms,
        });
        if (isMatch) {
          setCorrect((n) => n + 1);
          intel.onCorrect(a.pairKey, ms);
          setTimeout(() => {
            setMatched((s) => new Set([...s, aId, bId]));
            setFlipped([]);
          }, 400);
        } else {
          intel.onWrong(a.pairKey, b.text, a.pairKey, ms);
          setTimeout(() => setFlipped([]), 800);
        }
      }
    },
    [flipped, matched, cards, attempts, startedAt, onEvent],
  );

  if (pairs.length < 2) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Need at least 2 vocab targets with definitions to play Memory Grid.
      </div>
    );
  }

  return (
    <div
      className="w-full grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${Math.min(4, cards.length)}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((c) => {
        const isFlipped = flipped.includes(c.id) || matched.has(c.id);
        const isMatched = matched.has(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onCardClick(c)}
            className="aspect-[3/2] rounded-xl text-center px-3 py-2 transition-all font-medium overflow-hidden flex flex-col items-center justify-center gap-1"
            style={{
              background: isFlipped
                ? `hsl(${isMatched ? theme['--vg-correct'] : theme['--vg-primary']})`
                : `hsl(${theme['--vg-card']})`,
              color: isFlipped ? 'white' : `hsl(${theme['--vg-text']})`,
              border: `2px solid hsl(${theme['--vg-primary']} / 0.25)`,
              borderRadius: theme['--vg-radius'],
              opacity: isMatched ? 0.65 : 1,
              cursor: isMatched ? 'default' : 'pointer',
              fontSize: c.face === 'word' ? '1.05rem' : '0.85rem',
              lineHeight: 1.25,
            }}
            aria-label={isFlipped ? c.text : 'hidden card'}
          >
            {isFlipped ? (
              c.face === 'word' && c.imageUrl ? (
                <>
                  <img
                    src={c.imageUrl}
                    alt={c.text}
                    className="max-h-[60%] w-auto object-contain rounded-md bg-white/90 p-1"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="font-semibold">{c.text}</span>
                </>
              ) : (
                <span>{c.text}</span>
              )
            ) : (
              '?'
            )}
          </button>
        );
      })}
    </div>
  );
}
