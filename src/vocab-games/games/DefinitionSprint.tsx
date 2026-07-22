/**
 * DefinitionSprint — typing-light rapid recall (Academy/Success only).
 *
 * Shows a definition; learner types the FIRST LETTER of the target word
 * within a 10s soft timer per round. First-letter recall keeps typing load
 * minimal (respects hub caps + PG anti-typing rule — this game is registered
 * only for Academy B1+ and Success). Deterministic round order via seedKey.
 *
 * Pedagogy (senior-ai-edtech-architect):
 *   - Retrieval-based (production > reception).
 *   - Bound to ReinforcementTarget words (in-topic).
 *   - No cross-lesson vocab, no Math.random.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
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

const ROUND_MS = 10_000;

export interface DefinitionSprintProps {
  targets: VocabTarget[];
  hub: Hub;
  seedKey: string;
  cefr?: Cefr;
  onEvent?: (e: Omit<VocabGameEvent, 'game'>) => void;
  onDone?: (summary: { correct: number; total: number; ms: number }) => void;
}

export default function DefinitionSprint({
  targets,
  hub,
  seedKey,
  cefr,
  onEvent,
  onDone,
}: DefinitionSprintProps) {
  const theme = HUB_THEMES[hub];

  const rounds = useMemo(() => {
    const playable = targets.filter((t) => t.word && t.definition).slice(0, 6);
    return playable
      .map((t, i) => ({ t, k: hashString(`${seedKey}|${t.word}|${i}`) }))
      .sort((a, b) => a.k - b.k)
      .map(({ t }) => ({
        word: t.word.trim().toLowerCase(),
        first: t.word.trim().toLowerCase().charAt(0),
        definition: t.definition!,
        example: t.example,
      }));
  }, [targets, seedKey]);

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [locked, setLocked] = useState<null | 'right' | 'wrong' | 'timeout'>(null);
  const [remaining, setRemaining] = useState(ROUND_MS);
  const startedAt = useRef(Date.now());
  const roundStartedAt = useRef(Date.now());
  const intel = useVocabGameIntelligence({ cefr, words: rounds.map((r) => r.word) });

  // Timer
  useEffect(() => {
    if (locked || idx >= rounds.length) return;
    roundStartedAt.current = Date.now();
    setRemaining(ROUND_MS);
    const id = window.setInterval(() => {
      const left = ROUND_MS - (Date.now() - roundStartedAt.current);
      if (left <= 0) {
        window.clearInterval(id);
        finalize('timeout');
      } else {
        setRemaining(left);
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, rounds.length, locked]);

  // Advance
  useEffect(() => {
    if (rounds.length > 0 && idx >= rounds.length) {
      onDone?.({ correct, total: rounds.length, ms: Date.now() - startedAt.current });
    }
  }, [idx, rounds.length, correct, onDone]);

  if (rounds.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        DefinitionSprint needs vocab targets with definitions.
      </div>
    );
  }
  if (idx >= rounds.length) return null;

  const round = rounds[idx];

  function finalize(outcome: 'right' | 'wrong' | 'timeout') {
    if (locked) return;
    setLocked(outcome);
    const isCorrect = outcome === 'right';
    const ms = Date.now() - startedAt.current;
    if (isCorrect) {
      setCorrect((n) => n + 1);
      intel.onCorrect(round.word, ms);
    } else {
      intel.onWrong(round.word, input || outcome, round.first, ms);
    }
    onEvent?.({
      round_index: idx,
      correct: isCorrect,
      target_word: round.word,
      ms_elapsed: ms,
    });
    window.setTimeout(() => {
      setLocked(null);
      setInput('');
      setIdx((n) => n + 1);
    }, 900);
  }

  const submit = () => {
    const v = input.trim().toLowerCase();
    if (!v) return;
    finalize(v.charAt(0) === round.first ? 'right' : 'wrong');
  };

  const pct = Math.max(0, remaining / ROUND_MS);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide opacity-70">
        <span>{idx + 1} / {rounds.length}</span>
        <span className="tabular-nums">{Math.ceil(remaining / 1000)}s</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: `hsl(${theme['--vg-primary']} / 0.15)` }}
      >
        <div
          className="h-full transition-[width] duration-100 linear"
          style={{ width: `${pct * 100}%`, background: `hsl(${theme['--vg-primary']})` }}
        />
      </div>

      <div
        className="text-base md:text-lg font-medium text-center py-6 px-5 rounded-xl leading-snug"
        style={{
          background: `hsl(${theme['--vg-primary']} / 0.08)`,
          color: `hsl(${theme['--vg-text']})`,
          borderRadius: theme['--vg-radius'],
        }}
      >
        {round.definition}
      </div>

      <div className="text-xs text-center opacity-60">
        Type the <b>first letter</b> of the word — then press Enter.
      </div>

      <div className="flex gap-2">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 1))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          disabled={!!locked}
          maxLength={1}
          className="flex-1 text-center text-3xl font-bold py-3 outline-none"
          style={{
            background: locked === 'right'
              ? `hsl(${theme['--vg-correct']} / 0.15)`
              : locked === 'wrong' || locked === 'timeout'
                ? `hsl(${theme['--vg-wrong']} / 0.15)`
                : `hsl(${theme['--vg-card']})`,
            color: `hsl(${theme['--vg-text']})`,
            border: `2px solid hsl(${theme['--vg-primary']} / 0.25)`,
            borderRadius: theme['--vg-radius'],
            textTransform: 'lowercase',
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!!locked || !input}
          className="px-5 font-semibold text-white disabled:opacity-40"
          style={{
            background: `hsl(${theme['--vg-primary']})`,
            borderRadius: theme['--vg-radius'],
          }}
        >
          Go
        </button>
      </div>

      {locked && locked !== 'right' && (
        <div className="text-xs text-center opacity-70">
          Answer started with <b>{round.first}</b> — {round.word}
        </div>
      )}
    </div>
  );
}
