/**
 * SoundMatch — audio ↔ word match.
 *
 * Learner hears a word (Web Speech API, en-US), taps the matching card among
 * 4 options. Distractors come deterministically from the other targets in the
 * lesson (in-topic distractors → Cambridge coherence). No typing, no text-only
 * cues — this is a listening drill.
 *
 * Falls back gracefully when SpeechSynthesis is unavailable (e.g. some
 * headless environments) by showing a "listen" placeholder and treating the
 * round as skipped.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { Cefr, VocabGameEvent, VocabTarget, Hub } from '../types';
import { HUB_THEMES } from '../theme';
import { useVocabGameIntelligence } from '@/games/intelligence/useVocabGameIntelligence';

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function pickOptions(word: string, pool: VocabTarget[], seed: number): string[] {
  const others = pool.map((t) => t.word).filter((w) => w && w !== word);
  const out = [word];
  let s = seed || 1;
  const seen = new Set<string>([word]);
  let guard = 0;
  while (out.length < 4 && guard < 40 && seen.size < others.length + 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const w = others[s % others.length];
    if (!seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
    guard++;
  }
  const seeded = out.map((opt, idx) => ({ opt, k: hashString(`${seed}|${idx}`) }));
  seeded.sort((a, b) => a.k - b.k);
  return seeded.map((x) => x.opt);
}

function speak(word: string) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export interface SoundMatchProps {
  targets: VocabTarget[];
  hub: Hub;
  seedKey: string;
  cefr?: Cefr;
  onEvent?: (e: Omit<VocabGameEvent, 'game'>) => void;
  onDone?: (summary: { correct: number; total: number; ms: number }) => void;
}

export default function SoundMatch({
  targets,
  hub,
  seedKey,
  cefr,
  onEvent,
  onDone,
}: SoundMatchProps) {
  const theme = HUB_THEMES[hub];
  const playable = useMemo(() => targets.filter((t) => t.word).slice(0, 6), [targets]);

  const rounds = useMemo(
    () =>
      playable.map((t, i) => {
        const seed = hashString(`${seedKey}|${t.word}|${i}`);
        return { word: t.word, options: pickOptions(t.word, playable, seed) };
      }),
    [playable, seedKey],
  );

  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const spokeFor = useRef<number>(-1);
  const intel = useVocabGameIntelligence({ cefr, words: rounds.map((r) => r.word) });

  // Auto-play word on round change.
  useEffect(() => {
    if (idx < rounds.length && spokeFor.current !== idx) {
      spokeFor.current = idx;
      const w = rounds[idx].word;
      // Slight delay so the DOM/gesture context is ready.
      const id = window.setTimeout(() => speak(w), 200);
      return () => window.clearTimeout(id);
    }
  }, [idx, rounds]);

  useEffect(() => {
    if (rounds.length > 0 && idx >= rounds.length) {
      onDone?.({ correct, total: rounds.length, ms: Date.now() - startedAt });
    }
  }, [idx, rounds.length, correct, startedAt, onDone]);

  if (rounds.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Need vocab targets to play Sound Match.
      </div>
    );
  }
  if (idx >= rounds.length) return null;

  const round = rounds[idx];
  const isDone = locked !== null;

  const choose = (opt: string) => {
    if (locked) return;
    const isCorrect = opt === round.word;
    const ms = Date.now() - startedAt;
    setLocked(opt);
    if (isCorrect) {
      setCorrect((n) => n + 1);
      intel.onCorrect(round.word, ms);
    } else {
      intel.onWrong(round.word, opt, round.word, ms);
    }
    onEvent?.({
      round_index: idx,
      correct: isCorrect,
      target_word: round.word,
      ms_elapsed: ms,
    });
    window.setTimeout(() => {
      setLocked(null);
      setIdx((n) => n + 1);
    }, 900);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="text-xs uppercase tracking-wide opacity-70">
        {idx + 1} / {rounds.length}
      </div>

      <button
        type="button"
        onClick={() => speak(round.word)}
        className="mx-auto flex items-center gap-3 px-6 py-5 rounded-2xl font-semibold text-lg"
        style={{
          background: `hsl(${theme['--vg-primary']})`,
          color: 'white',
          borderRadius: theme['--vg-radius'],
        }}
        aria-label="Play word audio"
      >
        <Volume2 className="h-6 w-6" />
        Tap to hear
      </button>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map((opt) => {
          const isPicked = locked === opt;
          const isRight = opt === round.word;
          let bg = `hsl(${theme['--vg-card']})`;
          let color = `hsl(${theme['--vg-text']})`;
          if (isDone && isRight) {
            bg = `hsl(${theme['--vg-correct']})`;
            color = 'white';
          } else if (isPicked && !isRight) {
            bg = `hsl(${theme['--vg-wrong']})`;
            color = 'white';
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={isDone}
              onClick={() => choose(opt)}
              className="px-4 py-4 font-semibold transition-all"
              style={{
                background: bg,
                color,
                border: `2px solid hsl(${theme['--vg-primary']} / 0.2)`,
                borderRadius: theme['--vg-radius'],
                cursor: isDone ? 'default' : 'pointer',
                fontSize: '1.05rem',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
