/**
 * WordRush — rapid recognition drill.
 *
 * Inverse of MeaningMaze: the DEFINITION is shown, learner taps the correct
 * WORD from 4 tiles. Retrieval-first (Cambridge: production > recognition of
 * meaning). Mild time pressure via a per-round countdown bar (12s), but no
 * hard timeout — CEFR-safe, bravery > speed. Deterministic distractors from
 * the same target pool (in-topic coherence).
 */

import { useMemo, useState, useEffect, useRef } from 'react';
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

function pickDistractors(correctWord: string, pool: VocabTarget[], seed: number): string[] {
  const others = pool.filter((t) => t.word && t.word !== correctWord);
  const out: string[] = [];
  const seen = new Set<string>();
  let s = seed || 1;
  let guard = 0;
  while (out.length < 3 && guard < 24 && seen.size < others.length) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const t = others[s % others.length];
    if (t && !seen.has(t.word)) {
      seen.add(t.word);
      out.push(t.word);
    }
    guard++;
  }
  return out;
}

export interface WordRushProps {
  targets: VocabTarget[];
  hub: Hub;
  seedKey: string;
  cefr?: Cefr;
  onEvent?: (e: Omit<VocabGameEvent, 'game'>) => void;
  onDone?: (summary: { correct: number; total: number; ms: number }) => void;
}

const ROUND_MS = 12000;

export default function WordRush({ targets, hub, seedKey, cefr, onEvent, onDone }: WordRushProps) {
  const theme = HUB_THEMES[hub];
  const playable = useMemo(
    () => targets.filter((t) => t.word && t.definition).slice(0, 6),
    [targets],
  );

  const rounds = useMemo(() => {
    return playable.map((t, i) => {
      const seed = hashString(`${seedKey}|rush|${t.word}|${i}`);
      const distractors = pickDistractors(t.word, playable, seed);
      const opts = [t.word, ...distractors];
      const seeded = opts.map((opt, idx) => ({ opt, k: hashString(`${seed}|${idx}`) }));
      seeded.sort((a, b) => a.k - b.k);
      return {
        word: t.word,
        definition: t.definition!,
        options: seeded.map((x) => x.opt),
      };
    });
  }, [playable, seedKey]);

  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [remaining, setRemaining] = useState(ROUND_MS);
  const [startedAt] = useState(() => Date.now());
  const roundStart = useRef(Date.now());
  const intel = useVocabGameIntelligence({ cefr, words: rounds.map((r) => r.word) });

  // Per-round countdown
  useEffect(() => {
    if (idx >= rounds.length || locked) return;
    roundStart.current = Date.now();
    setRemaining(ROUND_MS);
    const t = setInterval(() => {
      const left = ROUND_MS - (Date.now() - roundStart.current);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearInterval(t);
        // Time out = wrong, non-blocking
        onEvent?.({
          round_index: idx,
          correct: false,
          target_word: rounds[idx].word,
          ms_elapsed: Date.now() - startedAt,
        });
        setLocked('__timeout__');
        setTimeout(() => {
          setLocked(null);
          setIdx((n) => n + 1);
        }, 700);
      }
    }, 100);
    return () => clearInterval(t);
  }, [idx, locked, rounds, onEvent, startedAt]);

  useEffect(() => {
    if (rounds.length > 0 && idx >= rounds.length) {
      onDone?.({ correct, total: rounds.length, ms: Date.now() - startedAt });
    }
  }, [idx, rounds.length, correct, startedAt, onDone]);

  if (rounds.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Need vocab targets with definitions to play Word Rush.
      </div>
    );
  }
  if (idx >= rounds.length) return null;

  const round = rounds[idx];
  const done = locked !== null;

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
    setTimeout(() => {
      setLocked(null);
      setIdx((n) => n + 1);
    }, 800);
  };

  const pct = Math.max(0, Math.min(100, (remaining / ROUND_MS) * 100));

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide opacity-70">
        <span>{idx + 1} / {rounds.length}</span>
        <span>{Math.ceil(remaining / 1000)}s</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: `hsl(${theme['--vg-primary']} / 0.15)` }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            background: `hsl(${theme['--vg-primary']})`,
          }}
        />
      </div>
      <div
        className="text-lg font-medium text-center py-5 px-4 rounded-xl"
        style={{
          background: `hsl(${theme['--vg-primary']} / 0.08)`,
          color: `hsl(${theme['--vg-text']})`,
          borderRadius: theme['--vg-radius'],
          lineHeight: 1.4,
        }}
      >
        {round.definition}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {round.options.map((opt) => {
          const isPicked = locked === opt;
          const isRight = opt === round.word;
          let bg = `hsl(${theme['--vg-card']})`;
          let color = `hsl(${theme['--vg-text']})`;
          if (done && isRight) {
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
              disabled={done}
              onClick={() => choose(opt)}
              className="px-4 py-4 font-semibold transition-all"
              style={{
                background: bg,
                color,
                border: `2px solid hsl(${theme['--vg-primary']} / 0.2)`,
                borderRadius: theme['--vg-radius'],
                cursor: done ? 'default' : 'pointer',
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
