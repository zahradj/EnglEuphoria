/**
 * MeaningMaze — 4-choice definition MCQ.
 *
 * Shows the headword; learner picks the correct definition among 3 distractors
 * drawn deterministically from the other target words in the same lesson
 * (so distractors stay in-topic — Cambridge coherence). One round per word.
 */

import { useMemo, useState, useEffect } from 'react';
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

function pickDistractors(
  correctWord: string,
  pool: VocabTarget[],
  seed: number,
): string[] {
  const others = pool.filter((t) => t.word !== correctWord && t.definition);
  if (others.length === 0) return [];
  const out: string[] = [];
  let s = seed || 1;
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < 3 && guard < 20 && seen.size < others.length) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const t = others[s % others.length];
    if (!seen.has(t.word)) {
      seen.add(t.word);
      out.push(t.definition!);
    }
    guard++;
  }
  return out;
}

export interface MeaningMazeProps {
  targets: VocabTarget[];
  hub: Hub;
  seedKey: string;
  cefr?: Cefr;
  onEvent?: (e: Omit<VocabGameEvent, 'game'>) => void;
  onDone?: (summary: { correct: number; total: number; ms: number }) => void;
}

export default function MeaningMaze({
  targets,
  hub,
  seedKey,
  cefr,
  onEvent,
  onDone,
}: MeaningMazeProps) {
  const theme = HUB_THEMES[hub];
  const playable = useMemo(
    () => targets.filter((t) => t.word && t.definition).slice(0, 6),
    [targets],
  );

  const rounds = useMemo(() => {
    return playable.map((t, i) => {
      const seed = hashString(`${seedKey}|${t.word}|${i}`);
      const distractors = pickDistractors(t.word, playable, seed);
      const options = [t.definition!, ...distractors];
      // Deterministic shuffle
      const seeded = options.map((opt, idx) => ({
        opt,
        k: hashString(`${seed}|${idx}`),
      }));
      seeded.sort((a, b) => a.k - b.k);
      return {
        word: t.word,
        options: seeded.map((x) => x.opt),
        answer: t.definition!,
      };
    });
  }, [playable, seedKey]);

  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const intel = useVocabGameIntelligence({ cefr, words: rounds.map((r) => r.word) });

  useEffect(() => {
    if (rounds.length > 0 && idx >= rounds.length) {
      onDone?.({ correct, total: rounds.length, ms: Date.now() - startedAt });
    }
  }, [idx, rounds.length, correct, startedAt, onDone]);

  if (rounds.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Need vocab targets with definitions to play Meaning Maze.
      </div>
    );
  }
  if (idx >= rounds.length) return null;

  const round = rounds[idx];
  const isDone = locked !== null;

  const choose = (opt: string) => {
    if (locked) return;
    const isCorrect = opt === round.answer;
    const ms = Date.now() - startedAt;
    setLocked(opt);
    if (isCorrect) {
      setCorrect((n) => n + 1);
      intel.onCorrect(round.word, ms);
    } else {
      intel.onWrong(round.word, opt, round.answer, ms);
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
    }, 900);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="text-xs uppercase tracking-wide opacity-70">
        {idx + 1} / {rounds.length}
      </div>
      <div
        className="text-3xl font-bold text-center py-6 rounded-xl"
        style={{
          background: `hsl(${theme['--vg-primary']} / 0.08)`,
          color: `hsl(${theme['--vg-primary']})`,
          borderRadius: theme['--vg-radius'],
        }}
      >
        {round.word}
      </div>
      <div className="grid gap-3">
        {round.options.map((opt) => {
          const isPicked = locked === opt;
          const isRight = opt === round.answer;
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
              className="text-left px-4 py-3 transition-all"
              style={{
                background: bg,
                color,
                border: `2px solid hsl(${theme['--vg-primary']} / 0.2)`,
                borderRadius: theme['--vg-radius'],
                cursor: isDone ? 'default' : 'pointer',
                fontSize: '0.95rem',
                lineHeight: 1.35,
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
